import {
    SetValueArg,
    useFormObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    listToGroupList,
    mapToList,
    _cs,
} from '@togglecorp/fujs';

import {
    PerFormQuestionItem,
    PerFormArea,
    PartialAssessment,
} from '../common';
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
    area: PerFormArea;
    handleTotalAnswer: React.Dispatch<React.SetStateAction<number>>;
    handleTotalYes: React.Dispatch<React.SetStateAction<number>>;
    handleTotalNo: React.Dispatch<React.SetStateAction<number>>;
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
        handleTotalAnswer,
        handleTotalYes,
        handleTotalNo,
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

    const componentResponseMapping = listToMap(
        value?.component_responses ?? [],
        (componentResponse) => componentResponse.component,
        (componentResponse, _, questionResponseIndex) => ({
            index: questionResponseIndex,
            value: componentResponse,
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
        <div
            className={_cs(styles.areaInput, className)}
        >
            {componentGroupedQuestionList.map((componentResponse) => (
                componentResponse.component ? (
                    <ComponentInput
                        key={componentResponse.component.id}
                        component={componentResponse.component}
                        questions={componentResponse.questions}
                        index={componentResponseMapping[componentResponse.component.id]?.index}
                        value={componentResponseMapping[componentResponse.component.id]?.value}
                        onChange={setQuestionResponseValue}
                        handleTotalAnswer={handleTotalAnswer}
                        handleTotalYes={handleTotalYes}
                        handleTotalNo={handleTotalNo}
                    />
                ) : null
            ))}
        </div>
    );
}
export default AreaInput;
