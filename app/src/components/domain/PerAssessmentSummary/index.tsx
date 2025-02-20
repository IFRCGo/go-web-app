import {
    ExpandableContainer,
    NumberOutput,
    ProgressBar,
    StackedProgressBar,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    resolveToString,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import { type PartialForm } from '@togglecorp/toggle-form';

import {
    getPerAreaColor,
    getPerRatingColor,
} from '#utils/domain/per';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type AssessmentRequestBody = GoApiResponse<'/api/v2/per-assessment/{id}/', 'PATCH'>;

type PartialAssessment = PartialForm<
    AssessmentRequestBody,
    'area' | 'component' | 'question'
>;

interface Props {
    className?: string;
    perOptionsResponse: PerOptionsResponse | undefined;
    areaResponses: PartialAssessment['area_responses'] | undefined;
    totalQuestionCount: number | undefined;
    areaIdToTitleMap: Record<number, string | undefined>;
}

const progressBarColor = 'var(--go-ui-color-dark-blue-40)';

function numberOfComponentsSelector({ components } : { components: unknown[]}) {
    return components.length;
}

function perRatingColorSelector({ ratingValue }: { ratingValue: number | undefined }) {
    return getPerRatingColor(ratingValue);
}

function perRatingLabelSelector({
    ratingValue,
    ratingDisplay,
}: {
    ratingValue?: number;
    ratingDisplay?: string;
}): string {
    return `${ratingValue}-${ratingDisplay}`;
}

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
            // Also, 'component.rating' refers to the component ID and is misnamed.
            const filteredComponents = areaResponse?.component_responses?.filter(
                (component) => isDefined(component?.rating)
                    && component.rating !== 1,
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

    // FIXME: It does not make sense to receive a map to only use it's key
    const averageRatingByAreaList = mapToList(
        areaIdToTitleMap,
        (_, areaId) => ({
            areaId,
            rating: averageRatingByAreaMap[Number(areaId)] ?? 0,
            areaDisplay: resolveToString(
                strings.perArea,
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
                    color={progressBarColor}
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
                valueSelector={numberOfComponentsSelector}
                colorSelector={perRatingColorSelector}
                labelSelector={perRatingLabelSelector}
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
                                        height: `${getPercentage(rating.rating, averageRatingByAreaList.length)}%`,
                                        backgroundColor: getPerAreaColor(Number(rating.areaId)),
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
