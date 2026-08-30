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
    Button,
    Container,
    Description,
    InlineLayout,
    KeyFigure,
    Label,
    LegendItem,
    ListView,
    Message,
    PieChart,
    ProgressBar,
    RawList,
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
    resolveToString,
    stringLabelSelector,
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
import Link from '#components/Link';
import PerExportModal from '#components/PerExportModal';
import TabPage from '#components/TabPage';
import {
    getFormattedComponentName,
    getPerAreaColor,
    perBenchmarkColorSelector,
    perRatingColorSelector,
} from '#utils/domain/per';
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

const noOp = () => {};

function PrivateCountryPreparedness() {
    const strings = useTranslation(i18n);
    const { perId, countryId } = useParams<{ perId: string, countryId: string }>();

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
                    id: groupedComponentList[0]!.area.id,
                    areaNum: groupedComponentList[0]!.area.area_num,
                    title: groupedComponentList[0]!.area.title,
                    color: getPerAreaColor(groupedComponentList[0]!.area.area_num),
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
                    id: ratingList[0]!.rating?.id,
                    value: ratingList[0]!.rating?.value,
                    count: ratingList.length,
                    title: ratingList[0]!.rating?.title,
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
                    id: answerList[0]!.answer,
                    // FIXME: use strings
                    label: `${formAnswerMap[answerList[0]!.answer]} ${answerList.length}`,
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
                    areaNumber: component.details.area.area_num,
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

    const hasPer = isDefined(perId);
    const hasAssessmentStats = hasPer && isDefined(assessmentStats);
    const hasPrioritizationStats = hasPer && isDefined(prioritizationStats);

    const hasRatingCounts = hasAssessmentStats && assessmentStats.ratingCounts.length > 0;
    const hasAnswerCounts = hasAssessmentStats && assessmentStats.answerCounts.length > 0;
    const hasRatedComponents = hasAssessmentStats && assessmentStats.topRatedComponents.length > 0;
    const hasTopFiveRatedComponents = hasAssessmentStats
        && assessmentStats.topFiveRatedComponents.length > 0;
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
        || prioritizationResponsePending;

    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);

    const rendererParams = useCallback((_: number, perDocument: PerDocumentListItem) => ({
        document: perDocument,
        onDeleteSuccess: refetchDocuments,
    }), [refetchDocuments]);

    const documentUploadRequestBody = useMemo(
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
        <TabPage
            wikiLinkPathName="user_guide/Preparedness#how-to-use-it"
            pending={pending}
        >
            <Link
                to="countryNsOverviewCapacity"
                urlParams={{ countryId }}
                styleVariant="action"
                before={<ArrowLeftLineIcon />}
            >
                {strings.goBackButtonTitle}
            </Link>
            <Container
                heading={strings.nsPreparednessAndResponseCapacityHeading}
                headerActions={(
                    <Button
                        name={undefined}
                        onClick={setShowExportModalTrue}
                        before={<DownloadFillIcon />}
                    >
                        {strings.perExport}
                    </Button>
                )}
                spacing="lg"
            >
                <Container
                    headerDescription={(
                        <TextOutput
                            label={strings.lastUpdatedLabel}
                            value={processStatusResponse?.updated_at}
                            valueType="date"
                            textSize="sm"
                        />
                    )}
                    withPadding
                    withBackground
                    withShadow
                    spacing="lg"
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                    >
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
                            value={perOverview?.type_of_assessment?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.focalPointEmailTitle}
                            value={perOverview?.ns_focal_point_email}
                            strongValue
                        />
                    </ListView>
                </Container>
            </Container>
            {hasAssessmentStats && (
                <ListView
                    layout="grid"
                    spacing="xl"
                >
                    {hasRatingCounts && (
                        <Container
                            heading={strings.perAssessmentHeading}
                            withHeaderBorder
                        >
                            <PieChart
                                data={assessmentStats.ratingCounts}
                                valueSelector={numericCountSelector}
                                // FIXME: check why title can be undefined
                                labelSelector={(item) => item.title ?? '??'}
                                keySelector={numericIdSelector}
                                colorSelector={perRatingColorSelector}
                            />
                        </Container>
                    )}
                    {hasAnswerCounts && (
                        <Container
                            heading={strings.totalBenchmarkSummaryHeading}
                            withHeaderBorder
                        >
                            <ListView layout="block">
                                <StackedProgressBar
                                    data={assessmentStats.answerCounts}
                                    valueSelector={numericCountSelector}
                                    labelSelector={stringLabelSelector}
                                    colorSelector={perBenchmarkColorSelector}
                                />
                                <KeyFigure
                                    value={assessmentStats?.averageRating}
                                    label={strings.averageComponentRatingLabel}
                                    valueType="number"
                                />
                            </ListView>
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
                    {hasPrevAssessments && (
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
                    {hasTopFiveRatedComponents && (
                        <Container
                            heading={strings.highlightedTopRatedComponentHeading}
                            withHeaderBorder
                        >
                            <ListView
                                layout="grid"
                                numPreferredGridColumns={3}
                                spacing="sm"
                            >
                                {assessmentStats.topFiveRatedComponents.map(
                                    (component) => (
                                        <Container
                                            key={component.details.id}
                                            heading={component.rating?.title}
                                            headingLevel={5}
                                            withHeaderBorder
                                            headerIcons={(
                                                <CheckboxFillIcon
                                                    className={styles.topRatedComponentIcon}
                                                />
                                            )}
                                            withoutWrapInHeader
                                            withPadding
                                            withDarkBackground
                                        >
                                            {component.details.title}
                                        </Container>
                                    ),
                                )}
                            </ListView>
                        </Container>
                    )}
                    {hasPriorityComponents && (
                        <Container
                            heading={strings.priorityComponentToBeStrengthenedHeading}
                            withHeaderBorder
                        >
                            <ListView layout="grid">
                                {prioritizationStats.componentsToBeStrengthened.map(
                                    (priorityComponent) => {
                                        const progressBarColor = getPerAreaColor(
                                            priorityComponent.areaNumber,
                                        );

                                        return (
                                            <Fragment key={priorityComponent.id}>
                                                <Label strong>
                                                    {getFormattedComponentName({
                                                        component_num: priorityComponent.num,
                                                        component_letter: priorityComponent.letter,
                                                        title: priorityComponent.label,
                                                    })}
                                                </Label>
                                                <ProgressBar
                                                    value={priorityComponent.rating?.value ?? 0}
                                                    totalValue={5}
                                                    colorVariant="custom"
                                                    color={progressBarColor}
                                                />
                                            </Fragment>
                                        );
                                    },
                                )}
                            </ListView>
                        </Container>
                    )}
                </ListView>
            )}
            {hasRatedComponents && (
                <Container
                    heading={strings.componentRatingResultsHeading}
                    withHeaderBorder
                    footer={(
                        <ListView
                            withDarkBackground
                            withPadding
                        >
                            <TextOutput
                                label={strings.perAreas}
                                value={(
                                    <ListView
                                        withWrap
                                        spacing="sm"
                                        withSpacingOpticalCorrection
                                    >
                                        {perFormAreaResponse?.results?.map((perFormArea) => {
                                            if (isNotDefined(perFormArea.area_num)) {
                                                return null;
                                            }
                                            const color = getPerAreaColor(perFormArea?.area_num);
                                            return (
                                                <LegendItem
                                                    key={perFormArea.id}
                                                    label={resolveToString(
                                                        strings.perArea,
                                                        {
                                                            areaNumber: perFormArea.area_num,
                                                            title: perFormArea.title,
                                                        },
                                                    )}
                                                    color={color}
                                                />
                                            );
                                        })}
                                    </ListView>
                                )}
                            />
                        </ListView>
                    )}
                >
                    <ListView
                        layout="block"
                        spacing="2xs"
                    >
                        {assessmentStats.topRatedComponents.map((component) => {
                            const progressBarColor = getPerAreaColor(component.area.area_num);

                            return (
                                <ListView
                                    layout="grid"
                                    numPreferredGridColumns={4}
                                    key={`${component.details.id}-${component.details.component_num}-${component.details.component_letter}`}
                                    withPadding
                                    spacing="sm"
                                >
                                    <Label strong>
                                        {getFormattedComponentName(component.details)}
                                    </Label>
                                    <InlineLayout contentAlignment="center">
                                        <ProgressBar
                                            value={component.rating?.value ?? 0}
                                            totalValue={5}
                                            colorVariant="custom"
                                            color={progressBarColor}
                                        />
                                    </InlineLayout>
                                    <Label strong>
                                        {isDefined(component.rating)
                                            ? `${component.rating.value} - ${component.rating.title}`
                                            : strings.componentNotReviewed}
                                    </Label>
                                    <Description>
                                        {component.notes}
                                    </Description>
                                </ListView>
                            );
                        })}
                    </ListView>
                </Container>
            )}
            {!pending && !hasAssessmentStats && (
                <Message
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
                    withHeaderBorder
                    pending={perDocumentsPending}
                    headerActions={(
                        <GoSingleFileInput
                            name="country_ns_upload"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={noOp}
                            url="/api/v2/per-document-upload/"
                            requestBody={documentUploadRequestBody}
                            value={undefined}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={
                                (perDocumentsResponse?.count ?? 0) >= MAX_PER_DOCUMENT_COUNT
                            }
                            onSuccess={refetchDocuments}
                            withoutPreview
                            withoutStatus
                        >
                            {strings.upload}
                        </GoSingleFileInput>
                    )}
                    footer={(perDocuments?.length ?? 0 > 9)
                        ? <Description withLightText>{strings.uploadLimitDisclaimer}</Description>
                        : undefined}
                    errored={isDefined(perDocumentsError)}
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                    >
                        <RawList
                            data={perDocuments}
                            keySelector={numericIdSelector}
                            renderer={DocumentCard}
                            rendererParams={rendererParams}
                        />
                    </ListView>
                </Container>
            )}
        </TabPage>
    );
}

export default PrivateCountryPreparedness;
