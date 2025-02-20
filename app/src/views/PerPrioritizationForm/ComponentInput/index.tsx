import {
    useCallback,
    useState,
} from 'react';
import {
    BlockLoading,
    Checkbox,
    ExpandableContainer,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import type { PartialPrioritization } from '../schema';
import QuestionOutput from './QuestionOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AssessmentResponse = GoApiResponse<'/api/v2/per-assessment/{id}/'>;
type AreaResponse = NonNullable<AssessmentResponse['area_responses']>[number];
type ComponentResponse = NonNullable<AreaResponse['component_responses']>[number];

type PerFormComponentResponse = GoApiResponse<'/api/v2/per-formcomponent/'>;
type Value = NonNullable<PartialPrioritization['prioritized_action_responses']>[number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    error: Error<Value> | undefined;
    component: NonNullable<PerFormComponentResponse['results']>[number];
    onSelectionChange: (checked: boolean, index: number, componentId: number) => void;
    questionResponses: ComponentResponse['question_responses'];
    ratingDisplay?: string | undefined | null;
    readOnly?: boolean;
    disabled?: boolean;
}

function ComponentInput(props: Props) {
    const {
        index,
        value,
        onChange,
        component,
        onSelectionChange,
        questionResponses,
        ratingDisplay,
        readOnly,
        error: errorFromProps,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const [expanded, setExpanded] = useState(false);

    const {
        pending: formQuestionsPending,
        response: formQuestions,
    } = useRequest({
        skip: !expanded,
        url: '/api/v2/per-formquestion/',
        query: {
            limit: 9999,
            component: component.id,
        },
    });

    const mappedQuestions = listToMap(
        formQuestions?.results ?? [],
        (formQuestion) => formQuestion.id,
        (formQuestion) => ({
            ...formQuestion,
            answerMap: listToMap(
                formQuestion.answers,
                (answer) => answer.id,
                (answer) => answer.text,
            ),
        }),
    );

    const mappedQuestionResponses = listToMap(
        questionResponses?.map(
            (questionResponse) => {
                const {
                    question,
                    answer,
                } = questionResponse;
                if (isNotDefined(question) || isNotDefined(answer)) {
                    return null;
                }

                return {
                    ...questionResponse,
                    question,
                    answer,
                };
            },
        ).filter(isDefined) ?? [],
        (questionResponse) => questionResponse.question,
        (questionResponse) => ({
            answer: questionResponse.answer,
            notes: questionResponse.notes,
            answerDisplay: mappedQuestions[questionResponse.question]
                ?.answerMap[questionResponse.answer],
        }),
    );

    const numResponses = mappedQuestionResponses ? Object.keys(mappedQuestionResponses).length : 0;
    const answerStats = formQuestions ? mapToList(
        listToGroupList(
            Object.values(mappedQuestionResponses ?? {}),
            // FIXME: check why answerDisplay can be undefined
            (response) => response.answerDisplay ?? '??',
        ),
        (item, key) => ({ answer: key, num: item.length }),
    ) : [];

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const handleCheck = useCallback((checked: boolean, checkIndex: number) => {
        onSelectionChange(checked, checkIndex, component.id);
    }, [component.id, onSelectionChange]);

    const componentNum = component.component_num;

    const error = getErrorObject(errorFromProps);

    if (isNotDefined(componentNum)) {
        return null;
    }

    return (
        <ExpandableContainer
            className={styles.componentInput}
            onExpansionChange={setExpanded}
            heading={isTruthyString(component.component_letter)
                ? `${component.component_num}(${component.component_letter}). ${component.title}`
                : `${component.component_num}. ${component.title}`}
            headingLevel={4}
            spacing="comfortable"
            icons={(
                <Checkbox
                    name={index}
                    value={isDefined(value)}
                    onChange={handleCheck}
                    readOnly={readOnly}
                />
            )}
            headerDescriptionContainerClassName={styles.headerDescription}
            headerDescription={(
                <>
                    <div className={styles.additionalInformation}>
                        <div>
                            {ratingDisplay ?? strings.notReviewed}
                        </div>
                        <div className={styles.separator} />
                        <div>
                            {resolveToComponent(
                                strings.benchmarksAssessed,
                                { count: numResponses },
                            )}
                        </div>
                        {expanded && answerStats.length > 0 && (
                            <div className={styles.answersByCount}>
                                {answerStats.map((answerStat) => (
                                    <TextOutput
                                        key={answerStat.answer}
                                        label={answerStat.answer}
                                        value={answerStat.num}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <NonFieldError error={error} />
                    <TextArea
                        name="justification_text"
                        value={value?.justification_text}
                        onChange={setFieldValue}
                        placeholder={strings.perJustification}
                        disabled={isNotDefined(value) || disabled}
                        rows={2}
                        error={error?.justification_text}
                        readOnly={readOnly}
                    />
                </>
            )}
        >
            {formQuestionsPending && (
                <BlockLoading />
            )}
            <NonFieldError
                error={error}
                withFallbackError
            />
            {/* FIXME: use List */}
            {formQuestions && formQuestions.results?.map(
                (perFormQuestion) => (
                    <QuestionOutput
                        key={perFormQuestion.id}
                        question={perFormQuestion.question}
                        questionNum={perFormQuestion.question_num}
                        componentNum={componentNum}
                        answer={mappedQuestionResponses?.[perFormQuestion.id]?.answerDisplay}
                        notes={mappedQuestionResponses?.[perFormQuestion.id]?.notes}
                    />
                ),
            )}
        </ExpandableContainer>
    );
}

export default ComponentInput;
