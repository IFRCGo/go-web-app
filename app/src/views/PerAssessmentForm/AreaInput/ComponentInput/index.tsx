import { useMemo } from 'react';
import {
    ExpandableContainer,
    InputSection,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    _cs,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';
import {
    Error,
    getErrorObject,
    SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialAssessment } from '../../schema';
import QuestionInput from './QuestionInput';

import i18n from './i18n.json';
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
    error: Error<Value> | undefined;
    disabled?: boolean;
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
        error: formError,
        component,
        questions,
        ratingOptions,
        epi_considerations,
        disabled = false,
        urban_considerations,
        climate_environmental_considerations,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    console.log('component', component, 'question', questions);

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const questionInputError = useMemo(
        () => getErrorObject(error?.question_responses),
        [error],
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
            spacing="comfortable"
            headingDescriptionContainerClassName={styles.statusSelectionContainer}
            headingDescription={(
                <SelectInput
                    readOnly={readOnly}
                    className={styles.statusSelection}
                    name="rating"
                    value={value?.rating}
                    error={error?.rating}
                    onChange={setFieldValue}
                    placeholder={readOnly
                        ? strings.placeholderReviewedRating
                        : strings.placeholderSelectRating}
                    options={ratingOptions}
                    disabled={disabled}
                    keySelector={numericIdSelector}
                    labelSelector={ratingLabelSelector}
                />
            )}
            showExpandButtonAtBottom
            initiallyExpanded
        >
            <NonFieldError error={error} />
            <NonFieldError error={questionInputError} />
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
                        error={questionInputError?.[question.id]}
                        onChange={setQuestionValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                );
            })}
            <TextArea
                label={strings.notes}
                name="notes"
                value={value?.notes}
                error={error?.notes}
                onChange={setFieldValue}
                disabled={disabled}
                readOnly={readOnly}
            />
            {epi_considerations && (
                <InputSection
                    title={strings.epiConsiderationTitle}
                    description={(
                        <ul className={styles.description}>
                            <li>
                                {strings.epiConsiderationDescriptionOne}
                            </li>
                            <li>
                                {strings.epiConsiderationDescriptionTwo}
                            </li>
                        </ul>
                    )}
                >
                    <TextArea
                        name="epi_considerations"
                        value={value?.epi_considerations}
                        error={error?.epi_considerations}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InputSection>
            )}
            {urban_considerations && (
                <InputSection
                    title={strings.urbanConsiderationTitle}
                    description={strings.urbanConsiderationDescription}
                >
                    <TextArea
                        name="urban_considerations"
                        value={value?.urban_considerations}
                        error={error?.urban_considerations}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InputSection>
            )}
            {climate_environmental_considerations && (
                <InputSection
                    title={strings.environmentConsiderationTitle}
                    description={(
                        <ul className={styles.description}>
                            <li>
                                {strings.environmentConsiderationDescriptionOne}
                            </li>
                            <li>
                                {strings.environmentConsiderationDescriptionTwo}
                            </li>
                        </ul>
                    )}
                >
                    <TextArea
                        name="climate_environmental_considerations"
                        value={value?.climate_environmental_considerations}
                        error={error?.climate_environmental_considerations}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InputSection>
            )}
        </ExpandableContainer>
    );
}

export default ComponentInput;
