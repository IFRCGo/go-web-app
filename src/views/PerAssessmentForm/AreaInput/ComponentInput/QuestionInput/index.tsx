import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';

import type { GET } from '#types/serverResponse';

import {
    PartialAssessment,
} from '../../../common';

import styles from './styles.module.css';

type Value = NonNullable<NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number]['question_responses']>[number];
type PerFormQuestion = GET['api/v2/per-formquestion']['results'][number];
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
}

function QuestionInput(props: Props) {
    const {
        onChange,
        index,
        value,
        question,
        componentNumber,
    } = props;

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            question: question.id,
        }),
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
        >
            <RadioInput
                name="answer"
                options={question.answers}
                keySelector={answerKeySelector}
                labelSelector={answerLabelSelector}
                value={value?.answer}
                onChange={onFieldChange}
            />
            <TextArea
                className={styles.noteSection}
                placeholder="Notes"
                name="notes"
                value={value?.notes}
                onChange={onFieldChange}
                rows={2}
            />
        </Container>
    );
}

export default QuestionInput;
