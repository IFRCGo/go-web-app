import { useState, useCallback } from 'react';
import { listToMap, listToGroupList, mapToList } from '@togglecorp/fujs';
import { SetValueArg, useFormObject } from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import BlockLoading from '#components/BlockLoading';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import Checkbox from '#components/Checkbox';
import {
    ListResponse,
    useRequest,
} from '#utils/restRequest';
import type { GET } from '#types/serverResponse';
import useTranslation from '#hooks/useTranslation';

import { PartialPrioritization } from '../common';
import QuestionOutput from './QuestionOutput';

import i18n from '../i18n.json';
import styles from './styles.module.css';

type Value = NonNullable<PartialPrioritization['component_responses']>[number];

interface PerFormQuestionItem {
    id: number;
    question: string;
    answers: {
        id: number;
        text: string;
    }[];
    question_num: number;
    is_benchmark?: boolean;
    is_epi?: boolean;
}

interface QuestionResponse {
    id: number;
    question: number;
    answer: number;
    notes: string;
}

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: GET['api/v2/per-formcomponent']['results'][number];
    onSelectionChange: (checked: boolean, index: number, componentId: number) => void;
    questionResponses: QuestionResponse[];
}

function ComponentsInput(props: Props) {
    const {
        index,
        value,
        onChange,
        component,
        onSelectionChange,
        questionResponses,
    } = props;

    const [expanded, setExpanded] = useState(false);
    const strings = useTranslation(i18n);

    const {
        pending: formQuestionsPending,
        response: formQuestions,
    } = useRequest<ListResponse<PerFormQuestionItem>>({
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
        (questionResponse) => mappedQuestions[questionResponse.question]
            ?.answerMap[questionResponse.answer],
    );

    const numResponses = mappedQuestionResponses ? Object.keys(mappedQuestionResponses).length : 0;
    const answerStats = formQuestions ? mapToList(
        listToGroupList(
            Object.values(mappedQuestionResponses ?? {}),
            (response) => response,
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
                <TextInput
                    name="justification_text"
                    value={value?.justification_text}
                    onChange={onFieldChange}
                    placeholder={strings.perFormEnterJustification}
                    disabled={!value}
                />
            )}
        >
            {formQuestionsPending && (
                <BlockLoading />
            )}
            {formQuestions && formQuestions.results.map(
                (perFormQuestion) => {
                    // TODO: include these
                    if (perFormQuestion.is_benchmark || perFormQuestion.is_epi) {
                        return null;
                    }

                    return (
                        <QuestionOutput
                            key={perFormQuestion.id}
                            question={perFormQuestion.question}
                            questionNum={perFormQuestion.question_num}
                            componentNum={component.component_num}
                            answer={mappedQuestionResponses?.[perFormQuestion.id]}
                        />
                    );
                },
            )}
        </ExpandableContainer>
    );
}

export default ComponentsInput;
