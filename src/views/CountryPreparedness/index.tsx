import { Fragment, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CheckboxFillIcon } from '@ifrc-go/icons';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import Message from '#components/Message';
import Link from '#components/Link';
import BarChart from '#components/BarChart';
import Heading from '#components/Heading';
import { sumSafe } from '#utils/common';
import { useRequest } from '#utils/restRequest';
import PieChart from '#views/GlobalThreeW/PieChart';
import useTranslation from '#hooks/useTranslation';
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
        // pending: perOptionsPending,
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

    const perId = latestPerResponse?.results?.[0]?.id;

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
                    compareNumber(a.rating?.value ?? 0, b.rating?.value ?? 0, -1)
                ),
            );

            const topFiveRatedComponents = topRatedComponents.filter(
                (component) => isDefined(component.rating),
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
                topFiveRatedComponents,
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

    const perTeamEmail = '';
    const hasPer = !pendingOverviewResponse && overviewResponse;

    return (
        <Container
            className={styles.countryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            heading={strings.nsPreparednessAndResponseCapacityHeading}
            headingLevel={2}
        >
            {pendingOverviewResponse && (
                <BlockLoading />
            )}
            {!hasPer && (
                <Message
                    compact
                    message="PER not available for this Country!"
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
                            Contact PER Team
                        </Link>
                    </div>
                </div>
            )}
            {hasPer && assessmentStats && (
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
            {hasPer && assessmentStats && (
                <Container
                    heading={strings.totalBenchmarkSummaryHeading}
                    childrenContainerClassName={styles.benchmarkSummaryContent}
                    withHeaderBorder
                >
                    <StackedProgressBar
                        data={assessmentStats.answerCounts}
                        // FIXME: no inline functions
                        valueSelector={(answerCount) => answerCount.count}
                        labelSelector={(answerCount) => `${answerCount.count} ${answerCount.label}`}
                        colorSelector={primaryRedColorShadeSelector}
                    />
                    <KeyFigure
                        value={assessmentStats?.averageRating}
                        description={strings.averageComponentRatingLabel}
                    />
                </Container>
            )}
            {hasPer && perOptionsResponse && perFormAreaResponse && assessmentStats && (
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
            {hasPer && (
                <Container
                    heading={strings.previousPerAssessmentHeading}
                    withHeaderBorder
                >
                    Chart not available
                </Container>
            )}
            {hasPer && assessmentStats && (
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
                            >
                                {component.details.title}
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {hasPer && prioritizationStats && (
                <Container
                    heading={strings.priorityComponentToBeStrengthenedHeading}
                    childrenContainerClassName={styles.priorityComponentsContent}
                    withHeaderBorder
                >
                    <BarChart
                        data={prioritizationStats.componentsWithRating}
                        keySelector={numericIdSelector}
                        labelSelector={(component) => component.details.title}
                        valueSelector={(component) => component.rating?.value ?? 0}
                    />
                </Container>
            )}
            {hasPer && assessmentStats && (
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
                                    title={isDefined(component.rating) ? (
                                        `${component.rating?.value} - ${component.rating?.title}`
                                    ) : '0 - Not Reviewed'}
                                />
                                <div>
                                    {/* FIXME: this shoule be the notes by user */}
                                    {component.details.description}
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
