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

import { PerFormQuestionItem, Area } from '../../common';
import { PartialAssessment } from '../../usePerProcessOptions';
import ComponentInput from './ComponentInput';

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
    } = useFormArray('component_responses', setFieldValue);

    const questionResponseMapping = listToMap(
        value?.component_responses ?? [],
        (questionResponse) => questionResponse.component_id,
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
            {componentGroupedQuestionList.map((question) => (
                <ComponentInput
                    componentNumber={componentGroupedQuestionList.component_num}
                    key={question.component.id}
                    question={question}
                    index={questionResponseMapping[question.id]?.index}
                    value={questionResponseMapping[question.id]?.value}
                    onChange={setQuestionResponseValue}
                />
            ))}
        </div>
    );
}
export default AreaInput;
