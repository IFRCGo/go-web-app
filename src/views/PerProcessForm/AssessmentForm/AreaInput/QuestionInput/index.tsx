import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';

import {
    answerKeySelector,
    answerLabelSelector,
    PerFormQuestionItem,
} from '../../../common';
import {
    PartialAssessment,
} from '../../../usePerProcessOptions';

import styles from './styles.module.css';

// FIXME: move this to common file
type Value = NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['form_data']>[number];

interface Props {
    question: PerFormQuestionItem;
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
                name="selected_answer"
                options={question.answers}
                keySelector={answerKeySelector}
                labelSelector={answerLabelSelector}
                value={value?.selected_answer}
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
