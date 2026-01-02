import {
    type ElementRef,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    Button,
    ListView,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { injectClientId } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import Link from '#components/Link';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { EAP_STATUS_UNDER_DEVELOPMENT } from '#utils/constants';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    type ResponseObjectError,
    transformObjectError,
} from '#utils/restRequest/error';

import ApprovalModal from './ApprovalModal';
import {
    checkTabErrors,
    type TabKeys,
} from './common';
import EapActivationProcess from './EapActivationProcess';
import FinanceLogistics from './FinanceLogistics';
import Meal from './Meal';
import NationalSocietyCapacity from './NationalSocietyCapacity';
import Overview from './Overview';
import RiskAnalysis from './RiskAnalysis';
import {
    formSchema,
    type PartialEapFullFormType,
} from './schema';
import SelectionActions from './SelectionActions';
import TriggerModel from './TriggerModel';

import i18n from './i18n.json';

type EapFullRequestBody = GoApiBody<'/api/v2/full-eap/', 'POST'>;
type GetFullEapResponse = GoApiResponse<'/api/v2/full-eap/{id}/'>;

function getNextStep(current: TabKeys, direction: 1 | -1) {
    const tabKeyList: TabKeys[] = [
        'overview',
        'riskAnalysis',
        'triggerModel',
        'selectionActions',
        'eapActivation',
        'meal',
        'nationalSocietyCapacity',
        'financeLogistics',
    ];
    const currentIndex = tabKeyList.findIndex((key) => key === current);

    return tabKeyList[currentIndex + direction];
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>(
        {},
    );
    const { eapId } = useParams<{ eapId: string }>();
    const formContentRef = useRef<ElementRef<'div'>>(null);
    const strings = useTranslation(i18n);
    const { navigate } = useRouting();
    const [
        showApprovalModal,
        { setTrue: setShowApprovalModalTrue, setFalse: setShowApprovalModalFalse },
    ] = useBooleanState(false);

    const alert = useAlert();

    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        validate,
        setError,
    } = useForm(formSchema, {
        value: {},
    });

    const updateFileUrlMapping = useCallback((response: GetFullEapResponse) => {
        setFileIdToUrlMap((prevMap) => {
            const {
                cover_image_file,
                hazard_selection_images,
                forecast_selection_images,
                trigger_activation_system_images,
                early_action_selection_process_images,
                exposed_element_and_vulnerability_factor_images,
                identification_of_the_intervention_area_images,
                definition_and_justification_impact_level_images,
                prioritized_impact_images,
                early_action_implementation_images,
                budget_file_details,
            } = response;
            return {
                ...prevMap,
                ...listToMap(
                    [
                        cover_image_file,
                        ...(hazard_selection_images ?? []),
                        ...(forecast_selection_images ?? []),
                        ...(trigger_activation_system_images ?? []),
                        ...(early_action_selection_process_images ?? []),
                        ...(exposed_element_and_vulnerability_factor_images ?? []),
                        ...(identification_of_the_intervention_area_images ?? []),
                        ...(definition_and_justification_impact_level_images ?? []),
                        ...(prioritized_impact_images ?? []),
                        ...(early_action_implementation_images ?? []),
                        budget_file_details,
                    ]
                        .map((eapFile) => {
                            if (isNotDefined(eapFile)) {
                                return undefined;
                            }

                            const { id, file } = eapFile;

                            if (isNotDefined(id) || isNotDefined(file)) {
                                return undefined;
                            }

                            return {
                                id,
                                file,
                            };
                        })
                        .filter(isDefined),
                    (file) => file.id,
                    (file) => file.file,
                ),
            };
        });
    }, []);

    const loadResponseToFormValue = useCallback(
        (response: GetFullEapResponse) => {
            updateFileUrlMapping(response);

            const {
                planned_operations,
                enable_approaches,
                cover_image_file,
                hazard_selection_images,
                forecast_selection_images,
                trigger_activation_system_images,
                early_action_selection_process_images,
                early_action_implementation_images,
                exposed_element_and_vulnerability_factor_images,
                identification_of_the_intervention_area_images,
                definition_and_justification_impact_level_images,
                prioritized_impact_images,
                activation_process_source_of_information,
                evidence_base_source_of_information,
                early_actions,
                risk_analysis_source_of_information,
                trigger_model_source_of_information,
                trigger_statement_source_of_information,
                key_actors,
                prioritized_impacts,
                ...otherValues
            } = removeNull(response);

            setValue({
                ...otherValues,

                activation_process_source_of_information:
                    activation_process_source_of_information?.map(injectClientId),
                risk_analysis_source_of_information:
                    risk_analysis_source_of_information?.map(injectClientId),
                evidence_base_source_of_information:
                    evidence_base_source_of_information?.map(injectClientId),
                trigger_model_source_of_information:
                    trigger_model_source_of_information?.map(injectClientId),
                trigger_statement_source_of_information:
                    trigger_statement_source_of_information?.map(injectClientId),
                early_actions: early_actions?.map(injectClientId),
                key_actors: key_actors?.map(injectClientId),
                prioritized_impacts: prioritized_impacts?.map(injectClientId),

                cover_image_file: isDefined(cover_image_file)
                    ? injectClientId(cover_image_file)
                    : undefined,

                early_action_implementation_images:
                    early_action_implementation_images?.map(injectClientId),
                hazard_selection_images: hazard_selection_images?.map(injectClientId),
                forecast_selection_images:
                    forecast_selection_images?.map(injectClientId),
                trigger_activation_system_images:
                    trigger_activation_system_images?.map(injectClientId),
                early_action_selection_process_images:
                    early_action_selection_process_images?.map(injectClientId),
                exposed_element_and_vulnerability_factor_images:
                    exposed_element_and_vulnerability_factor_images?.map(injectClientId),
                identification_of_the_intervention_area_images:
                    identification_of_the_intervention_area_images?.map(injectClientId),
                definition_and_justification_impact_level_images:
                    definition_and_justification_impact_level_images?.map(injectClientId),
                prioritized_impact_images:
                    prioritized_impact_images?.map(injectClientId),

                planned_operations: planned_operations?.map((intervention) => ({
                    ...intervention,
                    indicators: intervention.indicators?.map(injectClientId),
                    early_action_activities:
                        intervention.early_action_activities?.map(injectClientId),
                    readiness_activities:
                        intervention.readiness_activities?.map(injectClientId),
                    prepositioning_activities:
                        intervention.prepositioning_activities?.map(injectClientId),
                })),
                enable_approaches: enable_approaches?.map((approach) => ({
                    ...approach,
                    indicators: approach.indicators?.map(injectClientId),
                    early_action_activities:
                        approach.early_action_activities?.map(injectClientId),
                    readiness_activities:
                        approach.readiness_activities?.map(injectClientId),
                    prepositioning_activities:
                        approach.prepositioning_activities?.map(injectClientId),
                })),
            });
        },
        [updateFileUrlMapping, setValue],
    );

    const processServerErrors = useCallback(
        (errors: ResponseObjectError) => {
            setError(
                transformObjectError(errors, (locations) => {
                    let match = matchArray(locations, ['cover_image_file', NUM]);
                    if (isDefined(match)) {
                        return value?.cover_image_file?.client_id;
                    }

                    match = matchArray(locations, ['hazard_selection_images', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.hazard_selection_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'exposed_element_and_vulnerability_factor_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.exposed_element_and_vulnerability_factor_images?.[
                            index!
                        ]?.client_id;
                    }

                    match = matchArray(locations, ['prioritized_impact_images', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.prioritized_impact_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'risk_analysis_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.risk_analysis_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'trigger_statement_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.trigger_statement_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, ['forecast_selection_images', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.forecast_selection_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'definition_and_justification_impact_level_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.definition_and_justification_impact_level_images?.[
                            index!
                        ]?.client_id;
                    }

                    match = matchArray(locations, [
                        'identification_of_the_intervention_area_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.identification_of_the_intervention_area_images?.[
                            index!
                        ]?.client_id;
                    }

                    match = matchArray(locations, [
                        'trigger_model_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.trigger_model_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, ['early_actions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.early_actions?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'early_action_selection_process_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.early_action_selection_process_images?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'early_action_selection_process_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.early_action_selection_process_images?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'evidence_base_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.evidence_base_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'early_action_implementation_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.early_action_implementation_images?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'trigger_activation_system_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.trigger_activation_system_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'activation_process_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.trigger_activation_system_images?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'planned_operations',
                        NUM,
                        'early_action_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [poIndex, index] = match;
                        return value?.planned_operations?.[poIndex!]
                            ?.early_action_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'planned_operations',
                        NUM,
                        'readiness_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [poIndex, index] = match;
                        return value?.planned_operations?.[poIndex!]
                            ?.readiness_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'planned_operations',
                        NUM,
                        'prepositioning_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [poIndex, index] = match;
                        return value?.planned_operations?.[poIndex!]
                            ?.prepositioning_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, ['planned_operations', NUM]);
                    if (isDefined(match)) {
                        const [poIndex] = match;
                        return value?.planned_operations?.[poIndex!]?.sector;
                    }
                    match = matchArray(locations, [
                        'enable_approaches',
                        NUM,
                        'early_action_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [eaIndex, index] = match;
                        return value?.enable_approaches?.[eaIndex!]
                            ?.early_action_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'enable_approaches',
                        NUM,
                        'readiness_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [eaIndex, index] = match;
                        return value?.enable_approaches?.[eaIndex!]?.readiness_activities?.[
                            index!
                        ]?.client_id;
                    }
                    match = matchArray(locations, [
                        'enable_approaches',
                        NUM,
                        'prepositioning_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [eaIndex, index] = match;
                        return value?.enable_approaches?.[eaIndex!]
                            ?.prepositioning_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, ['enable_approaches', NUM]);
                    if (isDefined(match)) {
                        const [eaIndex] = match;
                        return value?.enable_approaches?.[eaIndex!]?.approach;
                    }

                    return undefined;
                }),
            );
        },
        [value, setError],
    );

    const { pending: fetchingEap, response: eapDetailResponse } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
        onSuccess: (response) => {
            if (isDefined(response.expected_submission_time)) {
                setFieldValue(
                    response?.expected_submission_time,
                    'expected_submission_time' as const,
                );
            }
        },
    });

    const latestFullEapId = useMemo(() => eapDetailResponse?.full_eap_details?.toSorted(
        (a, b) => compareNumber(a.version, b.version, -1),
    )?.[0]?.id, [eapDetailResponse?.full_eap_details]);

    useRequest({
        skip: isNotDefined(latestFullEapId),
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(latestFullEapId)
            ? {
                id: latestFullEapId,
            }
            : undefined,
        onSuccess: (response) => loadResponseToFormValue(response),
    });

    const { pending: eapFullPending, trigger: createFullEap } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/full-eap/',
        body: (body: EapFullRequestBody) => body,
        onSuccess: () => {
            const message = strings.successMessage;
            alert.show(message, { variant: 'success' });
            navigate('accountMyFormsEap');
        },
        onFailure: (err) => {
            const {
                value: { formErrors, messageForNotification },
            } = err;

            processServerErrors(formErrors);

            alert.show(strings.failureMessage, {
                variant: 'danger',
                description: messageForNotification,
            });
        },
    });

    const { pending: updateFullFormPending, trigger: updateFullEap } = useLazyRequest({
        url: '/api/v2/full-eap/{id}/',
        method: 'PATCH',
        pathVariables: {
            id: Number(latestFullEapId),
        },
        body: (formFields: EapFullRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(strings.updateSuccess, { variant: 'success' });

            // FIXME: only navigate to accounts page for the submit action
            navigate('accountMyFormsEap', { params: { eapId: response.id } });
        },
        onFailure: (err) => {
            const {
                value: { formErrors, messageForNotification },
            } = err;

            processServerErrors(formErrors);

            alert.show(strings.updateFailure, {
                variant: 'danger',
                description: messageForNotification,
            });
        },
    });
    const disabled = eapFullPending || updateFullFormPending || fetchingEap;

    const nextStep = getNextStep(activeTab, 1);
    const prevStep = getNextStep(activeTab, -1);

    const handleValidationSuccess = useCallback(
        (validatedFormValue: PartialEapFullFormType) => {
            if (isNotDefined(latestFullEapId)) {
                createFullEap({
                    ...(validatedFormValue as EapFullRequestBody),
                    eap_registration: Number(eapId),
                });
            } else {
                updateFullEap({
                    ...validatedFormValue,
                    id: latestFullEapId,
                } as EapFullRequestBody);
            }
        },
        [eapId, createFullEap, latestFullEapId, updateFullEap],
    );

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    const handleFormError = useCallback(() => {
        setTimeout(() => formContentRef.current?.scrollIntoView(), 200);
    }, []);

    const handleSave = useMemo(
        () => createSubmitHandler(
            validate,
            setError,
            handleValidationSuccess,
            handleFormError,
        ),
        [handleFormError, handleValidationSuccess, validate, setError],
    );

    const handleSubmitApproval = useCallback(() => {
        handleSave();
        setShowApprovalModalTrue();
    }, [handleSave, setShowApprovalModalTrue]);

    return (
        <Tabs value={activeTab} onChange={setActiveTab} styleVariant="step">
            <Page
                heading={strings.mainHeading}
                description={strings.mainDescription}
                withBackgroundColorInMainSection
                actions={(
                    <>
                        <Link
                            to="accountMyFormsEap"
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.cancelButton}
                        </Link>
                        <Button name={undefined} onClick={handleSave}>
                            {strings.saveButton}
                        </Button>
                        <Button
                            name={undefined}
                            onClick={handleSubmitApproval}
                            disabled={
                                eapDetailResponse?.status !== EAP_STATUS_UNDER_DEVELOPMENT
                            }
                        >
                            {strings.submitButton}
                        </Button>
                    </>
                )}
                info={(
                    <TabList>
                        <Tab
                            name="overview"
                            step={1}
                            errored={checkTabErrors(formError, 'overview')}
                        >
                            {strings.overviewTabLabel}
                        </Tab>
                        <Tab
                            name="riskAnalysis"
                            step={2}
                            errored={checkTabErrors(formError, 'riskAnalysis')}
                        >
                            {strings.riskAnalysisTabLabel}
                        </Tab>
                        <Tab
                            name="triggerModel"
                            step={3}
                            errored={checkTabErrors(formError, 'triggerModel')}
                        >
                            {strings.triggerModelTabLabel}
                        </Tab>
                        <Tab
                            name="selectionActions"
                            step={4}
                            errored={checkTabErrors(formError, 'selectionActions')}
                        >
                            {strings.selectionActionsTabLabel}
                        </Tab>
                        <Tab
                            name="eapActivation"
                            step={5}
                            errored={checkTabErrors(formError, 'eapActivation')}
                        >
                            {strings.activationProcessTabLabel}
                        </Tab>
                        <Tab
                            name="meal"
                            step={6}
                            errored={checkTabErrors(formError, 'meal')}
                        >
                            {strings.mealTabLabel}
                        </Tab>
                        <Tab
                            name="nationalSocietyCapacity"
                            step={7}
                            errored={checkTabErrors(formError, 'nationalSocietyCapacity')}
                        >
                            {strings.nationalSocietyCapacityTabLabel}
                        </Tab>
                        <Tab
                            name="financeLogistics"
                            step={8}
                            errored={checkTabErrors(formError, 'financeLogistics')}
                        >
                            {strings.financeLogisticsTabLabel}
                        </Tab>
                    </TabList>
                )}
            >
                <TabPanel name="overview">
                    <Overview
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        eapRegistrationDetail={eapDetailResponse}
                    />
                </TabPanel>
                <TabPanel name="riskAnalysis">
                    <RiskAnalysis
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    />
                </TabPanel>
                <TabPanel name="triggerModel">
                    <TriggerModel
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        eapRegistrationDetail={eapDetailResponse}
                    />
                </TabPanel>
                <TabPanel name="selectionActions">
                    <SelectionActions
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    />
                </TabPanel>
                <TabPanel name="eapActivation">
                    <EapActivationProcess
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    />
                </TabPanel>
                <TabPanel name="meal">
                    <Meal
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    />
                </TabPanel>
                <TabPanel name="nationalSocietyCapacity">
                    <NationalSocietyCapacity
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    />
                </TabPanel>
                <TabPanel name="financeLogistics">
                    <FinanceLogistics
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    />
                </TabPanel>
                <ListView withCenteredContents>
                    <Button
                        name={prevStep ?? activeTab}
                        onClick={handleTabChange}
                        disabled={isNotDefined(prevStep)}
                    >
                        {strings.backButton}
                    </Button>
                    {isDefined(nextStep) ? (
                        <Button name={nextStep ?? activeTab} onClick={handleTabChange}>
                            {strings.nextButton}
                        </Button>
                    ) : (
                        <Button name={undefined} onClick={handleSave}>
                            {strings.saveButton}
                        </Button>
                    )}
                </ListView>
                {showApprovalModal
                    && isDefined(eapId)
                    && isDefined(eapDetailResponse)
                    && isNotDefined(formError)
                    && (
                        <ApprovalModal
                            onClose={setShowApprovalModalFalse}
                            eapId={eapId}
                            status={eapDetailResponse?.status}
                        />
                    )}
            </Page>
        </Tabs>
    );
}
