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
import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';

import type { PartialPrioritization } from '../schema';
import QuestionOutput from './QuestionOutput';

import i18n from '../i18n.json';
import styles from './styles.module.css';
import Container from '#components/Container';

type AssessmentResponse = paths['/api/v2/per-assessment/{id}/']['put']['responses']['200']['content']['application/json'];
type AreaResponse = NonNullable<AssessmentResponse['area_responses']>[number];
type ComponentResponse = NonNullable<AreaResponse['component_responses']>[number];
type PerFormQuestionResponse = paths['/api/v2/per-formquestion/']['get']['responses']['200']['content']['application/json'];

type PerFormComponentResponse = paths['/api/v2/per-formcomponent/']['get']['responses']['200']['content']['application/json'];

type Value = NonNullable<PartialPrioritization['component_responses']>[number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: NonNullable<PerFormComponentResponse['results']>[number];
    questionResponses: ComponentResponse['question_responses'];
    ratingDisplay?: string | undefined | null;
}

function ComponentsInput(props: Props) {
    const {
        index,
        value,
        onChange,
        component,
        questionResponses,
        ratingDisplay,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: formQuestionsPending,
        response: formQuestions,
    } = useRequest<PerFormQuestionResponse>({
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

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const componentNum = component.component_num;
    if (!componentNum) {
        return null;
    }

    return (
        <>
            {ratingDisplay && (
                <Container
                    className={styles.componentInput}
                    headingContainerClassName={styles.header}
                    heading={`${strings.componentHeading} ${component?.component_num}: ${component.title}`}
                    headerDescriptionClassName={styles.stats}
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
                                onChange={setFieldValue}
                                placeholder="Comment"
                            />
                        </>
                    )}
                >
                </Container>
            )}
        </>
    );
}

export default ComponentsInput;
