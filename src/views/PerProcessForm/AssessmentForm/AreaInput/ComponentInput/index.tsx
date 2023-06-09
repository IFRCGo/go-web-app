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
} from '#views/PerProcessForm/common';
import { PartialAssessment } from '#views/PerProcessForm/usePerProcessOptions';
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
}

function ComponentInput(props: Props) {
    const {
        className,
        onChange,
        index,
        value,
        component,
        questions,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component_id: component.id,
        }),
    );

    const {
        setValue: setComponentValue,
    } = useFormArray('question_responses', setFieldValue);

    const questionResponseMapping = listToMap(
        value?.question_responses ?? [],
        (questionResponse) => questionResponse.question_id,
        (questionResponse, _, componentResponseIndex) => ({
            index: componentResponseIndex,
            value: questionResponse,
        }),
    );

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
