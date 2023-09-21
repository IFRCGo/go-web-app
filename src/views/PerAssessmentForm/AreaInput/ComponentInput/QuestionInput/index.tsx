import { useMemo } from 'react';
import {
    SetValueArg,
    useFormObject,
    getErrorObject,
    Error,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import Container from '#components/Container';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';
import { type GoApiResponse } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';

import type { PartialAssessment } from '../../../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

type AreaResponse = NonNullable<PartialAssessment['area_responses']>[number]
type ComponentResponse = NonNullable<AreaResponse['component_responses']>[number];

type Value = NonNullable<ComponentResponse['question_responses']>[number];

type PerFormQuestionResponse = GoApiResponse<'/api/v2/per-formquestion/'>;
type PerFormQuestion = NonNullable<PerFormQuestionResponse['results']>[number];
type PerFormAnswer = PerFormQuestion['answers'][number];

function answerKeySelector(answer: PerFormAnswer) {
    return answer.id;
}

function answerLabelSelector(answer: PerFormAnswer) {
    return answer.text;
}

interface Props {
    question: PerFormQuestion;
    componentNumber: number;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    error: Error<Value> | undefined;
    readOnly?: boolean;
    disabled?: boolean;
}

function QuestionInput(props: Props) {
    const {
        onChange,
        index,
        value,
        question,
        error: formError,
        componentNumber,
        readOnly,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            question: question.id,
        }),
    );

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    return (
        <Container
            className={styles.questionInput}
            heading={
                isDefined(question.question_num)
                    ? `${componentNumber}.${question.question_num}. ${question.question}`
                    : question.question
            }
            headingLevel={5}
            childrenContainerClassName={styles.content}
            headerDescription={question.description}
        >
            <NonFieldError error={error} />
            <RadioInput
                name="answer"
                options={question.answers}
                keySelector={answerKeySelector}
                labelSelector={answerLabelSelector}
                value={value?.answer}
                error={error?.answer}
                disabled={disabled}
                onChange={setFieldValue}
                clearable
                readOnly={readOnly}
            />
            <TextArea
                className={styles.noteSection}
                placeholder={strings.placeholderNotesAndVerification}
                name="notes"
                value={value?.notes}
                error={error?.notes}
                onChange={setFieldValue}
                disabled={disabled}
                rows={2}
                readOnly={readOnly}
            />
        </Container>
    );
}

export default QuestionInput;
