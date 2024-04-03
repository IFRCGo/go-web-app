import {
    Fragment,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    AnalyzingIcon,
    ArrowLeftLineIcon,
    CheckboxFillIcon,
    DownloadFillIcon,
} from '@ifrc-go/icons';
import {
    BlockLoading,
    Button,
    Container,
    Grid,
    Heading,
    InputSection,
    KeyFigure,
    Message,
    PieChart,
    ProgressBar,
    StackedProgressBar,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    numericCountSelector,
    numericIdSelector,
    stringLabelSelector,
    stringTitleSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import PerExportModal from '#components/PerExportModal';
import WikiLink from '#components/WikiLink';
import useRouting from '#hooks/useRouting';
import { getFormattedComponentName } from '#utils/common';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import DocumentCard from '../DocumentCard';
import PreviousAssessmentCharts from '../PreviousAssessmentChart';
import RatingByAreaChart from '../RatingByAreaChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerDocumentUploadResponse = GoApiResponse<'/api/v2/per-document-upload/'>;
type PerDocumentListItem = NonNullable<PerDocumentUploadResponse['results']>[number];

const MAX_PER_DOCUMENT_COUNT = 10;
const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-70)',
    'var(--go-ui-color-red-50)',
    'var(--go-ui-color-red-30)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function primaryRedColorShadeSelector(_: unknown, i: number) {
    return primaryRedColorShades[i];
}

