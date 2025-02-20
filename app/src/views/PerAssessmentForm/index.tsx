import {
    type ElementRef,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import {
    Button,
    ConfirmButton,
    Container,
    Message,
    Portal,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    type PartialForm,
    removeNull,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import PerAssessmentSummary from '#components/domain/PerAssessmentSummary';
import NonFieldError from '#components/NonFieldError';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { PER_PHASE_ASSESSMENT } from '#utils/domain/per';
import { type PerProcessOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import AreaInput from './AreaInput';
import {
    assessmentSchema,
    type PartialAssessment,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFormValue: PartialAssessment = {
    is_draft: true,
    area_responses: [],
};

type AssessmentResponse = GoApiResponse<'/api/v2/per-assessment/{id}/'>;
type PerFormQuestionResponse = GoApiResponse<'/api/v2/per-formquestion/'>;
type PerFormArea = NonNullable<PerFormQuestionResponse['results']>[number]['component']['area']

const defaultFormAreas: PerFormArea[] = [];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const formContentRef = useRef<ElementRef<'div'>>(null);
    const strings = useTranslation(i18n);
    const alert = useAlert();
    const { navigate } = useRouting();
    const {
        fetchingStatus,
        statusResponse,
        refetchStatusResponse,
        actionDivRef,
        readOnly: readOnlyFromContext,
    } = useOutletContext<PerProcessOutletContext>();

    const {
        value,
        validate,
        setFieldValue,
        setError,
        setValue,
        error: formError,
    } = useForm(
        assessmentSchema,
        { value: defaultFormValue },
    );

    const [currentArea, setCurrentArea] = useState<number | undefined>();
    const id = statusResponse?.id;
    const assessmentId = statusResponse?.assessment;
    const [areas, setAreas] = useState<PerFormArea[]>(defaultFormAreas);

    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest({
        url: '/api/v2/per-options/',
    });

    const {
        pending: questionsPending,
        response: questionsResponse,
    } = useRequest({
        url: '/api/v2/per-formquestion/',
        query: {
            limit: 9999,
        },
        onSuccess: (response) => {
            const responseAreas = response?.results?.map(
                (question) => question.component.area,
            );
            const uniqueAreas = unique(responseAreas ?? [], (area) => area.id);
            const sortedUniqueAreas = uniqueAreas.sort(
                (area1, area2) => compareNumber(area1.area_num, area2.area_num),
            );

            setAreas(sortedUniqueAreas);
            setCurrentArea(sortedUniqueAreas[0]?.area_num);
        },
    });

    // NOTE: we need to pull the components separately
    // because there are components without questions (i.e. #14)
    const {
        pending: componentPending,
        response: componentResponse,
    } = useRequest({
        url: '/api/v2/per-formcomponent/',
        query: { limit: 9999 },
    });

    const {
        pending: questionGroupPending,
        response: questionGroupResponse,
    } = useRequest({
        url: '/api/v2/per-formquestion-group/',
        query: {
            limit: 9999,
        },
    });

    const questionListByAreaId = useMemo(
        () => listToGroupList(
            questionsResponse?.results,
            ({ component }) => component.area.id,
        ),
        [questionsResponse],
    );

    const componentListByAreaId = useMemo(
        () => listToGroupList(
            componentResponse?.results,
            ({ area }) => area,
        ),
        [componentResponse],
    );

    const {
        response: perOverviewResponse,
    } = useRequest({
        skip: isNotDefined(id),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: {
            id: Number(id),
        },
    });

    const {
        pending: fetchingPerAssessment,
        error: perAssessmentResponseError,
    } = useRequest({
        skip: isNotDefined(assessmentId),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: Number(assessmentId),
        },
        onSuccess: (response) => {
            if (response) {
                setValue(removeNull(response));
            }
        },
    });

    const {
        pending: savePerPending,
        trigger: savePerAssessment,
    } = useLazyRequest({
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: isDefined(assessmentId)
            ? { id: assessmentId }
            : undefined,
        method: 'PATCH',
        body: (ctx: AssessmentResponse) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.saveRequestSuccessMessage,
                { variant: 'success' },
            );

            refetchStatusResponse();

            if (response.is_draft === false) {
                navigate(
                    'perPrioritizationForm',
                    { params: { perId } },
                );

                // Move the page position to top when moving on to next step
                window.scrollTo(0, 0);
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['area_responses', NUM, 'component_responses', NUM, 'question_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index, component_index, question_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.area_responses?.[response_index]?.component_responses?.[component_index]?.question_responses?.[question_index]?.question;
                    }
                    match = matchArray(locations, ['area_responses', NUM, 'component_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index, component_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.area_responses?.[response_index]?.component_responses?.[component_index]?.component;
                    }
                    match = matchArray(locations, ['area_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index] = match;
                        return value?.area_responses?.[response_index]?.area;
                    }
                    return undefined;
                },

            ));
            alert.show(
                strings.saveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const handleSubmit = useCallback(
        (formValues: PartialForm<AssessmentResponse>) => {
            if (isNotDefined(assessmentId) || isNotDefined(perId)) {
                // TODO: show proper error message to user
                // eslint-disable-next-line no-console
                console.error('assessment id not defined');
                return;
            }
            formContentRef.current?.scrollIntoView();

            savePerAssessment({
                ...formValues as AssessmentResponse,
                is_draft: true,
                overview: Number(perId),
            });
        },
        [savePerAssessment, assessmentId, perId],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialForm<AssessmentResponse>) => {
            if (isNotDefined(assessmentId) || isNotDefined(perId)) {
                // TODO: show proper error message to user
                // eslint-disable-next-line no-console
                console.error('assessment id not defined');
                return;
            }
            formContentRef.current?.scrollIntoView();

            savePerAssessment({
                ...(formValues as AssessmentResponse),
                is_draft: false,
            });
        },
        [savePerAssessment, assessmentId, perId],
    );

    const handleFormError = useCallback(() => {
        formContentRef.current?.scrollIntoView();
    }, []);

    // FIXME: We might need to use useFormArrayWithEmptyCheck
    const {
        setValue: setAreaResponsesValue,
    } = useFormArray('area_responses', setFieldValue);

    const handlePrevNextButtonClick = useCallback(
        (newArea: number) => {
            formContentRef.current?.scrollIntoView();
            setCurrentArea(newArea);
        },
        [],
    );

    const areaResponseMapping = listToMap(
        value?.area_responses ?? [],
        (areaResponse) => areaResponse.area,
        (areaResponse, _, index) => ({
            index,
            value: areaResponse,
        }),
    );

    const areaIdToTitleMap = listToMap(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
        // FIXME: Why can area be undefined
        (question) => question.component.area.title ?? undefined,
    );

    const minArea = areas[0]?.area_num ?? 1;
    const maxArea = areas[areas.length - 1]?.area_num ?? areas.length;

    const handleFormSubmit = createSubmitHandler(
        validate,
        setError,
        handleSubmit,
        handleFormError,
    );
    const handleFormFinalSubmit = createSubmitHandler(
        validate,
        setError,
        handleFinalSubmit,
        handleFormError,
    );

    const currentPerStep = statusResponse?.phase;

    const dataPending = questionsPending
        || componentPending
        || questionGroupPending
        || perOptionsPending
        || fetchingPerAssessment
        || fetchingStatus;

    const readOnlyMode = readOnlyFromContext
        || isNotDefined(currentPerStep)
        || currentPerStep !== PER_PHASE_ASSESSMENT;

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const areaInputError = useMemo(
        () => getErrorObject(error?.area_responses),
        [error],
    );

    if (dataPending) {
        return (
            <Message
                pending
            />
        );
    }

    if (isNotDefined(assessmentId)) {
        return (
            <FormFailedToLoadMessage
                description={strings.resourceNotFound}
            />
        );
    }

    if (isDefined(perAssessmentResponseError)) {
        return (
            <FormFailedToLoadMessage
                description={perAssessmentResponseError.value.messageForNotification}
            />
        );
    }

    return (
        <div className={styles.perAssessmentForm}>
            <PerAssessmentSummary
                perOptionsResponse={perOptionsResponse}
                areaResponses={value?.area_responses}
                totalQuestionCount={questionsResponse?.count}
                areaIdToTitleMap={areaIdToTitleMap}
            />
            {isDefined(currentArea) && (
                <Container
                    heading={strings.assessmentHeading}
                    headingLevel={2}
                    withHeaderBorder
                    footerContentClassName={styles.footerContent}
                    footerContent={(
                        <>
                            <Button
                                name={currentArea - 1}
                                variant="secondary"
                                onClick={handlePrevNextButtonClick}
                                disabled={isNotDefined(currentArea) || currentArea <= minArea}
                            >
                                {strings.prevButtonLabel}
                            </Button>
                            <Button
                                name={currentArea + 1}
                                variant="secondary"
                                onClick={handlePrevNextButtonClick}
                                disabled={isNotDefined(currentArea) || currentArea >= maxArea}
                            >
                                {strings.nextButtonLabel}
                            </Button>
                        </>
                    )}
                    footerActions={(
                        <ConfirmButton
                            name={undefined}
                            onConfirm={handleFormFinalSubmit}
                            confirmHeading={strings.submitAssessmentConfirmHeading}
                            confirmMessage={strings.submitAssessmentConfirmMessage}
                            disabled={savePerPending || readOnlyMode}
                        >
                            {strings.submitAssessmentButtonLabel}
                        </ConfirmButton>
                    )}
                >
                    {actionDivRef.current && (
                        <Portal
                            container={actionDivRef.current}
                        >
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleFormSubmit}
                                disabled={savePerPending || readOnlyMode}
                            >
                                {strings.saveAssessmentButtonLabel}
                            </Button>
                        </Portal>
                    )}
                    <NonFieldError
                        error={error}
                        withFallbackError
                    />
                    <div
                        ref={formContentRef}
                        className={styles.content}
                    >
                        <Tabs
                            disabled={undefined}
                            onChange={setCurrentArea}
                            value={currentArea}
                            variant="primary"
                        >
                            <TabList className={styles.tabList}>
                                {areas.map((area) => (
                                    <Tab
                                        key={area.id}
                                        name={area.id}
                                        step={area?.area_num}
                                    >
                                        {`${area.area_num}. ${area.title}`}
                                    </Tab>
                                ))}
                            </TabList>
                            <NonFieldError error={areaInputError} />
                            {areas.map((area) => (
                                <TabPanel
                                    name={area.id}
                                    key={area.id}
                                >
                                    <AreaInput
                                        key={area.id}
                                        area={area}
                                        readOnly={readOnlyMode}
                                        questions={questionListByAreaId?.[area.id]}
                                        components={componentListByAreaId?.[area.id]}
                                        questionGroups={questionGroupResponse?.results}
                                        index={areaResponseMapping[area.id]?.index}
                                        value={areaResponseMapping[area.id]?.value}
                                        disabled={savePerPending}
                                        error={areaInputError?.[area.id]}
                                        onChange={setAreaResponsesValue}
                                        ratingOptions={perOptionsResponse?.componentratings}
                                        epi_considerations={perOverviewResponse
                                            ?.assess_preparedness_of_country}
                                        urban_considerations={perOverviewResponse
                                            ?.assess_urban_aspect_of_country}
                                        climate_environmental_considerations={perOverviewResponse
                                            ?.assess_climate_environment_of_country}
                                    />
                                </TabPanel>
                            ))}
                        </Tabs>
                    </div>
                </Container>
            )}
        </div>
    );
}
