import {
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { listToMap, _cs } from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import {
    PerFormComponentItem,
    PerFormQuestionItem,
    PartialAssessment,
} from '../../common';
import QuestionInput from './QuestionInput';

import styles from './styles.module.css';

type Value = NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number];

interface Props {
    className?: string;
    component: PerFormComponentItem;
    questions: PerFormQuestionItem[];
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    handleTotalAnswer: (val: number) => void;
}

function ComponentInput(props: Props) {
    const {
        className,
        onChange,
        index,
        value,
        component,
        questions,
        handleTotalAnswer,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const {
        setValue: setComponentValue,
    } = useFormArray('question_responses', setFieldValue);

    const questionResponseMapping = listToMap(
        value?.question_responses ?? [],
        (questionResponse) => questionResponse.question,
        (questionResponse, _, componentResponseIndex) => ({
            index: componentResponseIndex,
            value: questionResponse,
        }),
    );

    const sumTotalAnswer = questions.reduce((acc, cur) => {
        return acc + cur.answers.length
    }, 0);

    handleTotalAnswer(sumTotalAnswer);

    return (
        <ExpandableContainer
            className={_cs(styles.componentInput, className)}
            key={component.component_id}
            heading={`${component.component_num}. ${component.title}`}
            childrenContainerClassName={styles.questionList}
            headerDescription={component.title}
        >
            {questions?.map((question) => (
                <QuestionInput
                    componentNumber={component.component_num}
                    key={question.id}
                    question={question}
                    index={questionResponseMapping[question.id]?.index}
                    value={questionResponseMapping[question.id]?.value}
                    onChange={setComponentValue}
                />
            ))}
        </ExpandableContainer>
    );
}

export default ComponentInput;
