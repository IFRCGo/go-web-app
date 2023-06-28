import {
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { listToMap, _cs, isNotDefined } from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import SelectInput from '#components/SelectInput';
import type { GET } from '#types/serverResponse';

import { PartialAssessment } from '../../common';
import QuestionInput from './QuestionInput';
import ConsiderationInput from './ConsiderationInput';
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
    ratingOptions: {
        id: number
        value: number;
        title: string;
    }[];
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

    const {
        setValue: setConsiderationValue,
    } = useFormArray<'consideration_responses', NonNullable<Value['consideration_responses']>[number]>(
        'consideration_responses',
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

    const hasConsiderations = epi_considerations
        || urban_considerations
        || climate_environmental_considerations;

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
            {hasConsiderations && (
                <ConsiderationInput
                    index={0}
                    value={value?.consideration_responses?.[0]}
                    onChange={setConsiderationValue}
                    epi_considerations={epi_considerations}
                    urban_considerations={urban_considerations}
                    climate_environmental_considerations={climate_environmental_considerations}
                />
            )}
        </ExpandableContainer>
    );
}

export default ComponentInput;
