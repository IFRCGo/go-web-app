import { Fragment, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import { sumSafe } from '#utils/common';
import { useRequest } from '#utils/restRequest';
import PieChart from '#views/GlobalThreeW/PieChart';
import useTranslation from '#hooks/useTranslation';
import type { paths } from '#generated/types';
import KeyFigure from '#components/KeyFigure';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import ProgressBar from '#components/ProgressBar';
import StackedProgressBar from '#components/StackedProgressBar';
import {
    numericCountSelector,
    numericIdSelector,
    stringTitleSelector,
} from '#utils/selectors';

import i18n from './i18n.json';
import styles from './styles.module.css';
import RatingByAreaChart from './RatingByAreaChart';

type GetLatestPerOverview = paths['/api/v2/latest-per-overview/']['get'];
type LatestPerOverviewResponse = GetLatestPerOverview['responses']['200']['content']['application/json'];

type PerOptionsResponse = paths['/api/v2/per-options/']['get']['responses']['200']['content']['application/json'];
type PerFormAreaResponse = paths['/api/v2/per-formarea/']['get']['responses']['200']['content']['application/json'];
type PerProcessStatusResponse = paths['/api/v2/per-process-status/{id}/']['get']['responses']['200']['content']['application/json'];
type PerOverviewResponse = paths['/api/v2/per-overview/{id}/']['get']['responses']['200']['content']['application/json'];
type PerAssessmentResponse = paths['/api/v2/per-assessment/{id}/']['get']['responses']['200']['content']['application/json'];
type PerPrioritizationResponse = paths['/api/v2/per-prioritization/{id}/']['get']['responses']['200']['content']['application/json'];

type PerFormAnswerResponse = paths['/api/v2/per-formanswer/']['get']['responses']['200']['content']['application/json'];

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

    const { response: formAnswerResponse } = useRequest<PerFormAnswerResponse>({
        url: '/api/v2/per-formanswer/',
    });

    const {
        // pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<PerOptionsResponse>({
        url: '/api/v2/per-options/',
    });

    const {
        // pending: perOptionsPending,
        response: perFormAreaResponse,
    } = useRequest<PerFormAreaResponse>({
        url: '/api/v2/per-formarea/',
    });

    const { response: latestPerResponse } = useRequest<LatestPerOverviewResponse>({
        url: '/api/v2/latest-per-overview/',
        skip: isNotDefined(countryId),
        query: { country_id: countryId },
    });

    const perId = latestPerResponse?.results?.[0]?.id;

    const {
        response: processStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        skip: isNotDefined(perId),
        url: '/api/v2/per-process-status/{id}/',
        pathVariables: {
            id: perId,
        },
    });

    const { response: overviewResponse } = useRequest<PerOverviewResponse>({
        skip: isNotDefined(perId),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: {
            id: perId,
        },
    });

    const { response: assessmentResponse } = useRequest<PerAssessmentResponse>({
        skip: isNotDefined(processStatusResponse?.assessment),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: processStatusResponse?.assessment ?? undefined,
        },
    });

    const { response: prioritizationResponse } = useRequest<PerPrioritizationResponse>({
        skip: isNotDefined(processStatusResponse?.prioritization),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: processStatusResponse?.prioritization ?? undefined,
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
            if (!assessmentResponse) {
                return undefined;
            }

            const componentList = assessmentResponse.area_responses?.flatMap(
                (areaResponse) => (
                    areaResponse.component_responses?.map(
                        (componentResponse) => ({
                            area: areaResponse.area_details,
                            rating: componentResponse.rating_details,
                            details: componentResponse.component_details,
                        }),
                    )
                ),
            ).filter(isDefined) ?? [];

            const topRatedComponents = [...componentList].sort(
                (a, b) => (
                    compareNumber(a.rating.value, b.rating.value, -1)
                ),
            ).slice(0, 5);

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
                    componentList,
                    (component) => component.area.id,
                ),
                (groupedComponentList) => ({
                    id: groupedComponentList[0].area.id,
                    areaNum: groupedComponentList[0].area.area_num,
                    title: groupedComponentList[0].area.title,
                    value: getAverage(
                        groupedComponentList.map((component) => component.rating.value),
                    ),
                }),
            );

            const averageRating = getAverage(
                componentList.map((component) => component.rating.value),
            );

            const ratingCounts = mapToList(
                listToGroupList(
                    componentList,
                    (component) => component.rating.value,
                ),
                (ratingList) => ({
                    id: ratingList[0].rating.id,
                    value: ratingList[0].rating.value,
                    count: ratingList.length,
                    title: ratingList[0].rating.title,
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
                    label: formAnswerMap[answerList[0].answer] ?? '-',
                    count: answerList.length,
                }),
            );

            return {
                ratingCounts,
                averageRating,
                answerCounts,
                ratingByArea,
                topRatedComponents,
                componentList,
            };
        },
        [assessmentResponse, formAnswerMap],
    );

    const prioritizationStats = useMemo(
        () => {
            if (!prioritizationResponse || !assessmentStats) {
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
            );

            return {
                componentsWithRating,
            };
        },
        [prioritizationResponse, assessmentStats],
    );

    return (
        <Container
            className={styles.countryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            heading={strings.nsPreparednessAndResponseCapacityHeading}
            headingLevel={2}
        >
            <div className={styles.latestPerDetails}>
                <TextOutput
                    label={strings.startDateLabel}
                    value={overviewResponse?.date_of_assessment}
                    valueType="date"
                />
                <TextOutput
                    label={strings.perPhaseLabel}
                    value={processStatusResponse?.phase_display}
                />
                <TextOutput
                    label={strings.focalPointNameLabel}
                    value={overviewResponse?.ns_focal_point_name}
                />
                <TextOutput
                    label={strings.perCycleLabel}
                    value={overviewResponse?.phase}
                    valueType="number"
                />
                <TextOutput
                    label={strings.typeOfAssessmentLabel}
                    value={overviewResponse?.type_of_assessment_details?.name}
                />
                <TextOutput
                    label={strings.focalPointEmailLitle}
                    value={overviewResponse?.ns_focal_point_email}
                />
            </div>
            <Container
                heading={strings.perAssessmentHeading}
                withHeaderBorder
                childrenContainerClassName={styles.assessmentResultsContent}
            >
                <PieChart
                    data={assessmentStats?.ratingCounts ?? []}
                    valueSelector={numericCountSelector}
                    labelSelector={stringTitleSelector}
                    keySelector={numericIdSelector}
                    colors={primaryRedColorShades}
                />
            </Container>
            <Container
                heading={strings.totalBenchmarkSummaryHeading}
                childrenContainerClassName={styles.benchmarkSummaryContent}
                withHeaderBorder
            >
                <StackedProgressBar
                    data={assessmentStats?.answerCounts ?? []}
                    valueSelector={(answerCount) => answerCount.count}
                    labelSelector={(answerCount) => `${answerCount.count} ${answerCount.label}`}
                    colorSelector={primaryRedColorShadeSelector}
                />
                <KeyFigure
                    value={assessmentStats?.averageRating}
                    description={strings.averageComponentRatingLabel}
                />
            </Container>
            <Container
                heading={strings.componentsByAreaHeading}
                withHeaderBorder
            >
                <RatingByAreaChart
                    ratingOptions={perOptionsResponse?.componentratings}
                    formAreaOptions={perFormAreaResponse?.results}
                    data={assessmentStats?.ratingByArea}
                />
            </Container>
            <Container
                heading={strings.previousPerAssessmentHeading}
                withHeaderBorder
            >
                Chart not available
            </Container>
            <Container
                heading={strings.highlightedTopRatedComponentHeading}
                withHeaderBorder
                childrenContainerClassName={styles.topRatedComponentContent}
            >
                {assessmentStats?.topRatedComponents.map(
                    (component) => (
                        <Container
                            key={component.details.id}
                            className={styles.topRatedComponent}
                            heading={component.rating.title}
                            headingLevel={5}
                            withHeaderBorder
                            withInternalPadding
                        >
                            {component.details.title}
                        </Container>
                    ),
                )}
            </Container>
            <Container
                heading={strings.priorityComponentToBeStrengthenedHeading}
                childrenContainerClassName={styles.priorityComponentsContent}
                withHeaderBorder
            >
                {prioritizationStats?.componentsWithRating?.map(
                    (component) => (
                        <ProgressBar
                            className={styles.priorityComponent}
                            value={component.rating?.value ?? 0}
                            totalValue={5}
                            title={component.details.title}
                        />
                    ),
                )}
            </Container>
            <Container
                className={styles.ratingResults}
                heading={strings.componentRatingResultsHeading}
                withHeaderBorder
                childrenContainerClassName={styles.ratingResultsContent}
            >
                {assessmentStats?.componentList.map(
                    (component) => (
                        <Fragment
                            key={component.details.id}
                        >
                            <ProgressBar
                                value={component.rating.value}
                                totalValue={5}
                                title={`${component.details.component_num}: ${component.details.title}`}
                            />
                            <div className={styles.rating}>
                                {`${component.rating.value} - ${component.rating.title}`}
                            </div>
                            <div />
                        </Fragment>
                    ),
                )}
            </Container>
        </Container>
    );
}

Component.displayName = 'RegionPreparedness';
