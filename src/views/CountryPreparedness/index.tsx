import { useCallback, useState } from 'react';
import { useForm, removeNull } from '@togglecorp/toggle-form';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import { sumSafe } from '#utils/common';
import { getDatesSeparatedByYear } from '#utils/chart';
import { useRequest } from '#utils/restRequest';

import PieChart from '#views/GlobalThreeW/PieChart';
import useTranslation from '#hooks/useTranslation';
import { assessmentSchema } from '#views/PerAssessmentForm/schema';
import Container from '#components/Container';
import Page from '#components/Page';
import TextOutput from '#components/TextOutput';
import ProgressBar from '#components/ProgressBar';
import BarChart from '#components/BarChart';
import TimeSeriesChart from '#components/TimeSeriesChart';
import { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AssessmentResponse = paths['/api/v2/per-assessment/{id}/']['get']['responses']['200']['content']['application/json'];
type PerFormQuestionResponse = paths['/api/v2/per-formquestion/']['get']['responses']['200']['content']['application/json'];
type PerOptionsResponse = paths['/api/v2/per-options/']['get']['responses']['200']['content']['application/json'];

type GetPerCountry = paths['/api/v2/per-country/'];
type PerCountryResponse = GetPerCountry['get']['responses']['200']['content']['application/json'];

const dataKeyToClassNameMap = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
};

type DATA_KEY = 'componentrating' | 'emergencyAppeal';

const classNameSelector = (dataKey: DATA_KEY) => dataKeyToClassNameMap[dataKey];
const xAxisFormatter = (date: Date) => date.toLocaleString(undefined, { year: 'numeric' });

function perAssessmentRatingTypeKeySelector(
    perAssessmentRatingType: NonNullable<AssessmentResponse['area_responses']>[number],
) {
    return perAssessmentRatingType.id;
}

const dataKeys: DATA_KEY[] = [
    'componentrating',
    'emergencyAppeal',
];

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

const now = new Date();
const startDate = new Date(now.getFullYear() - 5, 0, 1);
const endDate = new Date(now.getFullYear(), 11, 31);
const dateList = getDatesSeparatedByYear(startDate, endDate);

