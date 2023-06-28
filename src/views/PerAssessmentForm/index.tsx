import { useState, useCallback, useContext } from 'react';
import {
    generatePath,
    useNavigate,
    useParams,
    useOutletContext,
} from 'react-router-dom';
import {
    unique,
    listToMap,
    compareNumber,
    listToGroupList,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    PartialForm,
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import BlockLoading from '#components/BlockLoading';
import Portal from '#components/Portal';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';
import Button from '#components/Button';
import PerAssessmentSummary from '#components/PerAssessmentSummary';
import ConfirmButton from '#components/ConfirmButton';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { STEP_ASSESSMENT, PerProcessOutletContext } from '#utils/per';
import type { GET } from '#types/serverResponse';

import {
    AssessmentResponse,
    assessmentSchema,
    PartialAssessment,
} from './common';
import AreaInput from './AreaInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFormValue: PartialAssessment = {
    is_draft: true,
    area_responses: [],
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const strings = useTranslation(i18n);
    const alert = useAlert();
    const navigate = useNavigate();
    const {
        perPrioritizationForm: perPrioritizationFormRoute,
    } = useContext(RouteContext);

    const {
        statusResponse,
        refetchStatusResponse,
        actionDivRef,
    } = useOutletContext<PerProcessOutletContext>();

    const [currentArea, setCurrentArea] = useState<number | undefined>();
    const assessmentId = statusResponse?.assessment;

    type PerFormQuestionResponse = GET['api/v2/per-formquestion'];
    type PerFormArea = PerFormQuestionResponse['results'][number]['component']['area']
    const [areas, setAreas] = useState<PerFormArea[]>([]);

    const {
        pending: questionsPending,
        response: questionsResponse,
    } = useRequest<PerFormQuestionResponse>({
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
        },
        onSuccess: (response) => {
            const responseAreas = response?.results.map(
                (question) => question.component.area,
            );
            const uniqueAreas = unique(responseAreas ?? [], (area) => area.id);
            const sortedUniqueAreas = uniqueAreas.sort(
                (area1, area2) => compareNumber(area1.area_num, area2.area_num),
            );

            setAreas(sortedUniqueAreas);
            setCurrentArea(sortedUniqueAreas[0]?.id);
        },
    });

    const {
        value,
        validate,
        setFieldValue,
        setError,
        setValue,
    } = useForm(
        assessmentSchema,
        { value: defaultFormValue },
    );

    const {
        response: perOverviewResponse,
    } = useRequest<GET['api/v2/per-overview/:id']>({
        skip: isNotDefined(statusResponse?.id),
        // FIXME: change endpoint name
        url: `api/v2/per-overview/${statusResponse?.id}`,
    });

    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options',
    });
    const {
        pending: perAssesmentPending,
    } = useRequest<AssessmentResponse>({
        skip: isNotDefined(assessmentId),
        url: `api/v2/per-assessment/${assessmentId}`,
        onSuccess: (response) => {
            if (response) {
                setValue({
                    ...response,
                    area_responses: response.area_responses.map(
                        (areaResponse) => ({
                            ...areaResponse,
                            component_responses: areaResponse.component_responses.map(
                                (componentResponse) => ({
                                    ...componentResponse,
                                    consideration_responses: componentResponse
                                        .consideration_responses?.map(
                                            (considerationResponse) => ({
                                                ...considerationResponse,
                                                client_id: String(considerationResponse.id),
                                            }),
                                        ),
                                }),
                            ),
                        }),
                    ),
                });
            }
        },
    });

    const {
        pending: savePerPending,
        trigger: savePerAssessment,
    } = useLazyRequest<AssessmentResponse, AssessmentResponse>({
        url: `api/v2/per-assessment/${assessmentId}/`,
        method: 'PUT',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (!response) {
                // TODO: show proper error message
                return;
            }

            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );

            refetchStatusResponse();

            if (response.is_draft === false) {
                navigate(
                    generatePath(
                        perPrioritizationFormRoute.absolutePath,
                        { perId: String(perId) },
                    ),
                );
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                // TOOD: formErrors,
            },
            debugMessage,
        }) => {
            alert.show(
                <div>
                    {strings.perFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </div>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const {
        setValue: setAreaResponsesValue,
    } = useFormArray('area_responses', setFieldValue);

    const handleSubmit = useCallback(
        (formValues: PartialForm<AssessmentResponse>) => {
            if (isNotDefined(assessmentId) || isNotDefined(perId)) {
                // TODO: show proper error message to user
                // eslint-disable-next-line no-console
                console.error('assesment id not defined');
                return;
            }

            savePerAssessment({
                ...formValues as AssessmentResponse,
                is_draft: true,
            });
        },
        [savePerAssessment, assessmentId, perId],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialForm<AssessmentResponse>) => {
            if (isNotDefined(assessmentId) || isNotDefined(perId)) {
                // TODO: show proper error message to user
                // eslint-disable-next-line no-console
                console.error('assesment id not defined');
                return;
            }

            savePerAssessment({
                ...(formValues as AssessmentResponse),
                is_draft: false,
            });
        },
        [savePerAssessment, assessmentId, perId],
    );

    const handleNextTab = () => {
        setCurrentArea(Math.min((currentArea ?? 0) + 1, areas.length));
    };

    const handlePrevTab = () => {
        setCurrentArea(Math.max((currentArea ?? 0) - 1, 1));
    };

    const areaResponseMapping = listToMap(
        value?.area_responses ?? [],
        (areaResponse) => areaResponse.area,
        (areaResponse, _, index) => ({
            index,
            value: areaResponse,
        }),
    );

    const areaIdGroupedQuestion = listToGroupList(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
    );

    const areaIdToTitleMap = listToMap(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
        (question) => question.component.area.title,
    );

    const pending = questionsPending
        || perOptionsPending
        || perAssesmentPending;
    const minArea = 1;
    const maxArea = areas.length;
    const currentPerStep = statusResponse?.phase;
    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);

    return (
        <form className={styles.assessmentForm}>
            {pending && (
                <BlockLoading />
            )}
            {!pending && (
                <PerAssessmentSummary
                    perOptionsResponse={perOptionsResponse}
                    areaResponses={value?.area_responses}
                    totalQuestionCount={questionsResponse?.count}
                    areaIdToTitleMap={areaIdToTitleMap}
                />
            )}
            {!pending && currentArea && (
                <Tabs
                    disabled={undefined}
                    onChange={setCurrentArea}
                    value={currentArea}
                    variant="primary"
                >
                    <TabList
                        className={styles.tabList}
                    >
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
                    {areas.map((area) => (
                        <TabPanel
                            name={area.id}
                            key={area.id}
                        >
                            <AreaInput
                                key={area.id}
                                area={area}
                                questions={areaIdGroupedQuestion[area.id]}
                                index={areaResponseMapping[area.id]?.index}
                                value={areaResponseMapping[area.id]?.value}
                                onChange={setAreaResponsesValue}
                                ratingOptions={
                                    perOptionsResponse?.componentratings ?? []
                                }
                                epi_considerations={perOverviewResponse
                                    ?.assess_preparedness_of_country}
                                urban_considerations={perOverviewResponse
                                    ?.assess_urban_aspect_of_country}
                                climate_environmental_considerations={perOverviewResponse
                                    ?.assess_climate_environment_of_country}
                            />
                        </TabPanel>
                    ))}
                    <div className={styles.actions}>
                        <div className={styles.pageActions}>
                            {currentArea !== undefined && currentArea > minArea && (
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handlePrevTab}
                                >
                                    {strings.perFormBackButton}
                                </Button>
                            )}
                            {currentArea !== undefined && currentArea < maxArea && (
                                <Button
                                    name="next"
                                    variant="secondary"
                                    onClick={handleNextTab}
                                >
                                    {strings.perFormNextButton}
                                </Button>
                            )}
                        </div>
                        <ConfirmButton
                            name={undefined}
                            onConfirm={handleFormFinalSubmit}
                            confirmHeading={strings.perAssessmentConfirmHeading}
                            confirmMessage={strings.perAssessmentConfirmMessage}
                            disabled={isNotDefined(currentPerStep)
                                || savePerPending
                                || perAssesmentPending
                                || currentPerStep !== STEP_ASSESSMENT}
                        >
                            {strings.perFormSubmitButton}
                        </ConfirmButton>
                    </div>
                    {actionDivRef.current && (
                        <Portal
                            container={actionDivRef.current}
                        >
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleFormSubmit}
                            >
                                {strings.perFormSaveButton}
                            </Button>
                        </Portal>
                    )}
                </Tabs>
            )}
        </form>
    );
}

Component.displayName = 'PerAssessmentForm';
