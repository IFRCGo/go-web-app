import { Fragment, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AnalysisIcon, AnalyzingIcon, CheckboxFillIcon } from '@ifrc-go/icons';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import Message from '#components/Message';
import Link from '#components/Link';
import BarChart from '#components/BarChart';
import Heading from '#components/Heading';
import { sumSafe } from '#utils/common';
import { useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import KeyFigure from '#components/KeyFigure';
import PieChart from '#components/PieChart';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import ProgressBar from '#components/ProgressBar';
import StackedProgressBar from '#components/StackedProgressBar';
import {
    numericCountSelector,
    numericIdSelector,
    numericValueSelector,
    stringLabelSelector,
    stringTitleSelector,
} from '#utils/selectors';

import PreviousAssessmentCharts from './PreviousAssessmentChart';
import RatingByAreaChart from './RatingByAreaChart';
import i18n from './i18n.json';
import styles from './styles.module.css';

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function primaryRedColorShadeSelector(_: unknown, i: number) {
    return primaryRedColorShades[i];
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { countryId } = useParams<{ countryId: string }>();

    const { response: formAnswerResponse } = useRequest({
        url: '/api/v2/per-formanswer/',
    });

    const {
        // pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest({
        url: '/api/v2/per-options/',
    });

    const {
        // pending: perFormAreaPending,
        response: perFormAreaResponse,
    } = useRequest({
        url: '/api/v2/per-formarea/',
    });

    const { response: latestPerResponse } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/latest-per-overview/',
        // FIXME: typings should be fixed in server
        query: { country_id: Number(countryId) } as never,
    });

    // FIXME: we get a list form the server because we are using a filter on listing api
    const perId = latestPerResponse?.results?.[0]?.id;
    const prevAssessmentRatings = latestPerResponse?.results?.[0]?.assessment_ratings;

    const {
        response: processStatusResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-process-status/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });

    const {
        response: overviewResponse,
        pending: pendingOverviewResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });

    const { response: assessmentResponse } = useRequest({
        skip: isNotDefined(processStatusResponse?.assessment),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.assessment),
        },
    });

    const { response: prioritizationResponse } = useRequest({
        skip: isNotDefined(processStatusResponse?.prioritization),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.prioritization),
        },
    });

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
            if (isNotDefined(assessmentResponse)) {
                return undefined;
            }

            const componentList = assessmentResponse.area_responses?.flatMap(
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

            const ratingByArea = mapToList(
                listToGroupList(
                    componentList.filter((component) => isDefined(component.area)),
                    (component) => component.area.id,
                ),
                (groupedComponentList) => ({
                    id: groupedComponentList[0].area.id,
                    areaNum: groupedComponentList[0].area.area_num,
                    title: groupedComponentList[0].area.title,
                    value: getAverage(
                        groupedComponentList.map((component) => component.rating?.value),
                    ),
                }),
            ).filter(isDefined);

            const averageRating = getAverage(
                componentList.map((component) => component.rating?.value),
            );

            const ratingCounts = mapToList(
                listToGroupList(
                    componentList.filter((component) => isDefined(component.rating)),
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

            const componentAnswerList = assessmentResponse.area_responses?.flatMap(
                (areaResponse) => (
                    areaResponse.component_responses?.flatMap(
                        (componentResponse) => componentResponse.question_responses,
                    )
                ),
            ).filter(isDefined) ?? [];

            const answerCounts = mapToList(
                listToGroupList(
                    componentAnswerList,
                    (questionResponse) => questionResponse.answer,
                ),
                (answerList) => ({
                    id: answerList[0].answer,
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

            const componentsWithRating = prioritizationResponse.component_responses?.map(
                (componentResponse) => ({
                    id: componentResponse.id,
                    details: componentResponse.component_details,
                    rating: ratingByComponentId[componentResponse.component],
                }),
            ) ?? [];

            const componentsToBeStrengthened = componentsWithRating.map(
                (component) => ({
                    id: component.id,
                    value: component.rating.value,
                    label: component.details.title,
                }),
            );

            return {
                componentsWithRating,
                componentsToBeStrengthened,
            };
        },
        [prioritizationResponse, assessmentStats],
    );

    // FIXME: fill this value
    const perTeamEmail = '';
    const hasPer = isDefined(overviewResponse);

    const hasAssessmentStats = hasPer && isDefined(assessmentStats);
    const hasPrioritizationStats = hasPer && isDefined(prioritizationStats);

    const hasRatingCounts = hasAssessmentStats && assessmentStats.ratingCounts.length > 0;
    const hasAnswerCounts = hasAssessmentStats && assessmentStats.answerCounts.length > 0;
    const hasRatedComponents = hasAssessmentStats && assessmentStats.topRatedComponents.length > 0;
    const hasRatingsByArea = hasAssessmentStats && assessmentStats.ratingByArea.length > 0;
    const hasComponentsWithRating = hasPrioritizationStats
        && prioritizationStats.componentsWithRating.length > 0;
    const hasPrevAssessments = prevAssessmentRatings && prevAssessmentRatings.length > 1;

    return (
        <Container
            className={styles.countryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            heading={strings.nsPreparednessAndResponseCapacityHeading}
            headingLevel={2}
            withHeaderBorder
        >
            {!hasPer && (
                <Message
                    className={styles.emptyMessage}
                    pending={pendingOverviewResponse}
                    icon={<AnalysisIcon />}
                    // FIXME: use translation
                    title={pendingOverviewResponse ? 'Fetching data...' : 'PER not available yet for this Country!'}
                />
            )}
            {hasPer && (
                <div className={styles.latestPerDetails}>
                    <TextOutput
                        label={strings.startDateLabel}
                        value={overviewResponse?.date_of_assessment}
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
                        value={overviewResponse?.ns_focal_point_name}
                        strongValue
                    />
                    <TextOutput
                        label={strings.perCycleLabel}
                        value={overviewResponse?.phase}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.typeOfAssessmentLabel}
                        value={overviewResponse?.type_of_assessment_details?.name}
                        strongValue
                    />
                    <TextOutput
                        label={strings.focalPointEmailLitle}
                        value={overviewResponse?.ns_focal_point_email}
                        strongValue
                    />
                    <div className={styles.contactContainer}>
                        <Link
                            to={perTeamEmail}
                            variant="secondary"
                        >
                            {/* FIXME: use translation */}
                            Contact PER Team
                        </Link>
                    </div>
                </div>
            )}
            {hasPer && !hasAssessmentStats && (
                <Message
                    className={styles.emptyMessage}
                    icon={<AnalyzingIcon />}
                    // FIXME: use translation
                    title="Assessment has not been done yet!"
                />
            )}
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
                        value={assessmentStats?.averageRating}
                        description={strings.averageComponentRatingLabel}
                    />
                </Container>
            )}
            {hasRatingsByArea && perOptionsResponse && perFormAreaResponse && (
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
                    heading={strings.previousPerAssessmentHeading}
                    withHeaderBorder
                >
                    <PreviousAssessmentCharts
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
                                heading={component.rating.title}
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
            {hasComponentsWithRating && (
                <Container
                    heading={strings.priorityComponentToBeStrengthenedHeading}
                    childrenContainerClassName={styles.priorityComponentsContent}
                    withHeaderBorder
                >
                    <BarChart
                        maxValue={5}
                        data={prioritizationStats.componentsToBeStrengthened}
                        keySelector={numericIdSelector}
                        labelSelector={stringLabelSelector}
                        valueSelector={numericValueSelector}
                    />
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
                                key={component.details.id}
                            >
                                <Heading level={5}>
                                    {`${component.details.component_num}: ${component.details.title}`}
                                </Heading>
                                <ProgressBar
                                    value={component.rating?.value}
                                    totalValue={5}
                                    title={(
                                        isDefined(component.rating)
                                            ? `${component.rating.value} - ${component.rating.title}`
                                            // FIXME: use translation
                                            : '0 - Not Reviewed'
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
        </Container>
    );
}

Component.displayName = 'RegionPreparedness';
