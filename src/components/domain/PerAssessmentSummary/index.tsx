import {
    listToMap,
    listToGroupList,
    mapToList,
    _cs,
    isDefined,
    isNotDefined,
    compareNumber,
} from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import ProgressBar from '#components/ProgressBar';
import NumberOutput from '#components/NumberOutput';
import StackedProgressBar from '#components/StackedProgressBar';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { sumSafe } from '#utils/common';
import { resolveToString } from '#utils/translation';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type AssessmentRequestBody = GoApiResponse<'/api/v2/per-assessment/{id}/', 'PATCH'>;

export type PartialAssessment = PartialForm<
    AssessmentRequestBody,
    'area' | 'component' | 'question'
>;

interface Props {
    className?: string;
    perOptionsResponse: PerOptionsResponse | undefined;
    areaResponses: PartialAssessment['area_responses'] | undefined;
    totalQuestionCount: number | undefined;
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

    const strings = useTranslation(i18n);

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
    ).flat().filter((component) => isDefined(component?.rating));

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
    )?.sort(
        (a, b) => compareNumber(a.ratingValue, b.ratingValue, -1),
    );

    const averageRatingByAreaMap = listToMap(
        areaResponses ?? [],
        (areaResponse) => areaResponse?.area ?? -1,
        (areaResponse) => {
            // NOTE: do we take the average of only rated components or of all the 
            // components?
            const filteredComponents = areaResponse?.component_responses?.filter(
                (component) => isDefined(component?.rating),
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
        (_, areaId) => ({
            areaId,
            rating: averageRatingByAreaMap[Number(areaId)] ?? 0,
            areaDisplay: resolveToString(
                strings.multiImageArea,
                { areaId },
            ),
        }),
    );

    const description = isDefined(allAnsweredResponses) && isDefined(totalQuestionCount)
        ? `${allAnsweredResponses?.length ?? 0} / ${resolveToString(
            strings.benchmarksAssessed,
            { totalQuestionCount },
        )}`
        : undefined;

    // NOTE: We need to discuss UI of this component
    return (
        <ExpandableContainer
            className={_cs(styles.perAssessmentSummary, className)}
            heading={strings.perAssessmentSummaryHeading}
            headerDescription={description}
            childrenContainerClassName={styles.content}
            withHeaderBorder
            spacing="comfortable"
        >
            <div className={styles.totalProgress}>
                <ProgressBar
                    title={resolveToString(
                        strings.benchmarksAssessedTitle,
                        {
                            allAnsweredResponses: (
                                allAnsweredResponses?.length ?? '--'
                            ),
                            totalQuestionCount,
                        },
                    )}
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
                                        strongValue
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
                // FIXME: don't use inline selectors
                colorSelector={(_, i) => colors[i]}
                // FIXME: don't use inline selectors
                labelSelector={
                    (statusGroupedComponent) => `${statusGroupedComponent.ratingValue}-${statusGroupedComponent.ratingDisplay}`
                }
            />
            <div className={styles.avgComponentRating}>
                {averageRatingByAreaList.map(
                    (rating) => (
                        <div
                            className={styles.areaRating}
                            key={rating.areaId}
                        >
                            <NumberOutput
                                className={styles.ratingValue}
                                value={rating.rating}
                            />
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.filledBar}
                                    style={{
                                        // FIXME: Use percent function
                                        height: `${(100 * (rating.rating ?? 0)) / (averageRatingByAreaList.length ?? 1)}%`,
                                    }}
                                />
                            </div>
                            <div>
                                {rating.areaDisplay}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </ExpandableContainer>
    );
}

export default PerAssessmentSummary;
