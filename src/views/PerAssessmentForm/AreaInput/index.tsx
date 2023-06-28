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

import type { GET } from '#types/serverResponse';
import { PartialAssessment } from '../common';
import ComponentInput from './ComponentInput';

import styles from './styles.module.css';

type Value = NonNullable<PartialAssessment['area_responses']>[number];
type PerFormQuestion = GET['api/v2/per-formquestion']['results'][number];
type PerFormComponent = PerFormQuestion['component'];
type PerFormArea = PerFormComponent['area'];

interface Props {
    className?: string;
    // error: ArrayError<Value> | undefined;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    value: Value;
    index: number | undefined;
    questions: PerFormQuestion[] | undefined;
    area: PerFormArea;
    ratingOptions: GET['api/v2/per-options']['componentratings'];
    epi_considerations: boolean | null | undefined;
    urban_considerations: boolean | null | undefined;
    climate_environmental_considerations: boolean | null | undefined;
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
        ratingOptions,
        epi_considerations,
        urban_considerations,
        climate_environmental_considerations,
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
                        ratingOptions={ratingOptions}
                        epi_considerations={epi_considerations}
                        urban_considerations={urban_considerations}
                        climate_environmental_considerations={climate_environmental_considerations}
                    />
                ) : null
            ))}
        </div>
    );
}
export default AreaInput;
