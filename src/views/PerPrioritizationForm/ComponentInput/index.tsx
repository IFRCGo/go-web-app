import { useState, useCallback } from 'react';
import {
    listToMap,
    listToGroupList,
    mapToList,
    isNotDefined,
} from '@togglecorp/fujs';
import { SetValueArg, useFormObject } from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import BlockLoading from '#components/BlockLoading';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import Checkbox from '#components/Checkbox';
import { useRequest } from '#utils/restRequest';
import type { GET } from '#types/serverResponse';
import useTranslation from '#hooks/useTranslation';

import { PartialPrioritization } from '../common';
import QuestionOutput from './QuestionOutput';

import i18n from '../i18n.json';
import styles from './styles.module.css';

type AssessmentResponse = GET['api/v2/per-assessment/:id'];
type AreaResponse = AssessmentResponse['area_responses'][number];
type ComponentResponse = AreaResponse['component_responses'][number];

type Value = NonNullable<PartialPrioritization['component_responses']>[number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: GET['api/v2/per-formcomponent']['results'][number];
    onSelectionChange: (checked: boolean, index: number, componentId: number) => void;
    questionResponses: ComponentResponse['question_responses'];
    ratingDisplay?: string | undefined | null;
}

function ComponentsInput(props: Props) {
    const {
        index,
        value,
        onChange,
        component,
        onSelectionChange,
        questionResponses,
        ratingDisplay,
    } = props;

    const [expanded, setExpanded] = useState(false);
    const strings = useTranslation(i18n);

    const {
        pending: formQuestionsPending,
        response: formQuestions,
    } = useRequest<GET['api/v2/per-formquestion']>({
        skip: !expanded,
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
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
        questionResponses,
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
            (response) => response.answerDisplay,
        ),
        (item, key) => ({ answer: key, num: item.length }),
    ) : [];

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const handleCheck = useCallback((checked: boolean, checkIndex: number) => {
        onSelectionChange(checked, checkIndex, component.id);
    }, [component.id, onSelectionChange]);

    return (
        <ExpandableContainer
            className={styles.componentInput}
            onExpansionChange={setExpanded}
            headingContainerClassName={styles.header}
            // FIXME: use translations
            heading={`${component?.component_num}. ${component.title} (${numResponses} answered)`}
            headerDescriptionClassName={styles.stats}
            headerDescription={expanded && answerStats.length > 0 ? (
                answerStats.map((answerStat) => (
                    <TextOutput
                        key={answerStat.answer}
                        label={answerStat.answer}
                        value={answerStat.num}
                    />
                ))
            ) : null}
            icons={(
                <Checkbox
                    name={index}
                    value={!!value}
                    onChange={handleCheck}
                />
            )}
            actions={(
                <>
                    {ratingDisplay && (
                        <div>
                            {ratingDisplay}
                        </div>
                    )}
                    <TextInput
                        name="justification_text"
                        value={value?.justification_text}
                        onChange={onFieldChange}
                        placeholder={strings.perFormEnterJustification}
                        disabled={!value}
                    />
                </>
            )}
        >
            {formQuestionsPending && (
                <BlockLoading />
            )}
            {formQuestions && formQuestions.results.map(
                (perFormQuestion) => {
                    // TODO: remove these from server
                    if (perFormQuestion.is_benchmark
                        || perFormQuestion.is_epi
                        || isNotDefined(perFormQuestion.question_num)
                    ) {
                        return null;
                    }

                    return (
                        <QuestionOutput
                            key={perFormQuestion.id}
                            question={perFormQuestion.question}
                            questionNum={perFormQuestion.question_num}
                            componentNum={component.component_num}
                            answer={mappedQuestionResponses?.[perFormQuestion.id]?.answerDisplay}
                            notes={mappedQuestionResponses?.[perFormQuestion.id]?.notes}
                        />
                    );
                },
            )}
        </ExpandableContainer>
    );
}

export default ComponentsInput;
