import { Fragment, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    AnalysisIcon,
    AnalyzingIcon,
    CheckboxFillIcon,
    CloseCircleLineIcon,
} from '@ifrc-go/icons';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import Heading from '#components/Heading';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import Message from '#components/Message';
import PieChart from '#components/PieChart';
import ProgressBar from '#components/ProgressBar';
import StackedProgressBar from '#components/StackedProgressBar';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { sumSafe } from '#utils/common';
import { useRequest } from '#utils/restRequest';
import {
    numericCountSelector,
    numericIdSelector,
    stringLabelSelector,
    stringTitleSelector,
} from '#utils/selectors';

import PreviousAssessmentCharts from './PreviousAssessmentChart';
import PublicCountryPreparedness from './PublicCountryPreparedness';
import RatingByAreaChart from './RatingByAreaChart';
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
    const strings = useTranslation(i18n);
    const { countryId } = useParams<{ countryId: string }>();

    const {
        pending: pendingLatestPerResponse,
        response: latestPerResponse,
        error: latestPerResponseError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/latest-per-overview/',
        query: { country_id: Number(countryId) },
    });

    const countryHasNoPer = latestPerResponse?.results?.length === 0;

    // FIXME: add feature on server (low priority)
    // we get a list form the server because we are using a filter on listing api
    const perId = latestPerResponse?.results?.[0]?.id;
    const latestPerOverview = latestPerResponse?.results?.[0];
    const prevAssessmentRatings = latestPerResponse?.results?.[0]?.assessment_ratings;

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
        pathVariables: {
            id: Number(perId),
        },
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

            const ratingByArea = mapToList(
                listToGroupList(
                    componentList.filter((component) => isDefined(component.rating)),
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
                    (component) => component.rating?.value,
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
            ).sort((a, b) => compareNumber(b.rating?.value ?? 0, a.rating?.value ?? 0));

            return {
                componentsWithRating,
                componentsToBeStrengthened,
            };
        },
        [prioritizationResponse, assessmentStats],
    );

    const hasPer = isDefined(latestPerResponse);
    const limitedAccess = hasPer && isNotDefined(processStatusResponse);

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

    const pending = pendingLatestPerResponse
        || formAnswerPending
        || perOptionsPending
        || perFormAreaPending
        || perProcessStatusPending
        || assessmentResponsePending
        || prioritizationResponsePending;

    if (isNotDefined(countryId) || (!pending && isDefined(latestPerResponseError))) {
        return (
            <Message
                className={styles.countryPreparedness}
                icon={<CloseCircleLineIcon />}
                title={strings.nsPreparednessAndResponseCapacityHeading}
                description={strings.componentMessageDescription}
            />
        );
    }

    if (countryHasNoPer) {
        return (
            <Message
                className={styles.countryPreparedness}
                icon={<AnalysisIcon />}
                title={strings.nsPreparednessAndResponseCapacityHeading}
                description={strings.componentMessagePERDataNotAvailable}
            />
        );
    }

    if (pending) {
        return (
            <Message
                className={styles.pendingMessage}
                pending
                description={strings.componentFetchingData}
            />
        );
    }

    return (
        <Container
            className={styles.countryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            heading={strings.nsPreparednessAndResponseCapacityHeading}
            headingLevel={2}
            withHeaderBorder
        >
            <div className={styles.latestPerDetails}>
                <TextOutput
                    label={strings.startDateLabel}
                    value={latestPerOverview?.date_of_assessment}
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
                    value={latestPerOverview?.ns_focal_point_name}
                    strongValue
                />
                <TextOutput
                    label={strings.perCycleLabel}
                    value={latestPerOverview?.assessment_number}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.typeOfAssessmentLabel}
                    value={latestPerOverview?.type_of_assessment?.name}
                    strongValue
                />
                <TextOutput
                    label={strings.focalPointEmailTitle}
                    value={latestPerOverview?.ns_focal_point_email}
                    strongValue
                />
                <div className={styles.contactContainer}>
                    <Link
                        href="mailto:PER.Team@ifrc.org"
                        external
                        variant="secondary"
                    >
                        {strings.componentContactPERTeam}
                    </Link>
                </div>
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
                                heading={component.rating?.title}
                                headingLevel={5}
                                withHeaderBorder
                                withInternalPadding
                                icons={<CheckboxFillIcon className={styles.icon} />}
                                withoutWrapInHeading
                                spacing="cozy"
                            >
                                {component.details.title}
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {hasPriorityComponents && (
                <Container
                    className={styles.settingResults}
                    heading={strings.priorityComponentToBeStrengthenedHeading}
                    childrenContainerClassName={styles.ratingResultsContent}
                    withHeaderBorder
                >
                    {prioritizationStats.componentsToBeStrengthened.map(
                        (priorityComponent) => (
                            <Fragment
                                key={priorityComponent.id}
                            >
                                <Heading level={5}>
                                    {resolveToString(strings.priorityComponentHeading, {
                                        componentNumber: priorityComponent.num,
                                        componentLetter: priorityComponent.letter,
                                        componentName: priorityComponent.label,
                                    })}
                                </Heading>
                                <ProgressBar
                                    className={styles.progressBar}
                                    value={priorityComponent.rating?.value}
                                    totalValue={5}
                                />
                                <div className={styles.separator} />
                            </Fragment>
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
                                key={component.details.id}
                            >
                                <Heading level={5}>
                                    {resolveToString(strings.priorityComponentHeading, {
                                        componentNumber: component.details.component_num,
                                        componentLetter: component.details.component_letter,
                                        componentName: component.details.title,
                                    })}
                                </Heading>
                                <ProgressBar
                                    value={component.rating?.value}
                                    totalValue={5}
                                    title={(
                                        isDefined(component.rating)
                                            ? `${component.rating.value} - ${component.rating.title}`
                                            : strings.component0NotReviewed
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
            {!limitedAccess && !hasAssessmentStats && (
                <Message
                    className={styles.emptyMessage}
                    icon={<AnalyzingIcon />}
                    title={strings.componentChartNotAvailable}
                    description={strings.componentChartNotAvailableDescription}
                />
            )}
            {limitedAccess && (
                <div className={styles.limitedAccess}>
                    <PublicCountryPreparedness perId={perId} />
                    <Message
                        title={strings.componentLimitedAccess}
                        description={strings.componentLimitedAccessDescription}
                        actions={(
                            <Button
                                variant="primary"
                                name={undefined}
                            >
                                {strings.componentRequestSeeMore}
                            </Button>
                        )}
                    />
                </div>
            )}
        </Container>
    );
}
Component.displayName = 'CountryPreparedness';