// eslint-disable-next-line import/prefer-default-export
function PrivateCountryPreparedness() {
    const strings = useTranslation(i18n);
    const { perId, countryId } = useParams<{ perId: string, countryId: string }>();

    const [fileId, setFileId] = useState<number | undefined>();
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});

    const {
        pending: pendingPerStatsResponse,
        response: perStatsResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/per-stats/',
        query: isDefined(countryId) && isDefined(perId) ? {
            country: [Number(countryId)],
            id: Number(perId),
        } : undefined,
    });

    const perOverview = perStatsResponse?.results?.[0];
    const prevAssessmentRatings = perStatsResponse?.results?.[0]?.assessment_ratings;

    const {
        pending: formAnswerPending,
        response: formAnswerResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-formanswer/',
    });

    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-options/',
    });

    const {
        pending: perFormAreaPending,
        response: perFormAreaResponse,
    } = useRequest({
        url: '/api/v2/per-formarea/',
    });

    const {
        pending: perProcessStatusPending,
        response: processStatusResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-process-status/{id}/',
        pathVariables: isDefined(perId) ? {
            id: Number(perId),
        } : undefined,
    });

    const {
        pending: assessmentResponsePending,
        response: assessmentResponse,
    } = useRequest({
        skip: isNotDefined(processStatusResponse?.assessment),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.assessment),
        },
    });

    const {
        pending: prioritizationResponsePending,
        response: prioritizationResponse,
    } = useRequest({
        skip: isNotDefined(processStatusResponse?.prioritization),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.prioritization),
        },
    });

    const {
        pending: perDocumentsPending,
        error: perDocumentsError,
        response: perDocumentsResponse,
        retrigger: refetchDocuments,
    } = useRequest({
        skip: isNotDefined(countryId) || isNotDefined(perId),
        url: '/api/v2/per-document-upload/',
        query: {
            country: Number(countryId),
            per: Number(perId),
        },
    });

    const perDocuments = removeNull(perDocumentsResponse?.results);

    const formAnswerMap = useMemo(
        () => (
            listToMap(
                formAnswerResponse?.results ?? [],
                (answer) => answer.id,
                (answer) => answer.text,
            )
        ),
        [formAnswerResponse],
    );

    const assessmentStats = useMemo(
        () => {
            if (isNotDefined(assessmentResponse)
                || isNotDefined(assessmentResponse.area_responses)
                || assessmentResponse.area_responses.length === 0
            ) {
                return undefined;
            }

            const componentList = assessmentResponse.area_responses.flatMap(
                (areaResponse) => (
                    areaResponse.component_responses
                        ?.filter((componentResponses) => !(
                            // NOTE: remove parent components from component list
                            componentResponses.component_details.is_parent
                        ))
                        ?.map(
                            (componentResponse) => ({
                                area: areaResponse.area_details,
                                rating: componentResponse.rating_details,
                                details: componentResponse.component_details,
                                notes: componentResponse.notes,
                            }),
                        )
                ),
            ).filter(isDefined) ?? [];

            const topRatedComponents = [...componentList].sort(
                (a, b) => (
                    compareNumber(a.rating?.value ?? 0, b.rating?.value ?? 0, -1)
                ),
            );

            const topFiveRatedComponents = topRatedComponents.filter(
                (component) => isDefined(component.rating),
            ).slice(0, 5);

            // FIXME: let's use avgSafe
            function getAverage(list: number[]) {
                if (list.length === 0) {
                    return 0;
                }

                const total = sumSafe(list);
                if (isNotDefined(total)) {
                    return 0;
                }

                return total / list.length;
            }

            /*  NOTE: The calculation of the average rating is done omitting  null or
             *  "0"(not - reviewed") component values
             */
            const filteredComponents = componentList.filter(
                (component) => isDefined(component)
                    && isDefined(component.rating) && component.rating.value !== 0,
            );

            const ratingByArea = mapToList(
                listToGroupList(
                    filteredComponents,
                    (component) => component.area.id,
                ),
                (groupedComponentList) => ({
                    id: groupedComponentList[0].area.id,
                    areaNum: groupedComponentList[0].area.area_num,
                    title: groupedComponentList[0].area.title,
                    value: getAverage(
                        groupedComponentList.map(
                            (component) => (
                                isDefined(component.rating)
                                    ? component.rating.value
                                    : undefined
                            ),
                        ).filter(isDefined),
                    ),
                }),
            ).filter(isDefined);

            const averageRating = getAverage(
                filteredComponents.map(
                    (component) => (
                        isDefined(component.rating)
                            ? component.rating.value
                            : undefined
                    ),
                ).filter(isDefined),
            );

            const ratingCounts = mapToList(
                listToGroupList(
                    componentList.map(
                        (component) => (
                            isDefined(component.rating)
                                ? { ...component, rating: component.rating }
                                : undefined
                        ),
                    ).filter(isDefined),
                    (component) => component.rating.value,
                ),
                (ratingList) => ({
                    id: ratingList[0].rating?.id,
                    value: ratingList[0].rating?.value,
                    count: ratingList.length,
                    title: ratingList[0].rating?.title,
                }),
            ).sort((a, b) => (
                compareNumber(a.value, b.value, -1)
            ));

            const componentAnswerList = assessmentResponse.area_responses.flatMap(
                (areaResponse) => (
                    areaResponse.component_responses?.flatMap(
                        (componentResponse) => componentResponse.question_responses,
                    )
                ),
            ).filter(isDefined) ?? [];

            const answerCounts = mapToList(
                listToGroupList(
                    componentAnswerList.map(
                        (componentAnswer) => {
                            const { answer } = componentAnswer;
                            if (isNotDefined(answer)) {
                                return null;
                            }

                            return {
                                ...componentAnswer,
                                answer,
                            };
                        },
                    ).filter(isDefined),
                    (questionResponse) => questionResponse.answer,
                ),
                (answerList) => ({
                    id: answerList[0].answer,
                    // FIXME: use strings
                    label: `${formAnswerMap[answerList[0].answer]} ${answerList.length}`,
                    count: answerList.length,
                }),
            );

            return {
                ratingCounts,
                averageRating,
                answerCounts,
                ratingByArea,
                topRatedComponents,
                topFiveRatedComponents,
                componentList,
            };
        },
        [assessmentResponse, formAnswerMap],
    );

    const prioritizationStats = useMemo(
        () => {
            if (isNotDefined(prioritizationResponse) || isNotDefined(assessmentStats)) {
                return undefined;
            }

            const ratingByComponentId = listToMap(
                assessmentStats.componentList,
                (component) => component.details.id,
                (component) => component.rating,
            );

            const componentsWithRating = prioritizationResponse.prioritized_action_responses?.map(
                (componentResponse) => ({
                    id: componentResponse.id,
                    details: componentResponse.component_details,
                    rating: ratingByComponentId[componentResponse.component],
                }),
            ) ?? [];

            const componentsToBeStrengthened = componentsWithRating.map(
                (component) => ({
                    id: component.id,
                    value: component.rating?.value,
                    label: component.details.title,
                    num: component.details.component_num,
                    letter: component.details.component_letter,
                    rating: component.rating,
                }),
            ).sort(
                (a, b) => compareNumber(b.rating?.value ?? 0, a.rating?.value ?? 0),
            ).slice(0, 5);

            return {
                componentsWithRating,
                componentsToBeStrengthened,
            };
        },
        [prioritizationResponse, assessmentStats],
    );

    const { goBack } = useRouting();
    const handleBackButtonClick = useCallback(() => {
        goBack();
    }, [goBack]);

    const hasPer = isDefined(perId);
    const hasAssessmentStats = hasPer && isDefined(assessmentStats);
    const hasPrioritizationStats = hasPer && isDefined(prioritizationStats);

    const hasRatingCounts = hasAssessmentStats && assessmentStats.ratingCounts.length > 0;
    const hasAnswerCounts = hasAssessmentStats && assessmentStats.answerCounts.length > 0;
    const hasRatedComponents = hasAssessmentStats && assessmentStats.topRatedComponents.length > 0;
    const hasRatingsByArea = hasAssessmentStats && assessmentStats.ratingByArea.length > 0;
    const hasPriorityComponents = hasPrioritizationStats
        && prioritizationStats.componentsWithRating.length > 0;
    const hasPrevAssessments = prevAssessmentRatings && prevAssessmentRatings.length > 1;
    const showComponentsByArea = hasRatingsByArea
        && perOptionsResponse
        && perFormAreaResponse;

    const pending = formAnswerPending
        || pendingPerStatsResponse
        || perOptionsPending
        || perFormAreaPending
        || perProcessStatusPending
        || assessmentResponsePending
        || prioritizationResponsePending
        || perDocumentsPending;

    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);

    const rendererParams = useCallback((_: number, perDocument: PerDocumentListItem) => ({
        document: perDocument,
        onDeleteSuccess: refetchDocuments,
    }), [refetchDocuments]);

    const documentUploadUrlQuery = useMemo(
        () => {
            if (isNotDefined(countryId) || isNotDefined(perId)) {
                return undefined;
            }

            return {
                country: countryId,
                per: perId,
            };
        },
        [countryId, perId],
    );

    return (
        <Container
            className={styles.privateCountryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            heading={strings.nsPreparednessAndResponseCapacityHeading}
            actionsContainerClassName={styles.actionsContainer}
            headingLevel={2}
            withHeaderBorder
            actions={(
                <div className={styles.perAction}>
                    <TextOutput
                        label={strings.lastUpdatedLabel}
                        value={processStatusResponse?.updated_at}
                        valueType="date"
                        strongValue
                    />
                    <WikiLink
                        href="user_guide/Preparedness#how-to-use-it"
                    />
                    <Button
                        name={undefined}
                        onClick={setShowExportModalTrue}
                        icons={<DownloadFillIcon />}
                        variant="secondary"
                    >
                        {strings.perExport}
                    </Button>
                </div>
            )}
            icons={(
                <Button
                    name={undefined}
                    onClick={handleBackButtonClick}
                    variant="tertiary"
                    title={strings.goBackButtonTitle}
                >
                    <ArrowLeftLineIcon className={styles.backIcon} />
                </Button>
            )}
        >
            <div className={styles.perOverviewDetails}>
                <TextOutput
                    label={strings.startDateLabel}
                    value={perOverview?.date_of_assessment}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    label={strings.perPhaseLabel}
                    value={processStatusResponse?.phase_display}
                    strongValue
                />
                <TextOutput
                    label={strings.focalPointNameLabel}
                    value={perOverview?.ns_focal_point_name}
                    strongValue
                />
                <TextOutput
                    label={strings.perCycleLabel}
                    value={perOverview?.assessment_number}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.typeOfAssessmentLabel}
                    value={perOverview?.type_of_assessment.name}
                    strongValue
                />
                <TextOutput
                    label={strings.focalPointEmailTitle}
                    value={perOverview?.ns_focal_point_email}
                    strongValue
                />
            </div>
            {hasRatingCounts && (
                <Container
                    heading={strings.perAssessmentHeading}
                    withHeaderBorder
                    childrenContainerClassName={styles.assessmentResultsContent}
                >
                    <PieChart
                        data={assessmentStats.ratingCounts}
                        valueSelector={numericCountSelector}
                        labelSelector={stringTitleSelector}
                        keySelector={numericIdSelector}
                        colors={primaryRedColorShades}
                    />
                </Container>
            )}
            {hasAnswerCounts && (
                <Container
                    heading={strings.totalBenchmarkSummaryHeading}
                    childrenContainerClassName={styles.benchmarkSummaryContent}
                    withHeaderBorder
                >
                    <StackedProgressBar
                        data={assessmentStats.answerCounts}
                        valueSelector={numericCountSelector}
                        labelSelector={stringLabelSelector}
                        colorSelector={primaryRedColorShadeSelector}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        value={assessmentStats?.averageRating}
                        label={strings.averageComponentRatingLabel}
                    />
                </Container>
            )}
            {showComponentsByArea && (
                <Container
                    heading={strings.componentsByAreaHeading}
                    withHeaderBorder
                >
                    <RatingByAreaChart
                        ratingOptions={perOptionsResponse.componentratings}
                        formAreaOptions={perFormAreaResponse.results}
                        data={assessmentStats.ratingByArea}
                    />
                </Container>
            )}
            {!pending && hasPrevAssessments && (
                <Container
                    heading={strings.NSResponseHeading}
                    withHeaderBorder
                >
                    <PreviousAssessmentCharts
                        ratingOptions={perOptionsResponse?.componentratings}
                        data={prevAssessmentRatings}
                    />
                </Container>
            )}
            {hasRatedComponents && (
                <Container
                    heading={strings.highlightedTopRatedComponentHeading}
                    withHeaderBorder
                    childrenContainerClassName={styles.topRatedComponentContent}
                >
                    {assessmentStats.topFiveRatedComponents.map(
                        (component) => (
                            <Container
                                key={component.details.id}
                                className={styles.topRatedComponent}
                                heading={component.rating?.title}
                                headingLevel={5}
                                withHeaderBorder
                                withInternalPadding
                                icons={<CheckboxFillIcon className={styles.icon} />}
                                withoutWrapInHeading
                            >
                                {component.details.title}
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {hasPriorityComponents && (
                <Container
                    className={styles.priorityComponents}
                    heading={strings.priorityComponentToBeStrengthenedHeading}
                    childrenContainerClassName={styles.priorityComponentsContent}
                    withHeaderBorder
                >
                    {prioritizationStats.componentsToBeStrengthened.map(
                        (priorityComponent) => (
                            <div
                                className={styles.priorityComponent}
                                key={priorityComponent.id}
                            >
                                <Heading level={5} className={styles.heading}>
                                    {getFormattedComponentName({
                                        component_num: priorityComponent.num,
                                        component_letter: priorityComponent.letter,
                                        title: priorityComponent.label,
                                    })}
                                </Heading>
                                <ProgressBar
                                    className={styles.progressBar}
                                    value={priorityComponent.rating?.value ?? 0}
                                    totalValue={5}
                                />
                            </div>
                        ),
                    )}
                </Container>
            )}
            {hasRatedComponents && (
                <Container
                    className={styles.ratingResults}
                    heading={strings.componentRatingResultsHeading}
                    withHeaderBorder
                    childrenContainerClassName={styles.ratingResultsContent}
                >
                    {assessmentStats.topRatedComponents.map(
                        (component) => (
                            <Fragment
                                key={`${component.details.id}-${component.details.component_num}-${component.details.component_letter}`}
                            >
                                <Heading level={5}>
                                    {getFormattedComponentName(component.details)}
                                </Heading>
                                <ProgressBar
                                    value={component.rating?.value ?? 0}
                                    totalValue={5}
                                    title={(
                                        isDefined(component.rating)
                                            ? `${component.rating.value} - ${component.rating.title}`
                                            : strings.componentNotReviewed
                                    )}
                                />
                                <div>
                                    {component.notes}
                                </div>
                                <div className={styles.separator} />
                            </Fragment>
                        ),
                    )}
                </Container>
            )}
            {!pending && !hasAssessmentStats && (
                <Message
                    className={styles.emptyMessage}
                    icon={<AnalyzingIcon />}
                    title={strings.componentChartNotAvailable}
                    description={strings.componentChartNotAvailableDescription}
                />
            )}
            {showExportModal && isDefined(perId) && isDefined(countryId) && (
                <PerExportModal
                    onCancel={setShowExportModalFalse}
                    perId={perId}
                    countryId={countryId}
                />
            )}
            {countryId && (
                <Container
                    heading={strings.relevantDocumentHeader}
                    className={styles.relevantDocuments}
                    withHeaderBorder
                >
                    <InputSection
                        className={styles.uploadInputSection}
                    >
                        <GoSingleFileInput
                            name="country_ns_upload"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFileId}
                            url="/api/v2/per-document-upload/"
                            urlQuery={documentUploadUrlQuery}
                            value={fileId}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={
                                (perDocumentsResponse?.count ?? 0) >= MAX_PER_DOCUMENT_COUNT
                            }
                            countryId={countryId}
                            onSuccess={refetchDocuments}
                            description={(
                                (perDocuments?.length ?? 0 > 9) ? strings.uploadLimitDisclaimer
                                    : undefined
                            )}
                        >
                            {strings.upload}

                        </GoSingleFileInput>
                    </InputSection>
                    {(perDocuments && perDocuments?.length > 0) && (
                        <Grid
                            className={styles.perDocuments}
                            data={perDocuments}
                            pending={perDocumentsPending}
                            errored={isDefined(perDocumentsError)}
                            filtered={false}
                            keySelector={numericIdSelector}
                            renderer={DocumentCard}
                            rendererParams={rendererParams}
                            numPreferredColumns={3}
                        />
                    )}
                </Container>
            )}
            {pending && (
                <BlockLoading className={styles.pendingMessage} />
            )}
        </Container>
    );
}

export default PrivateCountryPreparedness;
