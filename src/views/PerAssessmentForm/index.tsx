import {
    useState,
    useCallback,
    useContext,
    useRef,
    ElementRef,
} from 'react';
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
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    PartialForm,
    createSubmitHandler,
    useForm,
    useFormArray,
    removeNull,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
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
import { STEP_ASSESSMENT } from '#utils/per';
import type { PerProcessOutletContext } from '#utils/outletContext';
import type { paths } from '#generated/types';

import {
    assessmentSchema,
    PartialAssessment,
} from './schema';
import AreaInput from './AreaInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFormValue: PartialAssessment = {
    is_draft: true,
    area_responses: [],
};

type AssessmentResponse = paths['/api/v2/per-assessment/{id}/']['put']['responses']['200']['content']['application/json'];
type PerFormQuestionResponse = paths['/api/v2/per-formquestion/']['get']['responses']['200']['content']['application/json'];
type PerFormArea = NonNullable<PerFormQuestionResponse['results']>[number]['component']['area']

const defaultFormAreas: PerFormArea[] = [];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const formContentRef = useRef<ElementRef<'div'>>(null);
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

    const [currentArea, setCurrentArea] = useState<number | undefined>();
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
            limit: 500,
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
            setCurrentArea(sortedUniqueAreas[0]?.id);
        },
    });

    const {
        response: perOverviewResponse,
    } = useRequest({
        skip: isNotDefined(statusResponse?.id),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: {
            id: Number(statusResponse?.id),
        },
    });

    const {
        pending: perAssesmentPending,
    } = useRequest({
        skip: isNotDefined(statusResponse?.id),
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
        method: 'PUT',
        body: (ctx: AssessmentResponse) => ctx,
        onSuccess: (response) => {
            if (!response) {
                // TODO: show proper error message
                return;
            }

            alert.show(
                strings.saveRequestSuccessMessage,
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
                console.error('assesment id not defined');
                return;
            }

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

    const areaIdGroupedQuestion = listToGroupList(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
    );

    const areaIdToTitleMap = listToMap(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
        (question) => question.component.area.title,
    );

    const minArea = 1;
    const maxArea = areas.length;
    const currentPerStep = statusResponse?.phase;
    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);

    const pending = questionsPending
        || perOptionsPending
        || perAssesmentPending;

    const readOnlyMode = currentPerStep !== STEP_ASSESSMENT;

    return (
        <div
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
            {!pending && isDefined(currentArea) && (
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
                            disabled={isNotDefined(currentPerStep)
                                || savePerPending
                                || perAssesmentPending
                                || currentPerStep !== STEP_ASSESSMENT}
                        >
                            {strings.submitAssessmentButtonLabel}
                        </ConfirmButton>
                    )}
                >
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
                                        readOnly={readOnlyMode}
                                        questions={areaIdGroupedQuestion[area.id]}
                                        index={areaResponseMapping[area.id]?.index}
                                        value={areaResponseMapping[area.id]?.value}
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
                    {actionDivRef.current && (
                        <Portal
                            container={actionDivRef.current}
                        >
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleFormSubmit}
                                disabled={isNotDefined(currentPerStep)
                                    || savePerPending
                                    || perAssesmentPending
                                    || readOnlyMode}
                            >
                                {strings.saveAssessmentButtonLabel}
                            </Button>
                        </Portal>
                    )}
                </Container>
            )}
        </div>
    );
}
