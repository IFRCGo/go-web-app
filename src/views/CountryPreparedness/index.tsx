import { useState } from 'react';
import { PartialForm, useForm } from '@togglecorp/toggle-form';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import { sumSafe } from '#utils/common';
import { getDatesSeparatedByYear } from '#utils/chart';
import { GET, PerAssessmentResponse, PerCountryApiResponse } from '#types/serverResponse';
import { ListResponse, useRequest } from '#utils/restRequest';
import PieChart from '#views/GlobalThreeW/PieChart';
import useTranslation from '#hooks/useTranslation';
import { assessmentSchema } from '#views/PerAssessmentForm/common';
import Container from '#components/Container';
import Page from '#components/Page';
import TextOutput from '#components/TextOutput';
import ProgressBar from '#components/ProgressBar';
import BarChart from '#components/BarChart';
import TimeSeriesChart from '#components/TimeSeriesChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AssessmentResponse = GET['api/v2/per-assessment/:id'];
type AreaResponse = AssessmentResponse['area_responses'][number];
type ComponentResponse = AreaResponse['component_responses'][number];
interface AssessmentFormFields extends Omit<AssessmentResponse, 'id' | 'user' | 'area_responses'> {
    area_responses: (Omit<AreaResponse, 'area_details' | 'id' | 'is_draft' | 'component_responses'> & {
        component_responses: Omit<ComponentResponse, 'rating_details'>[];
    })[];
}
type PartialAssessment = PartialForm<AssessmentFormFields, 'area' | 'component' | 'question' | 'consideration'>;

type PerFormQuestionResponse = GET['api/v2/per-formquestion'];
type PerFormArea = PerFormQuestionResponse['results'][number]['component']['area'];
const defaultFormAreas: PerFormArea[] = [];

type DATA_KEY = 'dref' | 'emergencyAppeal';

function perAssessmentRatingTypeKeySelector(
    perAssessmentRatingType: PerAssessmentResponse['area_responses'][number],
) {
    return perAssessmentRatingType.id;
}

const defaultFormValue: PartialAssessment = {
    is_draft: true,
    area_responses: [],
};

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

const now = new Date();
const startDate = new Date(now.getFullYear() - 10, 0, 1);
const endDate = new Date(now.getFullYear(), 11, 31);
const dateList = getDatesSeparatedByYear(startDate, endDate);

const dataKeyToClassNameMap = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
};

const classNameSelector = (dataKey: DATA_KEY) => dataKeyToClassNameMap[dataKey];
const xAxisFormatter = (date: Date) => date.toLocaleString(undefined, { year: 'numeric' });

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
    const {
        value,
        setValue,
    } = useForm(
        assessmentSchema,
        { value: defaultFormValue },
    );

    const strings = useTranslation(i18n);

    const {
        pending: perAssessmentPending,
        response: perAssessmentResponse,
    } = useRequest<PerAssessmentResponse>({
        url: `api/v2/per-assessment/19`,
        onSuccess: (response) => {
            if (response) {
                setValue(response);
            }
        },
    });

    const ratingDetail = perAssessmentResponse?.area_responses?.map(
        (component) => component.component_responses?.map(
            (rating) => rating.rating_details
        )
    );

    const highlightedComponent = ratingDetail?.map(
        (rating) => rating.find(item => item?.value === 5)
    );

    const highlightedRatingDetail = perAssessmentResponse?.area_responses?.map(
        (component) => component.component_responses?.map(
            (rating) => rating.component
        )
    );

    console.warn('highlighted', highlightedRatingDetail);

    //FIX ME: Add From Service response
    const {
        pending: perCountryPending,
        response: perCountryResponse,
    } = useRequest<ListResponse<PerCountryApiResponse>>({
        url: `api/v2/per-country/?country_id=123`,
    });

    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options',
    });
    const {
        pending: questionsPending,
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

    const allAnsweredResponses = value?.area_responses?.map(
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
        value?.area_responses ?? [],
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

    const allAnsweredComponents = value?.area_responses?.map(
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

    return (
        <Page
            heading='NS Preparedness and Response Capacity'
        >
            <Container
                childrenContainerClassName={styles.perCountryDetails}
            >
                <div className={styles.contactList}>
                    <div className={styles.contactDetails}>
                        <div>
                            Start Date
                        </div>
                        <h4>
                            {perCountryResponse?.results?.map((i) => i.date_of_assessment)}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            Per Phase
                        </div>
                        <h4>
                            {perCountryResponse?.results?.map((i) => i.phase_display)}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            Focal Point
                        </div>
                        <h4>
                            {perCountryResponse?.results?.map((i) => i.ns_focal_point_name)}
                        </h4>
                    </div>
                </div>
                <div className={styles.contactList}>
                    <div className={styles.contactDetails}>
                        <div>
                            Per Cycle
                        </div>
                        <h4>
                            {perCountryResponse?.results?.map((i) => i.phase)}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            Type of Assessment
                        </div>
                        <h4>
                            {perCountryResponse?.results?.map((i) => i.type_of_assessment?.name)}
                        </h4>
                    </div>
                    <div className={styles.contactDetails}>
                        <div>
                            Email
                        </div>
                        <h4>
                            {perCountryResponse?.results?.map((i) => i.ns_focal_point_email)}
                        </h4>
                    </div>
                </div>
            </Container>
            <Container
                heading="Per Assessment Result"
                withHeaderBorder
            >
                <ProgressBar
                    title="Total Benchmark Summary: "
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
                <PieChart
                    data={statusGroupedComponentList}
                    valueSelector={(statusGroupedComponent) => (
                        statusGroupedComponent.components.length
                    )}
                    labelSelector={
                        (statusGroupedComponent) => `${statusGroupedComponent.ratingValue}-${statusGroupedComponent.ratingDisplay}`
                    }
                    keySelector={perAssessmentRatingTypeKeySelector}
                    colors={PIE_COLORS}
                />
            </Container>
            <Container
                heading="Components by Area"
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
            {/* <Container
                heading={strings.PreviousPerAssessment}
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
            </Container> */}
            <Container
                heading="Highlighted Top Rated Component"
                withHeaderBorder
            >
                <div className={styles.highlightedComponent}>
                    {highlightedComponent?.map((i) => i?.title)}
                </div>
            </Container>
        </Page>
    );
}

Component.displayName = 'RegionPreparedness';
