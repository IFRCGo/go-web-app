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
    PerFormArea,
    PerFormQuestionItem,
    assessmentSchema,
    Assessment,
    PerAssessmentResponseFields,
} from './common';
import AreaInput from './AreaInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface PerProcessStatusItem {
    assessment: number | null;
    prioritization: number | null;
    workplan: number | null;

    assessment_number: number;
    country: number;
    country_details: {
        iso3: string | null;
        name: string;
    };
    date_of_assessment: string;
    id: number;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();

    const {
        pending: perProcessStatusPending,
        response: perProcessStatusResponse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}`,
    });

    console.info(perProcessStatusResponse);

    const {
        perPrioritizationForm: perPrioritizationFormRoute,
    } = useContext(RouteContext);

    const {
        value,
        validate,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(
        assessmentSchema,
        // TODO: move this to separate variable
        {
            value: {
                // overview:
                is_draft: true,
                area_responses: [],
            },
        },
    );

    const {
        setValue: setAreaResponsesValue,
    } = useFormArray('area_responses', setFieldValue);

    const strings = useTranslation(i18n);

    const alert = useAlert();

    const [areas, setAreas] = useState<PerFormArea[]>([]);
    const [currentArea, setCurrentArea] = useState<number | undefined>();

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

    const minArea = 1;
    const maxArea = areas.length;

    const {
        trigger: savePerAssessment,
    } = useLazyRequest<PerAssessmentResponseFields, Partial<Assessment>>({
        url: `api/v2/per-assessment/${perProcessStatusResponse?.assessment}`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isNotDefined(perId) && isDefined(response.id)) {
                navigate(
                    generatePath(
                        perPrioritizationFormRoute.absolutePath,
                        { perId: String(response.id) },
                    ),
                );
            }

            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                // formErrors,
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
            console.log('Final values', formValues as Assessment);
            if (isDefined(perProcessStatusResponse?.assessment)) {
                savePerAssessment(formValues as Assessment);
            } else {
                console.error('assesment id not defined');
            }
        },
        [savePerAssessment],
    );

    const handleNextTab = () => {
        setCurrentArea(Math.min((currentArea ?? 0) + 1, areas.length));
    };

    const handlePrevTab = () => {
        setCurrentArea(Math.max((currentArea ?? 0) - 1, 1));
    };

    const areaResponseMapping = listToMap(
        value?.area_responses ?? [],
        (areaResponse) => areaResponse.area_id,
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

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            className={styles.assessmentForm}
        >
            {questionsPending && (
                <BlockLoading />
            )}
            {!questionsPending && (
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
            {!questionsPending && currentArea && (
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
                                errored={undefined}
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
                        {currentArea !== undefined && currentArea > minArea
                            && (
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handlePrevTab}
                                    disabled={undefined}
                                >
                                    Back
                                </Button>
                            )}
                        {currentArea !== undefined && currentArea < maxArea
                            && (
                                <Button
                                    name="next"
                                    variant="secondary"
                                    onClick={handleNextTab}
                                    disabled={undefined}
                                >
                                    Next
                                </Button>
                            )}
                        <Button
                            type="submit"
                            name="submit"
                            variant="secondary"
                        >
                            Submit
                        </Button>
                    </div>
                </Tabs>
            )}
        </form>
    );
}

Component.displayName = 'PerAssessmentForm';
