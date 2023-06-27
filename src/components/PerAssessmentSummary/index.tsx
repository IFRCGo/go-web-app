import {
    listToMap,
    listToGroupList,
    mapToList,
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import ProgressBar from '#components/ProgressBar';
import StackedProgressBar from '#components/StackedProgressBar';
import TextOutput from '#components/TextOutput';
import BarChart from '#components/BarChart';
import { sumSafe } from '#utils/common';
import type { GET } from '#types/serverResponse';

import styles from './styles.module.css';

type AssessmentResponse = GET['api/v2/per-assessment/:id'];
type AreaResponse = AssessmentResponse['area_responses'][number];
type ComponentResponse = AreaResponse['component_responses'][number];
interface AssessmentFormFields extends Omit<AssessmentResponse, 'id' | 'user' | 'area_responses'>{
    area_responses: (Omit<AreaResponse, 'area_details' | 'id' | 'is_draft' | 'component_responses'> & {
        component_responses: Omit<ComponentResponse, 'rating_details'>[];
    })[];
}
type PartialAssessment = PartialForm<AssessmentFormFields, 'area' | 'component' | 'question' | 'consideration'>;

interface Props {
    className?: string;
    perOptionsResponse?: GET['api/v2/per-options'];
    areaResponses?: PartialAssessment['area_responses'];
    totalQuestionCount?: number;
    areaIdToTitleMap: Record<number, string>;
}

const colors = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-70)',
    'var(--go-ui-color-red-50)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function PerAssessmentSummary(props: Props) {
    const {
        className,
        perOptionsResponse,
        areaResponses,
        totalQuestionCount,
        areaIdToTitleMap,
    } = props;

    const ratingIdToTitleMap = listToMap(
        perOptionsResponse?.componentratings,
        (rating) => rating.id,
        (rating) => rating.title,
    );

    const ratingIdToValueMap = listToMap(
        perOptionsResponse?.componentratings,
        (rating) => rating.id,
        (rating) => rating.value,
    );

    const answerIdToLabelMap = listToMap(
        perOptionsResponse?.answers,
        (answer) => answer.id,
        (answer) => answer.text,
    );

    const allAnsweredResponses = areaResponses?.map(
        (areaResponse) => areaResponse?.component_responses?.map(
            (componentResponse) => componentResponse.question_responses,
        ),
    ).flat(2).filter(
        (questionResponse) => isDefined(questionResponse?.answer),
    );

    const groupedResponses = listToGroupList(
        allAnsweredResponses ?? [],
        (response) => response?.answer ?? -1,
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

    const allAnsweredComponents = areaResponses?.map(
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

    const averageRatingByAreaMap = listToMap(
        areaResponses ?? [],
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

    // NOTE: We need to discuss UI of this component
    return (
        <ExpandableContainer
            className={_cs(styles.perAssessmentSummary, className)}
            // FIXME: use translation
            actions="Show Summary"
            childrenContainerClassName={styles.content}
        >
            <div className={styles.totalProgress}>
                <ProgressBar
                    title="Answered: "
                    showPercentageInTitle
                    value={allAnsweredResponses?.length ?? 0}
                    totalValue={totalQuestionCount}
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
            </div>
            <StackedProgressBar
                className={styles.componentRating}
                data={statusGroupedComponentList ?? []}
                // FIXME: don't use inline selectors
                valueSelector={
                    (statusGroupedComponent) => (
                        statusGroupedComponent.components.length
                    )
                }
                colorSelector={(_, i) => colors[i]}
                labelSelector={
                    (statusGroupedComponent) => `${statusGroupedComponent.ratingValue}-${statusGroupedComponent.ratingDisplay}`
                }
            />
            <BarChart
                className={styles.avgComponentRating}
                data={averageRatingByAreaList}
                // FIXME: don't use inline selectors
                keySelector={(rating) => rating.areaId}
                valueSelector={(rating) => rating.rating}
                labelSelector={(rating) => rating.areaDisplay}
            />
        </ExpandableContainer>
    );
}

export default PerAssessmentSummary;
