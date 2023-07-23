import {
    useMemo,
} from 'react';
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
import Header from '#components/Header';
import { numericCountSelector, numericIdSelector, stringTitleSelector } from '#utils/selectors';

import i18n from './i18n.json';
import styles from './styles.module.css';
import RatingByAreaChart from './RatingByAreaChart';

type GetLatestPerOverview = paths['/api/v2/latest-per-overview/']['get'];
type LatestPerOverviewResponse = GetLatestPerOverview['responses']['200']['content']['application/json'];

type PerProcessStatusResponse = paths['/api/v2/per-process-status/{id}/']['get']['responses']['200']['content']['application/json'];
type PerOverviewResponse = paths['/api/v2/per-overview/{id}/']['get']['responses']['200']['content']['application/json'];
type PerAssessmentResponse = paths['/api/v2/per-assessment/{id}/']['get']['responses']['200']['content']['application/json'];

type PerFormAnswerResponse = paths['/api/v2/per-formanswer/']['get']['responses']['200']['content']['application/json'];

const PIE_COLORS = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { countryId } = useParams<{ countryId: string }>();

    const { response: formAnswerResponse } = useRequest<PerFormAnswerResponse>({
        url: '/api/v2/per-formanswer/',
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
            };
        },
        [assessmentResponse, formAnswerMap],
    );

    return (
        <div className={styles.countryPreparedness}>
            <Header
                heading={strings.nsPreparednessAndResponseCapacityHeading}
                headingLevel={2}
            />
            <div className={styles.latestPerDetails}>
                <TextOutput
                    label={strings.startDateTitle}
                    value={overviewResponse?.date_of_assessment}
                    valueType="date"
                />
                <TextOutput
                    label={strings.perPhaseTitle}
                    value={processStatusResponse?.phase_display}
                />
                <TextOutput
                    label={strings.focalPointTitle}
                    value={overviewResponse?.ns_focal_point_name}
                />
                <TextOutput
                    label={strings.perCycleTitle}
                    value={overviewResponse?.phase}
                    valueType="number"
                />
                <TextOutput
                    label={strings.typeOfAssessmentTitle}
                    value={overviewResponse?.type_of_assessment_details?.name}
                />
                <TextOutput
                    label={strings.emailTitle}
                    value={overviewResponse?.ns_focal_point_email}
                />
            </div>
            <Container
                heading={strings.perAssessmentHeading}
                withHeaderBorder
                childrenContainerClassName={styles.progressBar}
            >
                {assessmentStats && (
                    <PieChart
                        data={assessmentStats.ratingCounts}
                        valueSelector={numericCountSelector}
                        labelSelector={stringTitleSelector}
                        keySelector={numericIdSelector}
                        colors={PIE_COLORS}
                    />
                )}
                <KeyFigure
                    value={assessmentStats?.averageRating}
                    description="Average Component Rating"
                />
                {assessmentStats?.answerCounts.map(
                    (answer) => (
                        <KeyFigure
                            value={answer.count}
                            description={answer.label}
                        />
                    ),
                )}
            </Container>
            <Container
                heading={strings.componentsByAreaHeading}
                withHeaderBorder
            >
                <RatingByAreaChart
                    data={assessmentStats?.ratingByArea}
                />
            </Container>
            {/*
            <Container
                heading={strings.previousPerAssessment}
                withHeaderBorder
            >
                <TimeSeriesChart
                    className={styles.timelineChart}
                    timePoints={dateList}
                    dataKeys={dataKeys}
                    valueSelector={chartValueSelector}
                    classNameSelector={classNameSelector}
                    activePointKey={activePointKey}
                    onTimePointClick={setActivePointKey}
                    xAxisFormatter={xAxisFormatter}
                />
            </Container>
            <Container
                heading={strings.highlightedTopRatedComponentHeading}
                withHeaderBorder
            >
                <div className={styles.highlightedComponent}>
                    {highlightedComponent?.map((component) => component?.title)}
                </div>
            </Container>
            <Container
                heading={strings.componentRatingResultsHeading}
                withHeaderBorder
            >
                {formComponentResponse?.results?.map((component) => {
                    const rating = assessmentComponentResponseMap?.[component.id]?.rating_details;
                    const ratingDisplay = isDefined(rating)
                        ? `${rating.value} - ${rating.title}`
                        : undefined;

                    return (
                        <ComponentInput
                            key={component.id}
                            index={componentResponseMapping[component.id]?.index}
                            value={componentResponseMapping[component.id]?.value}
                            onChange={setComponentValue}
                            component={component}
                            questionResponses={assessmentQuestionResponsesByComponent[component.id]}
                            ratingDisplay={ratingDisplay}
                        />
                    );
                })}
            </Container>
              */}
        </div>
    );
}

Component.displayName = 'RegionPreparedness';
