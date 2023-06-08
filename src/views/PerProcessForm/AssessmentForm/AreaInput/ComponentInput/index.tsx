import {
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import { PerFormComponentItem } from '#views/PerProcessForm/common';
import { PartialAssessment } from '#views/PerProcessForm/usePerProcessOptions';
import QuestionInput from './QuestionInput';
import ExpandableContainer from '#components/ExpandableContainer';

import styles from './styles.module.css';

type Value = NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number];

interface Props {
    className?: string;
    component: PerFormComponentItem;
    componentNumber: number;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        componentNumber,
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
        (componentResponse) => componentResponse.question_id,
        (componentResponse, _, componentResponseIndex) => ({
            index: componentResponseIndex,
            value: componentResponse,
        }),
    );

    const componentGroupedQuestions = listToGroupList(
        component ?? [],
        (component) => component.component.id,
    );
    const componentGroupedQuestionList = mapToList(
        componentGroupedQuestions,
        (list) => ({
            component: list[0].question,
            questions: list,
        }),
    );

    return (
        <div className={styles.componentInput}>
            {componentGroupedQuestions.questions.map((question) => (
                <ExpandableContainer
                    key={component.component_id}
                    heading={`${component.component_num}. ${component.title}`}
                    childrenContainerClassName={styles.questionList}
                    headerDescription={component.title}
                >
                    <QuestionInput
                        componentNumber={componentGroupedQuestionList.component.component_num}
                        key={component.id}
                        question={question}
                        index={questionResponseMapping[component.id]?.index}
                        value={questionResponseMapping[component.id]?.value}
                        onChange={setComponentValue}
                    />
                </ExpandableContainer>
            ))}
        </div>
    );
}

export default ComponentInput;
