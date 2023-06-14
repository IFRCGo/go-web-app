import { useState, useCallback, useContext } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import {
    unique,
    listToMap,
    compareNumber,
    listToGroupList,
    _cs,
    isNotDefined,
    isDefined,
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
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import ProgressBar from '#components/ProgressBar';
import Modal from '#components/Modal';
import Button from '#components/Button';
import {
    ListResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import {
    PerProcessStatusItem,
    getCurrentPerProcessStep,
    STEP_ASSESSMENT,
} from '#utils/per';

import {
    PerFormArea,
    PerFormQuestionItem,
    assessmentSchema,
    Assessment,
    PartialAssessment,
    PerAssessmentResponseFields,
} from './common';
import AreaInput from './AreaInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFormValue: PartialAssessment = {
    overview: 10,
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

    const [assessmentId, setAssessmentId] = useState<number>();
    const [areas, setAreas] = useState<PerFormArea[]>([]);
    const [currentArea, setCurrentArea] = useState<number | undefined>();
    const [showConfirmation, setShowConfirmation] = useState(false);

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

    const {
        pending: perAssesmentPending,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(assessmentId),
        url: `api/v2/per-assessment/${assessmentId}`,
        onSuccess: (response) => {
            setValue(response);
        },
    });

    const {
        pending: statusPending,
        response: statusResponse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}/`,
        onSuccess: (response) => {
            if (isDefined(response.assessment)) {
                setAssessmentId(response.assessment);
            }
        },
    });

    const {
        setValue: setAreaResponsesValue,
    } = useFormArray('area_responses', setFieldValue);

    const {
        pending: questionsPending,
        response: questionsResponse,
    } = useRequest<ListResponse<PerFormQuestionItem>>({
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
        trigger: savePerAssessment,
    } = useLazyRequest<PerAssessmentResponseFields, Partial<Assessment>>({
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

            if (response.is_draft === false) {
                navigate(
                    generatePath(
                        perPrioritizationFormRoute.absolutePath,
                        { perId: String(response.id) },
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

    const handleSubmit = useCallback(
        (formValues: PartialForm<Assessment>) => {
            if (isNotDefined(assessmentId) || isNotDefined(perId)) {
                // TODO: show proper error message to user
                // eslint-disable-next-line no-console
                console.error('assesment id not defined');
                return;
            }

            savePerAssessment(formValues as Assessment);
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

    const yesNoQuestions = questionsResponse?.results?.map((i) => i.answers);
    const totalValue = yesNoQuestions?.length;
    const pending = questionsPending || statusPending || perAssesmentPending;
    const minArea = 1;
    const maxArea = areas.length;
    const currentPerStep = getCurrentPerProcessStep(statusResponse);
    const handleFormSubmit = createSubmitHandler(validate, onErrorSet, handleSubmit);
    const handleModalClose = useCallback(() => {
        setShowConfirmation(false);
    }, []);

    const handleFinalSubmitClick = useCallback(() => {
        setFieldValue(false, 'is_draft');
        handleFormSubmit();
        setShowConfirmation(false);
    }, [setFieldValue, handleFormSubmit]);

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
                    <ExpandableContainer
                        className={_cs(styles.customActivity, styles.errored)}
                        componentRef={undefined}
                        actions="Show Summary"
                    >
                        <Container
                            className={styles.inputSection}
                        >
                            <ProgressBar
                                title={`Answered ${totalValue}`}
                                value={50}
                                totalValue={totalValue}
                            />
                        </Container>
                    </ExpandableContainer>
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
                                    Back
                                </Button>
                            )}
                            {currentArea !== undefined && currentArea < maxArea && (
                                <Button
                                    name="next"
                                    variant="secondary"
                                    onClick={handleNextTab}
                                >
                                    Next
                                </Button>
                            )}
                            <Button
                                type="submit"
                                name="submit"
                                variant="secondary"
                                disabled={isNotDefined(currentPerStep)
                                    || currentPerStep > STEP_ASSESSMENT}
                            >
                                Save
                            </Button>
                            {currentArea === maxArea && (
                                <Button
                                    name
                                    variant="primary"
                                    onClick={setShowConfirmation}
                                    disabled={isNotDefined(currentPerStep)
                                        || currentPerStep > STEP_ASSESSMENT}
                                >
                                    Submit Assessment
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
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleFinalSubmitClick}
                            >
                                Submit
                            </Button>
                        </>
                    )}
                >
                    <div>
                        You are about to submit the results of the PER Assessment.
                        Once submitted, the results cannot be edited.
                    </div>
                    <div>
                        Click on Submit to proceed.
                        To go back and edit, click on Cancel.
                    </div>
                </Modal>
            )}
        </>
    );
}

Component.displayName = 'PerAssessmentForm';
