import {
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    _cs,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import { numericIdSelector } from '#utils/selectors';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialAssessment } from '../../schema';
import QuestionInput from './QuestionInput';
import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type RatingOption = NonNullable<PerOptionsResponse['componentratings']>[number];

type AreaResponse = NonNullable<PartialAssessment['area_responses']>[number]
type Value = NonNullable<AreaResponse['component_responses']>[number];

type PerFormQuestionResponse = GoApiResponse<'/api/v2/per-formquestion/'>;
type PerFormQuestion = NonNullable<PerFormQuestionResponse['results']>[number];

function ratingLabelSelector(option: RatingOption) {
    return `${option.value} - ${option.title}`;
}

interface Props {
    className?: string;
    component: PerFormQuestion['component'];
    questions: PerFormQuestion[];
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
    epi_considerations: boolean | null | undefined;
    urban_considerations: boolean | null | undefined;
    climate_environmental_considerations: boolean | null | undefined;
    readOnly?: boolean;
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
        readOnly,
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

    const componentNumber = component.component_num;

    if (isNotDefined(componentNumber)) {
        return null;
    }

    return (
        <ExpandableContainer
            className={_cs(styles.componentInput, className)}
            key={component.id}
            heading={isTruthyString(component.component_letter)
                ? `${component.component_num}(${component.component_letter}). ${component.title}`
                : `${component.component_num}. ${component.title}`}
            childrenContainerClassName={styles.questionList}
            withHeaderBorder
            headerDescription={component.description}
            headingClassName={styles.heading}
            spacing="relaxed"
            headingDescriptionContainerClassName={styles.statusSelectionContainer}
            withoutWrapInHeading
            headingDescription={(
                <SelectInput
                    readOnly={readOnly}
                    className={styles.statusSelection}
                    name="rating"
                    value={value?.rating}
                    onChange={setFieldValue}
                    // FIXME: use translation
                    placeholder={readOnly ? 'Rating: 0 - Not reviewed' : 'Select rating'}
                    options={ratingOptions}
                    keySelector={numericIdSelector}
                    labelSelector={ratingLabelSelector}
                />
            )}
            initiallyExpanded
        >
            {questions?.map((question) => {
                if (isNotDefined(question.question_num)) {
                    return null;
                }

                return (
                    <QuestionInput
                        componentNumber={componentNumber}
                        key={question.id}
                        question={question}
                        index={questionResponseMapping[question.id]?.index}
                        value={questionResponseMapping[question.id]?.value}
                        onChange={setQuestionValue}
                        readOnly={readOnly}
                    />
                );
            })}
            <TextArea
                // FIXME: use Translations
                label="Notes"
                name="notes"
                value={value?.notes}
                onChange={setFieldValue}
                readOnly={readOnly}
            />
            {epi_considerations && (
                <TextArea
                    // TODO: add description
                    // FIXME: use Translations
                    label="EPI Considerations"
                    name="epi_considerations"
                    value={value?.epi_considerations}
                    onChange={setFieldValue}
                    readOnly={readOnly}
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
                    readOnly={readOnly}
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
                    readOnly={readOnly}
                />
            )}
        </ExpandableContainer>
    );
}

export default ComponentInput;
