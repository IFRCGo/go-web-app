import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';
import type { paths } from '#generated/types';

import type { PartialAssessment } from '../../../schema';

import styles from './styles.module.css';

type AreaResponse = NonNullable<PartialAssessment['area_responses']>[number]
type ComponentResponse = NonNullable<AreaResponse['component_responses']>[number];

type Value = NonNullable<ComponentResponse['question_responses']>[number];

type PerFormQuestionResponse = paths['/api/v2/per-formquestion/']['get']['responses']['200']['content']['application/json'];
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
    readOnly?: boolean;
}

function QuestionInput(props: Props) {
    const {
        onChange,
        index,
        value,
        question,
        componentNumber,
        readOnly,
    } = props;

    const setFieldValue = useFormObject(
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
            headerDescription={question.description}
        >
            <RadioInput
                name="answer"
                options={question.answers}
                keySelector={answerKeySelector}
                labelSelector={answerLabelSelector}
                value={value?.answer}
                onChange={setFieldValue}
                clearable
                readOnly={readOnly}
            />
            <TextArea
                className={styles.noteSection}
                // FIXME: use translation
                placeholder="Notes and verification means"
                name="notes"
                value={value?.notes}
                onChange={setFieldValue}
                rows={2}
                readOnly={readOnly}
            />
        </Container>
    );
}

export default QuestionInput;
