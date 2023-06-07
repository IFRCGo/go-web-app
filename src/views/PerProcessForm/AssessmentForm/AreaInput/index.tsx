import {
    SetValueArg,
    useFormObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import { PerFormQuestionItem, Area } from '../../common';

import QuestionInput from './QuestionInput';
import { PartialAssessment } from '../../usePerProcessOptions';

import styles from './styles.module.css';

// FIXME: move this to common file
type Value = NonNullable<PartialAssessment['area_responses']>[number];

interface Props {
    className?: string;
    // error: ArrayError<Value> | undefined;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    value: Value;
    index: number | undefined;
    questions: PerFormQuestionItem[] | undefined;
    area: Area;
}

function AreaInput(props: Props) {
    const {
        className,
        onChange,
        value,
        index,
        area,
        questions,
        // error,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            area: area.id,
        }),
    );

    const {
        setValue: setQuestionResponseValue,
    } = useFormArray('form_data', setFieldValue);

    const questionResponseMapping = listToMap(
        value?.form_data ?? [],
        (questionResponse) => questionResponse.question,
        (questionResponse, _, questionResponseIndex) => ({
            index: questionResponseIndex,
            value: questionResponse,
        }),
    );

    const componentGroupedQuestions = listToGroupList(
        questions ?? [],
        (question) => question.component.id,
    );
    const componentGroupedQuestionList = mapToList(
        componentGroupedQuestions,
        (list) => ({
            component: list[0].component,
            questions: list,
        }),
    );

    return (
        <div className={styles.areaInput}>
            {componentGroupedQuestionList.map((questionGroupedComponent) => (
                <ExpandableContainer
                    key={questionGroupedComponent.component.id}
                    heading={`${questionGroupedComponent.component.component_num}. ${questionGroupedComponent.component.title}`}
                    childrenContainerClassName={styles.questionList}
                    headerDescription={questionGroupedComponent.component.description}
                >
                    {questionGroupedComponent.questions.map((question) => (
                        <QuestionInput
                            componentNumber={questionGroupedComponent.component.component_num}
                            key={question.id}
                            question={question}
                            index={questionResponseMapping[question.id]?.index}
                            value={questionResponseMapping[question.id]?.value}
                            onChange={setQuestionResponseValue}
                        />
                    ))}
                </ExpandableContainer>
            ))}
        </div>
    );
}
export default AreaInput;

