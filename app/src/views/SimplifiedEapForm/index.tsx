import {
    type ElementRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    useParams,
    useSearchParams,
} from 'react-router-dom';
import {
    Button,
    ListView,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TopBanner,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { injectClientId } from '@ifrc-go/ui/utils';
import {
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
import {
    EAP_STATUS_NS_ADDRESSING_COMMENTS,
    EAP_STATUS_UNDER_DEVELOPMENT,
} from '#utils/constants';
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

import {
    checkTabErrors,
    type TabKeys,
} from './common';
import DeliveryAndBudget from './DeliveryAndBudget';
import EarlyAction from './EarlyAction';
import EnablingApproaches from './EnablingApproaches';
import Overview from './Overview';
import PlannedOperations from './PlannedOperations';
import RiskAnalysis from './RiskAnalysis';
import {
    formSchema,
    type PartialSimplifiedEapType,
} from './schema';

import i18n from './i18n.json';

const DEFAULT_SEAP_TIMEFRAME = 2; // years

type EapSimplifiedRequestBody = GoApiBody<'/api/v2/simplified-eap/', 'POST'>;
type GetSimplifiedResponse = GoApiResponse<'/api/v2/simplified-eap/{id}/'>;

function getNextStep(current: TabKeys, direction: 1 | -1) {
    const tabKeyList: TabKeys[] = [
        'overview',
        'riskAnalysis',
        'earlyAction',
        'plannedOperations',
        'enablingApproaches',
        'deliveryAndBudget',
    ];

    const currentIndex = tabKeyList.findIndex((key) => key === current);

    return tabKeyList[currentIndex + direction];
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { navigate } = useRouting();

    const {
        value,
        setFieldValue,
        error: formError,
        setError,
        validate,
        setValue,
    } = useForm(formSchema, { value: {} });

    const alert = useAlert();
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const { eapId } = useParams<{ eapId: string }>();
    const [searchParams] = useSearchParams();
    const version = searchParams.get('version') ?? undefined;

    const updateFileUrlMapping = useCallback((response: GetSimplifiedResponse) => {
        setFileIdToUrlMap((prevMap) => {
            const {
                cover_image_file,

                hazard_impact_images,
                risk_selected_protocols_images,
                selected_early_actions_images,

                budget_file_details,

                updated_checklist_file_details,
            } = response;

            return {
                ...prevMap,
                ...listToMap(
                    [
                        cover_image_file,
                        ...hazard_impact_images ?? [],
                        ...risk_selected_protocols_images ?? [],
                        ...selected_early_actions_images ?? [],
                        budget_file_details,
                        updated_checklist_file_details,
                    ].map(
                        (eapFile) => {
                            if (isNotDefined(eapFile)) {
                                return undefined;
                            }

                            const {
                                id,
                                file,
                            } = eapFile;

                            if (isNotDefined(id) || isNotDefined(file)) {
                                return undefined;
                            }

                            return {
                                id,
                                file,
                            };
                        },
                    ).filter(isDefined),
                    (file) => file.id,
                    (file) => file.file,
                ),
            };
        });
    }, []);

    const updateFormValueFromResponse = useCallback((response: GetSimplifiedResponse) => {
        updateFileUrlMapping(response);

        const {
            planned_operations,
            enable_approaches,
            cover_image_file,
            hazard_impact_images,
            selected_early_actions_images,
            risk_selected_protocols_images,
            partner_contacts,
            ...otherValues
        } = removeNull(response);

        setValue({
            ...otherValues,

            cover_image_file: isDefined(cover_image_file)
                ? injectClientId(cover_image_file)
                : undefined,

            partner_contacts: partner_contacts?.map(injectClientId),

            hazard_impact_images: hazard_impact_images?.map(injectClientId),
            selected_early_actions_images: selected_early_actions_images?.map(injectClientId),
            risk_selected_protocols_images: risk_selected_protocols_images?.map(injectClientId),

            planned_operations: planned_operations?.map((intervention) => ({
                ...intervention,
                indicators: intervention.indicators?.map(injectClientId),
                early_action_activities: intervention.early_action_activities?.map(injectClientId),
                readiness_activities: intervention.readiness_activities?.map(injectClientId),
                prepositioning_activities: intervention.prepositioning_activities
                    ?.map(injectClientId),
            })),
            enable_approaches: enable_approaches?.map((approach) => ({
                ...approach,
                indicators: approach.indicators?.map(injectClientId),
                early_action_activities: approach.early_action_activities?.map(injectClientId),
                readiness_activities: approach.readiness_activities?.map(injectClientId),
                prepositioning_activities: approach.prepositioning_activities?.map(injectClientId),
            })),
        });
    }, [updateFileUrlMapping, setValue]);

    const processServerErrors = useCallback((errors: ResponseObjectError) => {
        setError(transformObjectError(
            errors,
            (locations) => {
                let match = matchArray(locations, ['cover_image_file', NUM]);
                if (isDefined(match)) {
                    return value?.cover_image_file?.client_id;
                }

                match = matchArray(locations, ['partner_contacts', NUM]);
                if (isDefined(match)) {
                    const [index] = match;
                    return value?.partner_contacts?.[index!]?.client_id;
                }

                match = matchArray(locations, ['hazard_impact_images', NUM]);
                if (isDefined(match)) {
                    const [index] = match;
                    return value?.hazard_impact_images?.[index!]?.client_id;
                }

                match = matchArray(locations, ['risk_selected_protocols_images', NUM]);
                if (isDefined(match)) {
                    const [index] = match;
                    return value?.risk_selected_protocols_images?.[index!]?.client_id;
                }

                match = matchArray(locations, ['selected_early_actions_images', NUM]);
                if (isDefined(match)) {
                    const [index] = match;
                    return value?.selected_early_actions_images?.[index!]?.client_id;
                }

                match = matchArray(locations, ['planned_operations', NUM, 'early_action_activities', NUM]);
                if (isDefined(match)) {
                    const [poIndex, index] = match;
                    return value?.planned_operations?.[poIndex!]
                        ?.early_action_activities?.[index!]?.client_id;
                }
                match = matchArray(locations, ['planned_operations', NUM, 'readiness_activities', NUM]);
                if (isDefined(match)) {
                    const [poIndex, index] = match;
                    return value?.planned_operations?.[poIndex!]
                        ?.readiness_activities?.[index!]?.client_id;
                }
                match = matchArray(locations, ['planned_operations', NUM, 'prepositioning_activities', NUM]);
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
                match = matchArray(locations, ['enable_approaches', NUM, 'early_action_activities', NUM]);
                if (isDefined(match)) {
                    const [eaIndex, index] = match;
                    return value?.enable_approaches?.[eaIndex!]
                        ?.early_action_activities?.[index!]?.client_id;
                }
                match = matchArray(locations, ['enable_approaches', NUM, 'readiness_activities', NUM]);
                if (isDefined(match)) {
                    const [eaIndex, index] = match;
                    return value?.enable_approaches?.[eaIndex!]
                        ?.readiness_activities?.[index!]?.client_id;
                }
                match = matchArray(locations, ['enable_approaches', NUM, 'prepositioning_activities', NUM]);
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
            },
        ));
    }, [value, setError]);

    const {
        pending: eapRegistrationPending,
        response: eapRegistrationResponse,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
    });

    const selectedSimplifiedEap = eapRegistrationResponse?.simplified_eap_details?.find(
        (simplifiedEap) => String(simplifiedEap.version) === String(version),
    );

    const latestSimplifiedEapId = eapRegistrationResponse?.latest_simplified_eap;
    const latestSimplifiedEap = eapRegistrationResponse?.simplified_eap_details?.find(
        (simplifiedEap) => simplifiedEap.id === latestSimplifiedEapId,
    );

    const currentSimplifiedEap = selectedSimplifiedEap ?? latestSimplifiedEap;
    const currentSimplifiedEapId = currentSimplifiedEap?.id;

    // FIXME: handle errors
    const {
        pending: simplifiedEapPending,
        response: simplifiedEapResponse,
    } = useRequest({
        skip: isNotDefined(currentSimplifiedEapId),
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(currentSimplifiedEapId) ? {
            id: Number(currentSimplifiedEapId),
        } : undefined,
        onSuccess: (response) => {
            updateFormValueFromResponse(response);
        },
    });

    useEffect(() => {
        if (isNotDefined(eapRegistrationResponse)) {
            return;
        }

        if (simplifiedEapPending) {
            return;
        }

        if (isDefined(simplifiedEapResponse)) {
            return;
        }

        const {
            national_society_contact_name,
            national_society_contact_title,
            national_society_contact_email,
            national_society_contact_phone_number,
            dref_focal_point_name,
            dref_focal_point_title,
            dref_focal_point_email,
            dref_focal_point_phone_number,
        } = removeNull(eapRegistrationResponse);

        setValue((prevValue) => ({
            ...prevValue,
            national_society_contact_name,
            national_society_contact_title,
            national_society_contact_email,
            national_society_contact_phone_number,
            dref_focal_point_name,
            dref_focal_point_title,
            dref_focal_point_email,
            dref_focal_point_phone_number,
            seap_timeframe: DEFAULT_SEAP_TIMEFRAME,
        }));
    }, [eapRegistrationResponse, simplifiedEapPending, simplifiedEapResponse, setValue]);

    const isLatestVersion = currentSimplifiedEapId === latestSimplifiedEapId;

    const isEditable = isLatestVersion
        && (eapRegistrationResponse?.status === EAP_STATUS_UNDER_DEVELOPMENT
            || eapRegistrationResponse?.status === EAP_STATUS_NS_ADDRESSING_COMMENTS);

    const readOnly = !isEditable;

    const {
        pending: createSimplifiedEapPending,
        trigger: createSimplifiedEap,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/simplified-eap/',
        body: (body: EapSimplifiedRequestBody) => body,
        onSuccess: () => {
            const message = strings.eapSimplifiedSuccess;
            alert.show(
                message,
                { variant: 'success' },
            );
            navigate('accountMyFormsEap');
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
            } = err;

            processServerErrors(formErrors);

            alert.show(
                strings.eapSimplifiedFailure,
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
            );
        },
    });

    const {
        pending: updateSimplifiedEapPending,
        trigger: updateSimplifiedEap,
    } = useLazyRequest({
        url: '/api/v2/simplified-eap/{id}/',
        method: 'PATCH',
        pathVariables: {
            id: Number(latestSimplifiedEapId),
        },
        body: (formFields: EapSimplifiedRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.eapSimplifiedUpdateMessage,
                { variant: 'success' },
            );

            // FIXME: only navigate to accounts page for the submit action
            navigate(
                'accountMyFormsEap',
                { params: { eapId: response.id } },
            );
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
            } = err;

            processServerErrors(formErrors);

            alert.show(
                strings.updateFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
            );
        },
    });

    const disabled = createSimplifiedEapPending
        || eapRegistrationPending
        || updateSimplifiedEapPending;

    const handleValidationSuccess = useCallback((validatedFormValue: PartialSimplifiedEapType) => {
        if (isNotDefined(latestSimplifiedEapId)) {
            createSimplifiedEap({
                // FIXME: remove cast to unknown (need to make previous_id read-only)
                ...validatedFormValue as unknown as EapSimplifiedRequestBody,
                eap_registration: Number(eapId),
            });
        } else {
            updateSimplifiedEap({
                ...validatedFormValue,
                id: latestSimplifiedEapId,
                // FIXME: remove cast to unknown (need to make previous_id read-only)
            } as unknown as EapSimplifiedRequestBody);
        }
    }, [
        eapId,
        createSimplifiedEap,
        updateSimplifiedEap,
        latestSimplifiedEapId,
    ]);

    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const formContentRef = useRef<ElementRef<'div'>>(null);

    const handleFormError = useCallback(() => {
        setTimeout(() => formContentRef.current?.scrollIntoView(), 200);
    }, []);

    const handleSave = useMemo(() => (
        createSubmitHandler(
            validate,
            setError,
            handleValidationSuccess,
            handleFormError,
        )
    ), [
        handleFormError,
        handleValidationSuccess,
        validate,
        setError,
    ]);

    const nextStep = getNextStep(activeTab, 1);
    const prevStep = getNextStep(activeTab, -1);

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    return (
        <Tabs
            value={activeTab}
            onChange={setActiveTab}
            styleVariant="step"
        >
            <Page
                heading={strings.simplifiedEapHeading}
                description={strings.simplifiedEapDescription}
                beforeHeaderContent={readOnly && (
                    <TopBanner variant="warning">
                        {strings.readOnlyWarningMessage}
                    </TopBanner>
                )}
                actions={(
                    <>
                        {isEditable && (
                            <Link
                                to="accountMyFormsEap"
                                styleVariant="outline"
                                colorVariant="primary"
                            >
                                {strings.simplifiedCancelButton}
                            </Link>
                        )}
                        {isEditable && (
                            <Button
                                name={undefined}
                                onClick={handleSave}
                            >
                                {strings.simplifiedSaveButton}
                            </Button>
                        )}
                    </>
                )}
                info={(
                    <TabList>
                        <Tab
                            name="overview"
                            step={1}
                            errored={checkTabErrors(formError, 'overview')}
                        >
                            {strings.simplifiedEapOverview}
                        </Tab>
                        <Tab
                            name="riskAnalysis"
                            step={2}
                            errored={checkTabErrors(formError, 'riskAnalysis')}
                        >
                            {strings.simplifiedEapRiskAnalysis}
                        </Tab>
                        <Tab
                            name="earlyAction"
                            step={3}
                            errored={checkTabErrors(formError, 'earlyAction')}
                        >
                            {strings.simplifiedEapEarlyAction}
                        </Tab>
                        <Tab
                            name="plannedOperations"
                            step={4}
                            errored={checkTabErrors(formError, 'plannedOperations')}
                        >
                            {strings.simplifiedPlannedOperations}
                        </Tab>
                        <Tab
                            name="enablingApproaches"
                            step={5}
                            errored={checkTabErrors(formError, 'enablingApproaches')}
                        >
                            {strings.simplifiedEnablingApproaches}
                        </Tab>
                        <Tab
                            name="deliveryAndBudget"
                            step={6}
                            errored={checkTabErrors(formError, 'deliveryAndBudget')}
                        >
                            {strings.simplifiedDeliverAndBudget}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
            >
                <TabPanel name="overview">
                    <Overview
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        eapRegistrationDetail={eapRegistrationResponse}
                        readOnly={readOnly}
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
                        readOnly={readOnly}
                    />
                </TabPanel>
                <TabPanel name="earlyAction">
                    <EarlyAction
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        eapRegistrationDetail={eapRegistrationResponse}
                        readOnly={readOnly}
                    />
                </TabPanel>
                <TabPanel name="plannedOperations">
                    <PlannedOperations
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </TabPanel>
                <TabPanel name="enablingApproaches">
                    <EnablingApproaches
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </TabPanel>
                <TabPanel name="deliveryAndBudget">
                    <DeliveryAndBudget
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        readOnly={readOnly}
                    />
                </TabPanel>
                <ListView withCenteredContents>
                    <Button
                        name={prevStep ?? activeTab}
                        onClick={handleTabChange}
                        disabled={isNotDefined(prevStep)}
                    >
                        {strings.simplifiedBackButton}
                    </Button>
                    {isDefined(nextStep) ? (
                        <Button
                            name={nextStep ?? activeTab}
                            onClick={handleTabChange}
                        >
                            {strings.simplifiedNextButton}
                        </Button>
                    ) : (
                        <Button
                            name={undefined}
                            onClick={handleSave}
                            disabled={readOnly}
                        >
                            {strings.simplifiedSaveButton}
                        </Button>
                    )}
                </ListView>
            </Page>
        </Tabs>
    );
}