const PIE_COLORS = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-70)',
    'var(--go-ui-color-red-50)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        response: perAssessmentResponse,
    } = useRequest<AssessmentResponse>({
        url: 'api/v2/per-assessment/5',
    });

    console.info(perAssessmentResponse);

    const ratingDetail = perAssessmentResponse?.area_responses?.map(
        (component) => component.component_responses?.map(
            (rating) => rating.rating_details,
        ),
    );

    const highlightedComponent = ratingDetail?.map(
        (rating) => rating?.find((item) => item?.value === 5),
    );

    const {
        response: perCountryResponse,
    } = useRequest<PerCountryResponse>({
        url: 'api/v2/per-country/',
        query: {
            country_id: 123,
        },
    });

    const aggregatedPer = perCountryResponse?.results?.[0];

    const {
        response: perOptionsResponse,
    } = useRequest<PerOptionsResponse>({
        url: 'api/v2/per-options',
    });

    const {
        response: questionsResponse,
    } = useRequest<PerFormQuestionResponse>({
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
        },
    });

    const [activePointKey, setActivePointKey] = useState<string>(
        () => getFormattedKey(dateList[dateList.length - 1]),
    );

    const allAnsweredResponses = perAssessmentResponse?.area_responses?.map(
        (areaResponse) => areaResponse?.component_responses?.map(
            (componentResponse) => componentResponse.question_responses,
        ),
    ).flat(2).filter(
        (questionResponse) => isDefined(questionResponse?.answer),
    );

    const areaIdToTitleMap = listToMap(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
        (question) => question.component.area.title,
    );

    const ratingIdToValueMap = listToMap(
        perOptionsResponse?.componentratings,
        (rating) => rating.id,
        (rating) => rating.value,
    );

    const groupedResponses = listToGroupList(
        allAnsweredResponses ?? [],
        (response) => response?.answer ?? -1,
    );

    const answerIdToLabelMap = listToMap(
        perOptionsResponse?.answers,
        (answer) => answer.id,
        (answer) => answer.text,
    );

    const groupedResponseList = mapToList(
        groupedResponses,
        (responses, answer) => {
            if (isNotDefined(answer)) {
                return undefined;
            }

            const numericAnswer = Number(answer);

            if (numericAnswer === -1) {
                return undefined;
            }

            return {
                answer: numericAnswer,
                responses,
                answerDisplay: answerIdToLabelMap?.[Number(answer)],
            };
        },
    ).filter(isDefined);

    const averageRatingByAreaMap = listToMap(
        perAssessmentResponse?.area_responses ?? [],
        (areaResponse) => areaResponse?.area ?? -1,
        (areaResponse) => {
            const filteredComponents = areaResponse?.component_responses?.filter(
                (component) => !!component?.rating,
            ) ?? [];

            if (filteredComponents.length === 0) {
                return 0;
            }

            const ratings = filteredComponents.map(
                (component) => (
                    isDefined(component.rating)
                        ? ratingIdToValueMap?.[component.rating]
                        : 0
                ),
            );

            const ratingSum = sumSafe(ratings) ?? 0;
            const avgRating = ratingSum / filteredComponents.length;

            return avgRating;
        },
    );

    const averageRatingByAreaList = mapToList(
        areaIdToTitleMap,
        (title, areaId) => ({
            areaId,
            rating: averageRatingByAreaMap[Number(areaId)] ?? 0,
            areaDisplay: title,
        }),
    );

    const ratingIdToTitleMap = listToMap(
        perOptionsResponse?.componentratings,
        (rating) => rating.id,
        (rating) => rating.title,
    );

    const allAnsweredComponents = perAssessmentResponse?.area_responses?.map(
        (areaResponse) => areaResponse?.component_responses,
    ).flat().filter((component) => !!component?.rating);

    const ratingGroupedComponents = listToGroupList(
        allAnsweredComponents,
        (component) => component?.rating ?? 0,
    );

    const statusGroupedComponentList = mapToList(
        ratingGroupedComponents,
        (components, rating) => ({
            ratingId: Number(rating),
            ratingValue: ratingIdToValueMap?.[Number(rating)],
            ratingDisplay: ratingIdToTitleMap?.[Number(rating)],
            components,
        }),
    );

    const chartValueSelector = useCallback(
        (dataKey: DATA_KEY, date: Date) => (
            perOptionsResponse?.componentratings?.[dataKey]?.[getFormattedKey(date)]?.count ?? 0
        ),
        [perOptionsResponse],
    );

    return (
        <Page
            heading={strings.nSPreparednessAndResponseCapacityHeading}
        >
            <Container
                childrenContainerClassName={styles.perCountryDetails}
            >
                <div className={styles.contactList}>
                    <TextOutput
                        label={strings.startDateTitle}
                        value={aggregatedPer?.date_of_assessment}
                        valueType="date"
                    />
                    {/* FIXME: use TextOutput component */}
                    <div className={styles.contactDetails}>
                        <div>
                            {strings.perPhaseTitle}
                        </div>
                        <h4>
                            {aggregatedPer?.phase_display}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            {strings.focalPointTitle}
                        </div>
                        <h4>
                            {aggregatedPer?.ns_focal_point_name}
                        </h4>
                    </div>
                </div>
                <div className={styles.contactList}>
                    <div className={styles.contactDetails}>
                        <div>
                            {strings.perCycleTitle}
                        </div>
                        <h4>
                            {aggregatedPer?.phase}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            {strings.typeOfAssessmentTitle}
                        </div>
                        <h4>
                            {aggregatedPer?.type_of_assessment?.name}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            {strings.emailTitle}
                        </div>
                        <h4>
                            {aggregatedPer?.ns_focal_point_email}
                        </h4>
                    </div>
                </div>
            </Container>
            <Container
                heading={strings.perAssessmentHeading}
                withHeaderBorder
                childrenContainerClassName={styles.progressBar}
            >
                <PieChart
                    data={statusGroupedComponentList ?? []}
                    valueSelector={(d) => d.ratingValue ?? 0}
                    labelSelector={(d) => d.ratingDisplay}
                    keySelector={(d) => d.ratingId}
                    colors={PIE_COLORS}
                />
                <ProgressBar
                    title={strings.totalBenchmarkSummaryTitle}
                    showPercentageInTitle
                    value={allAnsweredResponses?.length ?? 0}
                    totalValue={questionsResponse?.count}
                    description={(
                        <div className={styles.answerCounts}>
                            {groupedResponseList.map(
                                (groupedResponse) => (
                                    <TextOutput
                                        key={groupedResponse.answer}
                                        label={groupedResponse.answerDisplay}
                                        value={groupedResponse.responses.length}
                                    />
                                ),
                            )}
                        </div>
                    )}
                />
            </Container>
            <Container
                heading={strings.componentsByAreaHeading}
                withHeaderBorder
            >
                <BarChart
                    className={styles.avgComponentRating}
                    data={averageRatingByAreaList ?? []}
                    // FIXME: don't use inline selectors
                    keySelector={(rating) => rating.areaId}
                    valueSelector={(rating) => rating.rating}
                    labelSelector={(rating) => rating.areaDisplay}
                />
            </Container>
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
            <div className={styles.highlightedComponentList}>
                <Container
                    heading={strings.highlightedTopRatedComponentHeading}
                    withHeaderBorder
                >
                    <div className={styles.highlightedComponent}>
                        {highlightedComponent?.map((i) => i?.title)}
                    </div>
                </Container>
                <Container
                    heading={strings.priorityComponentHeading}
                    withHeaderBorder
                >
                    <div className={styles.highlightedComponent}>
                        {strings.componentHeading}
                    </div>
                </Container>
            </div>
        </Page>
    );
}

Component.displayName = 'RegionPreparedness';
