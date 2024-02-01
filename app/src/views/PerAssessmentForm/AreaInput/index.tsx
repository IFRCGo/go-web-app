import { useMemo } from 'react';
import {
    _cs,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import {
    Error,
    getErrorObject,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialAssessment } from '../schema';
import ComponentInput from './ComponentInput';

import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type PerFormQuestionResponse = GoApiResponse<'/api/v2/per-formquestion/'>;

type Value = NonNullable<PartialAssessment['area_responses']>[number];
type PerFormQuestion = NonNullable<PerFormQuestionResponse['results']>[number];

type PerFormArea = PerFormQuestion['component']['area'];

interface Props {
    className?: string;
    error: Error<Value> | undefined;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    value: Value;
    index: number | undefined;
    questions: PerFormQuestion[] | undefined;
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
        error: formError,
        ratingOptions,
        epi_considerations,
        urban_considerations,
        climate_environmental_considerations,
        readOnly,
        disabled = false,
    } = props;

    console.log('area-----', questions);

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

    const componentResponseMapping = useMemo(() => (listToMap(
        value?.component_responses ?? [],
        (componentResponse) => componentResponse.component,
        (componentResponse, _, questionResponseIndex) => ({
            index: questionResponseIndex,
            value: componentResponse,
        }),
    )), [value?.component_responses]);

    const componentGroupedQuestions = useMemo(() => (listToGroupList(
        questions ?? [],
        (question) => question.component.id,
    )), [questions]);

    const componentGroupedQuestionList = useMemo(() => (mapToList(
        componentGroupedQuestions,
        (list) => ({
            component: list[0].component,
            questions: list,
        }),
    )), [componentGroupedQuestions]);

    console.log('-------', componentGroupedQuestionList);

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const componentInputError = useMemo(
        () => getErrorObject(error?.component_responses),
        [error],
    );

    return (
        <div
            className={_cs(styles.areaInput, className)}
        >
            <NonFieldError error={error} />
            <NonFieldError error={componentInputError} />
            {componentGroupedQuestionList.map((componentResponse) => (
                <ComponentInput
                    key={componentResponse.component.id}
                    component={componentResponse.component}
                    questions={componentResponse.questions}
                    index={componentResponseMapping[componentResponse.component.id]?.index}
                    value={componentResponseMapping[componentResponse.component.id]?.value}
                    error={componentInputError?.[componentResponse.component.id]}
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
