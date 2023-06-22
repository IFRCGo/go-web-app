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
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';
import Modal from '#components/Modal';
import Button from '#components/Button';
import PerAssessmentSummary from '#components/PerAssessmentSummary';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    getCurrentPerProcessStep,
    STEP_ASSESSMENT,
} from '#utils/per';
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

    type StatusContextValue = {
        statusResponse: GET['api/v2/per-process-status/:id'],
        refetchStatusResponse: () => void,
    }

    const {
        statusResponse,
        refetchStatusResponse,
    } = useOutletContext<StatusContextValue>();

    const [currentArea, setCurrentArea] = useState<number | undefined>();
    const [showConfirmation, setShowConfirmation] = useState(false);
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
        setError: onErrorSet,
        setValue,
    } = useForm(
        assessmentSchema,
        { value: defaultFormValue },
    );

    /*
    const {
        response: perOverviewResponse,
    } = useRequest<GET['api/v2/new-per/:id']>({
        skip: isNotDefined(statusResponse?.id),
        // FIXME: change endpoint name
        url: `api/v2/new-per/${statusResponse?.id}`,
    });
    */

    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options',
        onSuccess: (response) => {
            setValue(response);
        },
    });
    const {
        pending: perAssesmentPending,
    } = useRequest<AssessmentResponse>({
        skip: isNotDefined(assessmentId),
        url: `api/v2/per-assessment/${assessmentId}`,
        onSuccess: (response) => {
            setValue(response);
        },
    });

    const {
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
                <p>
                    {strings.perFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
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
    const currentPerStep = getCurrentPerProcessStep(statusResponse);
    const handleFormSubmit = createSubmitHandler(validate, onErrorSet, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, onErrorSet, handleFinalSubmit);
    const handleModalClose = useCallback(() => {
        setShowConfirmation(false);
    }, []);

    const handleFinalSubmitClick = useCallback(() => {
        handleFormFinalSubmit();
        setShowConfirmation(false);
    }, [handleFormFinalSubmit]);

    return (
        <>
            <form
                onSubmit={handleFormSubmit}
                className={styles.assessmentForm}
            >
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
                                />
                            </TabPanel>
                        ))}
                        <div className={styles.actions}>
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
                            <Button
                                type="submit"
                                name="submit"
                                variant="secondary"
                                disabled={isNotDefined(currentPerStep)
                                    || currentPerStep > STEP_ASSESSMENT}
                            >
                                {strings.perFormSaveButton}
                            </Button>
                            {currentArea === maxArea && (
                                <Button
                                    name
                                    variant="primary"
                                    onClick={setShowConfirmation}
                                >
                                    {strings.perFormSubmitAssessmentButton}
                                </Button>
                            )}
                        </div>
                    </Tabs>
                )}
            </form>
            {showConfirmation && (
                <Modal
                    onClose={handleModalClose}
                    heading="Confirm Submission"
                    size="sm"
                    footerActions={(
                        <>
                            <Button
                                name={false}
                                variant="secondary"
                                onClick={setShowConfirmation}
                            >
                                {strings.perFormCancelButton}
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleFinalSubmitClick}
                            >
                                {strings.perFormSubmitButton}
                            </Button>
                        </>
                    )}
                >
                    <div>
                        {strings.perFormModalInfo}
                    </div>
                    <div>
                        {strings.perFormModalSubmitButton}
                    </div>
                </Modal>
            )}
        </>
    );
}

Component.displayName = 'PerAssessmentForm';
