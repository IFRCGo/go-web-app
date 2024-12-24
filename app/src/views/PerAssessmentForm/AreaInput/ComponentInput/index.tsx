import {
    Fragment,
    useMemo,
} from 'react';
import {
    Container,
    ExpandableContainer,
    HtmlOutput,
    InputSection,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    _cs,
    compareNumber,
    isFalsyString,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
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

import { type PartialAssessment } from '../../schema';
import QuestionInput from './QuestionInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type RatingOption = NonNullable<PerOptionsResponse['componentratings']>[number];

type AreaResponse = NonNullable<PartialAssessment['area_responses']>[number]
type Value = NonNullable<AreaResponse['component_responses']>[number];

type PerFormComponentResponse = GoApiResponse<'/api/v2/per-formcomponent/'>;
type PerFormComponent = ListResponseItem<PerFormComponentResponse>;
type PerFormQuestionResponse = GoApiResponse<'/api/v2/per-formquestion/'>;
type PerFormQuestion = ListResponseItem<PerFormQuestionResponse>;
type QuestionGroupResponse = GoApiResponse<'/api/v2/per-formquestion-group/'>;
type QuestionGroup = ListResponseItem<QuestionGroupResponse>;

const NO_GROUP = -1;

function getComponentTitle(component: PerFormComponent) {
    if (isFalsyString(component.component_letter)) {
        return `${component.component_num}. ${component.title}`;
    }

    return `${component.component_num}(${component.component_letter}). ${component.title}`;
}

function ratingLabelSelector(option: RatingOption) {
    return `${option.value} - ${option.title}`;
}

interface Props {
    className?: string;
    component: PerFormComponent;
    questions: PerFormQuestion[] | undefined;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    error: Error<Value> | undefined;
    disabled?: boolean;
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
    questionGroups: QuestionGroup[] | undefined;
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

    // FIXME: We might need to use useFormArrayWithEmptyCheck
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

    const questionGroupById = useMemo(
        () => listToMap(
            questionGroups,
            ({ id }) => id,
        ),
        [questionGroups],
    );

    const groupedQuestions = useMemo(
        () => listToGroupList(
            // FIXME: this sort will mutate the data
            questions?.sort((q1, q2) => compareNumber(q1.question_num, q2.question_num)),
            (question) => question.question_group ?? NO_GROUP,
        ),
        [questions],
    );

    const groupedQuestionList = useMemo(
        () => mapToList(
            groupedQuestions,
            (questionsInGroup, groupId) => ({
                groupId: Number(groupId),
                questionsInGroup,
            }),
        )?.sort((g1, g2) => compareNumber(
            g1.questionsInGroup[0].question_num,
            g2.questionsInGroup[0].question_num,
        )),
        [groupedQuestions],
    );

    if (isNotDefined(componentNumber)) {
        return null;
    }

    if (component.is_parent) {
        return (
            <Container
                className={_cs(
                    styles.nonExpandableComponentInput,
                    styles.componentInput,
                    className,
                )}
                key={component.id}
                heading={getComponentTitle(component)}
                headingClassName={styles.heading}
                withInternalPadding
                withoutWrapInHeading
                spacing="comfortable"
                headingDescriptionContainerClassName={styles.statusSelectionContainer}
            >
                {component.description}
            </Container>
        );
    }

    return (
        <ExpandableContainer
            className={_cs(styles.componentInput, className)}
            key={component.id}
            heading={getComponentTitle(component)}
            withHeaderBorder
            headerDescription={component.description}
            headingClassName={styles.heading}
            headingContainerClassName={styles.headingContainer}
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
            contentViewType="vertical"
            spacing="comfortable"
        >
            <NonFieldError error={error} />
            <NonFieldError error={questionInputError} />
            {groupedQuestionList?.map(
                ({ groupId, questionsInGroup }) => {
                    const questionItemList = questionsInGroup.map(
                        (question) => (
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
                        ),
                    );

                    const groupDetails = questionGroupById?.[groupId];

                    if (groupId === NO_GROUP || isNotDefined(groupDetails)) {
                        return (
                            <Fragment key={groupId}>
                                {questionItemList}
                            </Fragment>
                        );
                    }

                    return (
                        <Container
                            key={groupId}
                            heading={groupDetails.title}
                            contentViewType="vertical"
                            spacing="comfortable"
                        >
                            {questionItemList}
                        </Container>
                    );
                },
            )}
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
                    withoutPadding
                    title={strings.epiConsiderationTitle}
                    description={(
                        <HtmlOutput value={component?.epi_considerations_guidance} />
                    )}
                >
                    <TextArea
                        name="epi_considerations"
                        value={value?.epi_considerations}
                        error={error?.epi_considerations}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                        rows={8}
                    />
                </InputSection>
            )}
            {urban_considerations && (
                <InputSection
                    withoutPadding
                    title={strings.urbanConsiderationTitle}
                    description={(
                        <HtmlOutput value={component?.urban_considerations_guidance} />
                    )}
                >
                    <TextArea
                        name="urban_considerations"
                        value={value?.urban_considerations}
                        error={error?.urban_considerations}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                        rows={8}
                    />
                </InputSection>
            )}
            {climate_environmental_considerations && (
                <InputSection
                    withoutPadding
                    title={strings.environmentConsiderationTitle}
                    description={(
                        <HtmlOutput
                            value={component?.climate_environmental_considerations_guidance}
                        />
                    )}
                >
                    <TextArea
                        name="climate_environmental_considerations"
                        value={value?.climate_environmental_considerations}
                        error={error?.climate_environmental_considerations}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                        rows={8}
                    />
                </InputSection>
            )}
        </ExpandableContainer>
    );
}

export default ComponentInput;
