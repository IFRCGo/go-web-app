import {
    Fragment,
    useMemo,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    BlockLoading,
    KeyFigure,
    LegendItem,
    PieChart,
    ProgressBar,
    StackedProgressBar,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Container,
    Heading,
    TextOutput,
} from '@ifrc-go/ui/printable';
import {
    numericCountSelector,
    numericIdSelector,
    stringLabelSelector,
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
import { getFormattedComponentName } from '#utils/domain/per';
import { useRequest } from '#utils/restRequest';

import PreviousAssessmentCharts from '../CountryPreparedness/PreviousAssessmentChart';
import RatingByAreaChart from '../CountryPreparedness/RatingByAreaChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

const primaryBlueColorShades = [
    'var(--go-ui-color-dark-blue-40)',
    'var(--go-ui-color-dark-blue-30)',
    'var(--go-ui-color-dark-blue-20)',
    'var(--go-ui-color-dark-blue-10)',
    'var(--go-ui-color-gray-40)',
    'var(--go-ui-color-gray-30)',
];

const areaColorShades: { [key: number]: string } = {
    1: 'var(--go-ui-color-purple-per)',
    2: 'var(--go-ui-color-orange-per)',
    3: 'var(--go-ui-color-blue-per)',
    4: 'var(--go-ui-color-teal-per)',
    5: 'var(--go-ui-color-red-per)',
};

function primaryRedColorShadeSelector(_: unknown, i: number) {
    return primaryBlueColorShades[i];
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
        pending: pendingPerStatsResponse,
        response: perStatsResponse,
        // error: perStatsResponseError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/per-stats/',
        query: isDefined(countryId) && isDefined(perId) ? {
            country: [Number(countryId)],
            id: Number(perId),
        } : undefined,
    });

    // const countryHasNoPer = perStatsResponse?.results?.length === 0;

    // FIXME: add feature on server (low priority)
    // we get a list form the server because we are using a filter on listing api
    // const perId = perStatsResponse?.results?.[0]?.id;

    const perOverview = perStatsResponse?.results?.[0];
    const assessmentRatings = perOverview?.assessment_ratings;

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

    const hasPer = isDefined(perId);

    const hasAssessmentStats = hasPer && isDefined(assessmentStats);
    const hasRatingCounts = hasAssessmentStats && assessmentStats.ratingCounts.length > 0;
    const hasAnswerCounts = hasAssessmentStats && assessmentStats.answerCounts.length > 0;
    const hasRatingsByArea = hasAssessmentStats && assessmentStats.ratingByArea.length > 0;
    const hasAssessments = isDefined(assessmentRatings) && assessmentRatings.length > 1;
    const hasRatedComponents = hasAssessmentStats && assessmentStats.topRatedComponents.length > 0;

    const showComponentsByArea = hasRatingsByArea
        && perOptionsResponse
        && perFormAreaResponse;

    const pending = formAnswerPending
        || pendingPerStatsResponse
        || perOptionsPending
        || perFormAreaPending
        || perProcessStatusPending
        || assessmentResponsePending
        || perFetching;

    const ratingByAreaWithColors = assessmentStats?.ratingByArea.map((area) => ({
        ...area,
        color: areaColorShades[area.areaNum ?? 0],
    })) ?? [];

    return (
        <div className={styles.perExport}>
            <Container childrenContainerClassName={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt={strings.perImageLogoIFRCAlt}
                />
                <Heading level={1} className={styles.countryName}>
                    {perResponse?.country_details.name}
                </Heading>
                <Heading level={1}>
                    {strings.perExportTitle}
                </Heading>
            </Container>
            {pending && (
                <BlockLoading className={styles.pendingMessage} />
            )}
            <Container
                childrenContainerClassName={styles.metaSection}
                heading={strings.perExportNSPreparedness}
                headingLevel={3}
            >
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
                <Container
                    heading={strings.perExportAssessmentHeading}
                    headingLevel={3}
                >
                    <PieChart
                        data={assessmentStats.ratingCounts}
                        valueSelector={numericCountSelector}
                        // FIXME: Why can this be undefined?
                        labelSelector={(item) => item.title ?? '??'}
                        keySelector={numericIdSelector}
                        colors={primaryBlueColorShades}
                        showPercentageInLegend
                    />
                </Container>
            )}
            {hasAnswerCounts && (
                <>
                    <Container
                        heading={strings.perExportTotalBenchmarkSummaryHeading}
                        headingLevel={3}
                    >
                        <StackedProgressBar
                            data={assessmentStats.answerCounts}
                            valueSelector={numericCountSelector}
                            labelSelector={stringLabelSelector}
                            colorSelector={primaryRedColorShadeSelector}
                        />
                    </Container>
                    <Container>
                        <KeyFigure
                            className={styles.averageRatingKeyFigure}
                            value={assessmentStats?.averageRating}
                            label={strings.perExportAverageComponentRatingLabel}
                        />
                    </Container>
                </>
            )}
            {showComponentsByArea && (
                <Container
                    heading={strings.componentsByArea}
                    headingLevel={3}
                >
                    <RatingByAreaChart
                        ratingOptions={perOptionsResponse.componentratings}
                        formAreaOptions={perFormAreaResponse.results}
                        data={ratingByAreaWithColors}
                        colors={ratingByAreaWithColors.map((area) => area.color)}
                    />
                </Container>
            )}
            {!pending && hasAssessments && (
                <Container
                    heading={strings.perNSResponseHeading}
                    headingLevel={3}
                >
                    <PreviousAssessmentCharts
                        ratingOptions={perOptionsResponse?.componentratings}
                        data={assessmentRatings}
                    />
                </Container>
            )}
            <div className={styles.pageBreak} />
            {hasRatedComponents && (
                <Container
                    heading={strings.perHighlightedTopRatedComponentHeading}
                    headingLevel={3}
                    childrenContainerClassName={styles.topRatedComponentContent}
                >
                    {assessmentStats.topFiveRatedComponents.map(
                        (component) => (
                            <div className={styles.topRatedComponent}>
                                <div className={styles.label}>
                                    {component.rating?.title}
                                </div>
                                <div>
                                    {getFormattedComponentName(component.details)}
                                </div>
                            </div>
                        ),
                    )}
                </Container>
            )}
            <div className={styles.pageBreak} />
            {hasRatedComponents && (
                <Container
                    childrenContainerClassName={styles.ratingResultsContent}
                    heading={strings.perComponentRatingResultsHeading}
                    headingLevel={3}
                >
                    {assessmentStats.topRatedComponents.map((component) => {
                        const progressBarColor = areaColorShades[component.area.id] || 'var(--go-ui-color-gray-40)';

                        return (
                            <Fragment
                                key={`${component.details.id}-${component.details.component_num}-${component.details.component_letter}`}
                            >
                                <Heading level={5}>
                                    {getFormattedComponentName(component.details)}
                                </Heading>
                                <ProgressBar
                                    value={component.rating?.value ?? 0}
                                    totalValue={5}
                                    color={progressBarColor}
                                    title={(
                                        isDefined(component.rating)
                                            ? `${component.rating.value} - ${component.rating.title}`
                                            : strings.perComponentNotReviewed
                                    )}
                                />
                                <div>
                                    {component.notes}
                                </div>
                                <div className={styles.separator} />
                            </Fragment>
                        );
                    })}
                    <div className={styles.legend}>
                        <Heading
                            level={5}
                        >
                            {strings.typeOfOperation}
                        </Heading>
                        {Object.entries(areaColorShades).map(([areaNum, color]) => {
                            const area = assessmentStats?.topRatedComponents.find(
                                (component) => component.area.area_num === Number(areaNum),
                            );

                            if (!area) {
                                return null;
                            }

                            return (
                                <LegendItem
                                    key={areaNum}
                                    label={`${strings.areaLegend} ${areaNum}
                                            ${getFormattedComponentName(area.area)}`}
                                    color={color}
                                />
                            );
                        })}
                    </div>
                </Container>
            )}
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'PerExport';
