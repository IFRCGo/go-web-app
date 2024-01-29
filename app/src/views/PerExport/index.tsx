import {
    Fragment,
    useMemo,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { CheckboxFillIcon } from '@ifrc-go/icons';
import {
    BlockLoading,
    Container,
    KeyFigure,
    PieChart,
    ProgressBar,
    StackedProgressBar,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DescriptionText,
    Heading,
    TextOutput,
} from '@ifrc-go/ui/printable';
import {
    numericCountSelector,
    numericIdSelector,
    resolveToString,
    stringLabelSelector,
    stringTitleSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isFalsyString,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import ifrcLogo from '#assets/icons/ifrc-square.png';
import { useRequest } from '#utils/restRequest';

import PreviousAssessmentCharts from '../CountryPreparedness/PreviousAssessmentChart';
import RatingByAreaChart from '../CountryPreparedness/RatingByAreaChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
export function Component() {
    const { perId, countryId } = useParams<{ perId: string, countryId: string }>();
    const [previewReady, setPreviewReady] = useState(false);
    const strings = useTranslation(i18n);

    const {
        pending: perFetching,
        response: perResponse,
    } = useRequest({
        skip: isFalsyString(perId),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: isDefined(perId) ? {
            id: Number(perId),
        } : undefined,
        onSuccess: () => {
            // FIXME: create common function / hook for this
            async function waitForImages() {
                const images = document.querySelectorAll('img');
                if (images.length === 0) {
                    setPreviewReady(true);
                    return;
                }

                const promises = Array.from(images).map(
                    (image) => {
                        if (image.complete) {
                            return undefined;
                        }

                        return new Promise((accept) => {
                            image.addEventListener('load', () => {
                                accept(true);
                            });
                        });
                    },
                ).filter(isDefined);

                await Promise.all(promises);
                setPreviewReady(true);
            }

            waitForImages();
        },
        onFailure: () => {
            setPreviewReady(true);
        },
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
        pending: pendingLatestPerResponse,
        response: latestPerResponse,
        // error: latestPerResponseError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/latest-per-overview/',
        query: { country_id: Number(countryId) },
    });

    // const countryHasNoPer = latestPerResponse?.results?.length === 0;

    // FIXME: add feature on server (low priority)
    // we get a list form the server because we are using a filter on listing api
    // const perId = latestPerResponse?.results?.[0]?.id;

    const latestPerOverview = latestPerResponse?.results?.[0];
    const prevAssessmentRatings = latestPerOverview?.assessment_ratings;

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
                    areaResponse.component_responses?.map(
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

    const hasPer = isDefined(perId);

    const hasAssessmentStats = hasPer && isDefined(assessmentStats);
    const hasRatingCounts = hasAssessmentStats && assessmentStats.ratingCounts.length > 0;
    const hasAnswerCounts = hasAssessmentStats && assessmentStats.answerCounts.length > 0;
    const hasRatingsByArea = hasAssessmentStats && assessmentStats.ratingByArea.length > 0;
    const hasPrevAssessments = prevAssessmentRatings && prevAssessmentRatings.length > 1;
    const hasRatedComponents = hasAssessmentStats && assessmentStats.topRatedComponents.length > 0;

    const showComponentsByArea = hasRatingsByArea
        && perOptionsResponse
        && perFormAreaResponse;

    const pending = formAnswerPending
        || pendingLatestPerResponse
        || perOptionsPending
        || perFormAreaPending
        || perProcessStatusPending
        || assessmentResponsePending
        || perFetching;

    return (
        <div className={styles.perExport}>
            <Container childrenContainerClassName={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt={strings.perImageLogoIFRCAlt}
                />
                <Heading level={1}>
                    {strings.perExportTitle}
                </Heading>
            </Container>
            {pending && (
                <BlockLoading className={styles.pendingMessage} />
            )}
            <Heading level={3}>
                {strings.perExportNSPreparedness}
            </Heading>
            <Container childrenContainerClassName={styles.metaSection}>
                <TextOutput
                    label={strings.perExportStartDateLabel}
                    value={perResponse?.date_of_assessment}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    label={strings.perExportPhaseLabel}
                    value={processStatusResponse?.phase_display}
                    strongValue
                />
                <TextOutput
                    label={strings.perExportFocalPointNameLabel}
                    value={perResponse?.ns_focal_point_name}
                    strongValue
                />
                <TextOutput
                    label={strings.perExportCycleLabel}
                    value={perResponse?.assessment_number}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.perExportTypeOfAssessmentLabel}
                    value={perResponse?.type_of_assessment_details?.name}
                    strongValue
                />
                <TextOutput
                    label={strings.perExportFocalPointEmailTitle}
                    value={perResponse?.ns_focal_point_email}
                    strongValue
                />
            </Container>
            {hasRatingCounts && (
                <Container>
                    <Heading level={3}>
                        {strings.perExportAssessmentHeading}
                    </Heading>
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
                <Container>
                    <Heading level={3}>
                        {strings.perExportTotalBenchmarkSummaryHeading}
                    </Heading>
                    <StackedProgressBar
                        data={assessmentStats.answerCounts}
                        valueSelector={numericCountSelector}
                        labelSelector={stringLabelSelector}
                        colorSelector={primaryRedColorShadeSelector}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        value={assessmentStats?.averageRating}
                        label={strings.perExportAverageComponentRatingLabel}
                    />
                </Container>
            )}
            {showComponentsByArea && (
                <Container>
                    <Heading level={3}>
                        {strings.perExportTotalBenchmarkSummaryHeading}
                    </Heading>
                    <RatingByAreaChart
                        ratingOptions={perOptionsResponse.componentratings}
                        // formAreaOptions={perFormAreaResponse.results}
                        data={assessmentStats.ratingByArea}
                    />
                </Container>
            )}
            <div className={styles.pageBreak} />
            {!pending && hasPrevAssessments && (
                <Container>
                    <Heading level={3}>
                        {strings.perNSResponseHeading}
                    </Heading>
                    <PreviousAssessmentCharts
                        data={prevAssessmentRatings}
                    />
                </Container>
            )}
            {hasRatedComponents && (
                <Container>
                    <Heading level={3}>
                        {strings.perHighlightedTopRatedComponentHeading}
                    </Heading>
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
            <div className={styles.pageBreak} />
            {hasRatedComponents && (
                <Container
                    className={styles.ratingResults}
                    childrenContainerClassName={styles.ratingResultsContent}
                >
                    <Heading level={3}>
                        {strings.perComponentRatingResultsHeading}
                    </Heading>
                    {assessmentStats.topRatedComponents.map(
                        (component) => (
                            <Fragment
                                key={component.details.id}
                            >
                                <Heading level={5}>
                                    {resolveToString(strings.perPriorityComponentHeading, {
                                        componentNumber: component.details.component_num,
                                        componentLetter: component.details.component_letter,
                                        componentName: component.details.title,
                                    })}
                                </Heading>
                                <ProgressBar
                                    value={component.rating?.value ?? 0}
                                    totalValue={5}
                                    title={(
                                        isDefined(component.rating)
                                            ? `${component.rating.value} - ${component.rating.title}`
                                            : strings.perComponent0NotReviewed
                                    )}
                                />
                                <DescriptionText>
                                    {component.notes}
                                </DescriptionText>
                                <div className={styles.separator} />
                            </Fragment>
                        ),
                    )}
                </Container>
            )}
            <div className={styles.pageBreak} />
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'PerExport';
