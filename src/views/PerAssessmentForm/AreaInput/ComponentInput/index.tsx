import {
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { listToMap, _cs, isNotDefined } from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import type { GET } from '#types/serverResponse';

import { PartialAssessment } from '../../common';
import QuestionInput from './QuestionInput';
import styles from './styles.module.css';

type PerFormQuestion = GET['api/v2/per-formquestion']['results'][number];
type PerFormComponent = PerFormQuestion['component'];
type Value = NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number];

interface Props {
    className?: string;
    component: PerFormComponent;
    questions: PerFormQuestion[];
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    ratingOptions: GET['api/v2/per-options']['componentratings'] | undefined;
    epi_considerations: boolean | null | undefined;
    urban_considerations: boolean | null | undefined;
    climate_environmental_considerations: boolean | null | undefined;
}

function ComponentInput(props: Props) {
    const {
        className,
        onChange,
        index,
        value,
        component,
        questions,
        ratingOptions,
        epi_considerations,
        urban_considerations,
        climate_environmental_considerations,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const {
        setValue: setQuestionValue,
    } = useFormArray<'question_responses', NonNullable<Value['question_responses']>[number]>(
        'question_responses',
        setFieldValue,
    );

    const questionResponseMapping = listToMap(
        value?.question_responses ?? [],
        (questionResponse) => questionResponse.question,
        (questionResponse, _, componentResponseIndex) => ({
            index: componentResponseIndex,
            value: questionResponse,
        }),
    );

    return (
        <ExpandableContainer
            className={_cs(styles.componentInput, className)}
            key={component.id}
            heading={`${component.component_num}. ${component.title}`}
            childrenContainerClassName={styles.questionList}
            actions={(
                <SelectInput
                    className={styles.statusSelection}
                    name="rating"
                    value={value?.rating}
                    onChange={setFieldValue}
                    placeholder="Select rating"
                    options={ratingOptions}
                    keySelector={(performanceOption) => performanceOption.id}
                    labelSelector={(performanceOption) => performanceOption.title}
                />
            )}
        >
            {questions?.map((question) => {
                if (question.is_epi
                    || question.is_benchmark
                    || isNotDefined(question.question_num)) {
                    return null;
                }

                return (
                    <QuestionInput
                        componentNumber={component.component_num}
                        key={question.id}
                        question={question}
                        index={questionResponseMapping[question.id]?.index}
                        value={questionResponseMapping[question.id]?.value}
                        onChange={setQuestionValue}
                    />
                );
            })}
            {epi_considerations && (
                <TextArea
                    // TODO: add description
                    // FIXME: use Translations
                    label="EPI Considerations"
                    name="epi_considerations"
                    value={value?.epi_considerations}
                    onChange={setFieldValue}
                />
            )}
            {urban_considerations && (
                <TextArea
                    // TODO: add description
                    // FIXME: use Translations
                    label="Urban Considerations"
                    name="urban_considerations"
                    value={value?.urban_considerations}
                    onChange={setFieldValue}
                />
            )}
            {climate_environmental_considerations && (
                <TextArea
                    // TODO: add description
                    // FIXME: use Translations
                    label="Climate and Environmental Considerations"
                    name="climate_environmental_considerations"
                    value={value?.climate_environmental_considerations}
                    onChange={setFieldValue}
                />
            )}
        </ExpandableContainer>
    );
}

export default ComponentInput;
