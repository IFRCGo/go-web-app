import { useMemo } from 'react';
import {
    Container,
    ExpandableContainer,
    InputSection,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    minSafe,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
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
type QuestionGroups = GoApiResponse<'/api/v2/per-formquestion-group/'>;

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
    questionGroups: QuestionGroups | undefined;
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
        questionGroups,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

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
    const isParentComponent = component.is_parent;

    const groupedQuestions = useMemo(() => (
        listToGroupList(
            questions,
            (question) => (
                isDefined(question.question_group)
                    ? question.question_group
                    : 'questions'),
        )
    ), [questions]);

    const currentQuestionGroupByComponent = useMemo(() => {
        const questionGroupByComponent = listToGroupList(
            questionGroups?.results,
            (group) => group?.component,
        );

        const currentQuestions = questionGroupByComponent?.[component.id];

        if (isNotDefined(currentQuestions)) {
            return undefined;
        }

        const sortedCurrentQuestions = [...currentQuestions ?? []].sort((a, b) => {
            const aGroupedQuestions = groupedQuestions[a.id];
            const aMinQuestion = minSafe(aGroupedQuestions.map(
                (item) => item.question_num,
            ));
            const bGroupedQuestions = groupedQuestions[b.id];
            const bMinQuestion = minSafe(bGroupedQuestions.map(
                (item) => item.question_num,
            ));

            return compareNumber(aMinQuestion, bMinQuestion);
        });

        return sortedCurrentQuestions;
    }, [questionGroups, component, groupedQuestions]);

    if (isNotDefined(componentNumber)) {
        return null;
    }

    if (isParentComponent) {
        return (
            <Container
                className={_cs(
                    styles.nonExpandableComponentInput,
                    styles.componentInput,
                    className,
                )}
                key={component.id}
                heading={isTruthyString(component.component_letter)
                    ? `${component.component_num}(${component.component_letter}). ${component.title}`
                    : `${component.component_num}. ${component.title}`}
                childrenContainerClassName={styles.questionList}
                headerDescription={component.description}
                headingClassName={styles.heading}
                withInternalPadding
                withoutWrapInHeading
                spacing="comfortable"
                headingDescriptionContainerClassName={styles.statusSelectionContainer}
            />
        );
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
            {
                isDefined(currentQuestionGroupByComponent) && currentQuestionGroupByComponent?.map(
                    (group) => {
                        const currentQuestions = groupedQuestions[group.id];
                        if (isNotDefined(currentQuestions)) {
                            return null;
                        }
                        return (
                            <Container
                                key={group.id}
                                heading={group.title}
                                headerDescription={group.description}
                                withHeaderBorder
                                childrenContainerClassName={styles.questionList}
                            >
                                {currentQuestions?.map((question) => {
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
                            </Container>
                        );
                    },
                )
            }
            {
                isNotDefined(currentQuestionGroupByComponent) && questions?.map((question) => {
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
                })
            }
            {
                !isParentComponent && (
                    <TextArea
                        label={strings.notes}
                        name="notes"
                        value={value?.notes}
                        error={error?.notes}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                )
            }
            {
                epi_considerations && (
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
                )
            }
            {
                urban_considerations && (
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
                )
            }
            {
                climate_environmental_considerations && (
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
                )
            }
        </ExpandableContainer>
    );
}

export default ComponentInput;
