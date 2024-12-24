import { useMemo } from 'react';
import {
    _cs,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    type GoApiResponse,
    type ListResponseItem,
} from '#utils/restRequest';

import { type PartialAssessment } from '../schema';
import ComponentInput from './ComponentInput';

import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type Value = NonNullable<PartialAssessment['area_responses']>[number];

type PerFormQuestionResponse = GoApiResponse<'/api/v2/per-formquestion/'>;
type PerFormQuestion = ListResponseItem<PerFormQuestionResponse>;
type QuestionGroupResponse = GoApiResponse<'/api/v2/per-formquestion-group/'>;
type QuestionGroup = ListResponseItem<QuestionGroupResponse>;

type PerFormComponentResponse = GoApiResponse<'/api/v2/per-formcomponent/'>;
type PerFormComponent = ListResponseItem<PerFormComponentResponse>;

type PerFormArea = PerFormQuestion['component']['area'];

interface Props {
    className?: string;
    error: Error<Value> | undefined;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    value: Value;
    index: number | undefined;
    questions: PerFormQuestion[] | undefined;
    components: PerFormComponent[] | undefined;
    questionGroups: QuestionGroup[] | undefined;
    area: PerFormArea;
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
    epi_considerations: boolean | null | undefined;
    urban_considerations: boolean | null | undefined;
    climate_environmental_considerations: boolean | null | undefined;
    readOnly?: boolean;
    disabled?: boolean;
}

function AreaInput(props: Props) {
    const {
        className,
        onChange,
        value,
        index,
        area,
        questions,
        components,
        error: formError,
        ratingOptions,
        epi_considerations,
        urban_considerations,
        questionGroups,
        climate_environmental_considerations,
        readOnly,
        disabled = false,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            area: area.id,
        }),
    );

    // FIXME: We might need to use useFormArrayWithEmptyCheck
    const {
        setValue: setQuestionResponseValue,
    } = useFormArray('component_responses', setFieldValue);

    const componentResponseMapping = useMemo(
        () => (listToMap(
            value?.component_responses ?? [],
            (componentResponse) => componentResponse.component,
            (componentResponse, _, questionResponseIndex) => ({
                index: questionResponseIndex,
                value: componentResponse,
            }),
        )),
        [value?.component_responses],
    );

    const questionListByComponentId = useMemo(
        () => listToGroupList(
            questions,
            ({ component }) => component.id,
        ),
        [questions],
    );

    const questionGroupsByComponentId = useMemo(
        () => listToGroupList(
            questionGroups,
            ({ component }) => component,
        ),
        [questionGroups],
    );

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const componentInputError = useMemo(
        () => getErrorObject(error?.component_responses),
        [error],
    );

    return (
        <div className={_cs(styles.areaInput, className)}>
            <NonFieldError error={error} />
            <NonFieldError error={componentInputError} />
            {components?.map((component) => (
                <ComponentInput
                    key={component.id}
                    component={component}
                    questions={questionListByComponentId?.[component.id]}
                    questionGroups={questionGroupsByComponentId?.[component.id]}
                    index={componentResponseMapping[component.id]?.index}
                    value={componentResponseMapping[component.id]?.value}
                    error={componentInputError?.[component.id]}
                    onChange={setQuestionResponseValue}
                    ratingOptions={ratingOptions}
                    epi_considerations={epi_considerations}
                    urban_considerations={urban_considerations}
                    climate_environmental_considerations={climate_environmental_considerations}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
export default AreaInput;
