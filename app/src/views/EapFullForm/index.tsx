import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    useLocation,
    useParams,
    useSearchParams,
} from 'react-router-dom';
import { ShareFillIcon } from '@ifrc-go/icons';
import {
    Alert,
    Button,
    IconButton,
    InlineLayout,
    ListView,
    Message,
    Modal,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TopBanner,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    injectClientId,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';
import {
    analyzeErrors,
    createSubmitHandler,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import EapObsoleteResolutionModal from '#components/domain/EapObsoleteResolutionModal';
import EapShareModal from '#components/domain/EapShareModal';
import Link from '#components/Link';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    EAP_STATUS_NS_ADDRESSING_COMMENTS,
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_STATUS_UNDER_REVIEW,
    EAP_TYPE_FULL,
    TIMEFRAME_DAYS,
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

type EapStatusBody = GoApiBody<'/api/v2/eap-registration/{id}/status/', 'POST'>;

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

const defaultFormValue: PartialEapFullFormType = {};

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>(
        {},
    );
    const [shouldSubmit, setShouldSubmit] = useState(false);
    const [
        showObsoletePayloadModal,
        setShowObsoletePayloadModal,
    ] = useState(false);

    const { eapId } = useParams<{ eapId: string }>();

    const [searchParams] = useSearchParams();

    const version = searchParams.get('version') ?? undefined;
    const tabListRef = useRef<HTMLDivElement>(null);
    const shouldSubmitRef = useRef(false);
    const lastModifiedAtRef = useRef<string | undefined>(null);

    const strings = useTranslation(i18n);

    const { state } = useLocation();
    const { navigate } = useRouting();

    const alert = useAlert();

    const {
        pending: fetchingEap,
        response: eapDetailResponse,
        retrigger: eapDetailRetrigger,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
    });

    const selectedFullEap = eapDetailResponse?.full_eap_details?.find(
        (fullEap) => String(fullEap.version) === String(version),
    );

    const latestFullEapId = eapDetailResponse?.latest_full_eap ?? undefined;
    const latestFullEap = eapDetailResponse?.full_eap_details?.find(
        (fullEap) => fullEap.id === latestFullEapId,
    );

    const currentFullEap = selectedFullEap ?? latestFullEap;
    const currentFullEapId = currentFullEap?.id;
    const getIsSubmission = () => shouldSubmitRef.current;

    const isLocked = currentFullEap?.is_locked;
    const isRevision = eapDetailResponse?.status === EAP_STATUS_NS_ADDRESSING_COMMENTS
        && (isDefined(currentFullEap?.version) && currentFullEap?.version > 1)
        && !isLocked;

    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        validate,
        setError,
    } = useForm(
        formSchema,
        { value: defaultFormValue },
        {
            isRevision,
            getIsSubmission,
        },
    );

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
                forecast_table_file_details,
                updated_checklist_file_details,
                theory_of_change_table_file_details,
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
                        forecast_table_file_details,
                        updated_checklist_file_details,
                        theory_of_change_table_file_details,
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
            lastModifiedAtRef.current = response?.modified_at;

            const {
                planned_operations,
                enabling_approaches,
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
                partner_contacts,
                meal_source_of_information,
                ns_capacity_source_of_information,
                ...otherValues
            } = removeNull(response);

            setValue((oldValue) => ({
                ...oldValue,
                ...otherValues,

                partner_contacts: partner_contacts?.map(injectClientId),
                activation_process_source_of_information:
                    activation_process_source_of_information?.map(injectClientId),
                meal_source_of_information: meal_source_of_information?.map(injectClientId),
                ns_capacity_source_of_information: ns_capacity_source_of_information
                    ?.map(injectClientId),
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
                enabling_approaches: enabling_approaches?.map((approach) => ({
                    ...approach,
                    indicators: approach.indicators?.map(injectClientId),
                    early_action_activities:
                        approach.early_action_activities?.map(injectClientId),
                    readiness_activities:
                        approach.readiness_activities?.map(injectClientId),
                    prepositioning_activities:
                        approach.prepositioning_activities?.map(injectClientId),
                })),
            }));
        },
        [updateFileUrlMapping, setValue],
    );

    const processServerErrors = useCallback(
        (errors: ResponseObjectError, formValue: PartialEapFullFormType) => {
            setError(
                transformObjectError(errors, (locations) => {
                    let match = matchArray(locations, ['cover_image_file', NUM]);
                    if (isDefined(match)) {
                        return formValue?.cover_image_file?.client_id;
                    }

                    match = matchArray(locations, ['key_actors', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.key_actors?.[index!]?.client_id;
                    }

                    match = matchArray(locations, ['partner_contacts', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.partner_contacts?.[index!]?.client_id;
                    }

                    match = matchArray(locations, ['hazard_selection_images', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.hazard_selection_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'exposed_element_and_vulnerability_factor_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.exposed_element_and_vulnerability_factor_images?.[
                            index!
                        ]?.client_id;
                    }

                    match = matchArray(locations, ['prioritized_impacts', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.prioritized_impacts?.[index!]?.client_id;
                    }

                    match = matchArray(locations, ['prioritized_impact_images', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.prioritized_impact_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'risk_analysis_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.risk_analysis_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, ['early_actions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.early_actions?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'trigger_statement_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.trigger_statement_source_of_information?.[index!]
                            ?.client_id;
                    }
                    match = matchArray(locations, [
                        'meal_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.meal_source_of_information?.[index!]
                            ?.client_id;
                    }
                    match = matchArray(locations, [
                        'ns_capacity_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.ns_capacity_source_of_information?.[index!]
                            ?.client_id;
                    }
                    match = matchArray(locations, ['forecast_selection_images', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.forecast_selection_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'definition_and_justification_impact_level_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.definition_and_justification_impact_level_images?.[
                            index!
                        ]?.client_id;
                    }

                    match = matchArray(locations, [
                        'identification_of_the_intervention_area_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.identification_of_the_intervention_area_images?.[
                            index!
                        ]?.client_id;
                    }

                    match = matchArray(locations, [
                        'trigger_model_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.trigger_model_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, ['early_actions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.early_actions?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'early_action_selection_process_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.early_action_selection_process_images?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'early_action_selection_process_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.early_action_selection_process_images?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'evidence_base_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.evidence_base_source_of_information?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'early_action_implementation_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.early_action_implementation_images?.[index!]
                            ?.client_id;
                    }

                    match = matchArray(locations, [
                        'trigger_activation_system_images',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.trigger_activation_system_images?.[index!]?.client_id;
                    }

                    match = matchArray(locations, [
                        'activation_process_source_of_information',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return formValue?.trigger_activation_system_images?.[index!]?.client_id;
                    }
                    match = matchArray(locations, ['planned_operations',
                        NUM,
                        'indicators',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [planned_intervention_index, index] = match;
                        return formValue?.planned_operations?.[planned_intervention_index!]
                            ?.indicators?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'planned_operations',
                        NUM,
                        'early_action_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [poIndex, index] = match;
                        return formValue?.planned_operations?.[poIndex!]
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
                        return formValue?.planned_operations?.[poIndex!]
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
                        return formValue?.planned_operations?.[poIndex!]
                            ?.prepositioning_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, ['planned_operations', NUM]);
                    if (isDefined(match)) {
                        const [poIndex] = match;
                        return formValue?.planned_operations?.[poIndex!]?.sector;
                    }
                    match = matchArray(locations, ['enabling_approaches',
                        NUM,
                        'indicators',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [planned_intervention_index, index] = match;
                        return formValue?.enabling_approaches?.[planned_intervention_index!]
                            ?.indicators?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'enabling_approaches',
                        NUM,
                        'early_action_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [eaIndex, index] = match;
                        return formValue?.enabling_approaches?.[eaIndex!]
                            ?.early_action_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, [
                        'enabling_approaches',
                        NUM,
                        'readiness_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [eaIndex, index] = match;
                        return formValue?.enabling_approaches?.[eaIndex!]?.readiness_activities?.[
                            index!
                        ]?.client_id;
                    }
                    match = matchArray(locations, [
                        'enabling_approaches',
                        NUM,
                        'prepositioning_activities',
                        NUM,
                    ]);
                    if (isDefined(match)) {
                        const [eaIndex, index] = match;
                        return formValue?.enabling_approaches?.[eaIndex!]
                            ?.prepositioning_activities?.[index!]?.client_id;
                    }
                    match = matchArray(locations, ['enabling_approaches', NUM]);
                    if (isDefined(match)) {
                        const [eaIndex] = match;
                        return formValue?.enabling_approaches?.[eaIndex!]?.approach;
                    }

                    return undefined;
                }),
            );
        },
        [setError],
    );

    const {
        pending: fullEapPending,
        response: fullEapResponse,
        error: fullEapResponseError,
    } = useRequest({
        skip: isNotDefined(currentFullEapId),
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(currentFullEapId)
            ? { id: currentFullEapId }
            : undefined,
        onSuccess: (response) => {
            loadResponseToFormValue(response);

            processServerErrors(state?.error, value);

            // NOTE state was used to pass error through navigation.
            // and cleared here to prevent stale error from reappearing on page refresh
            // "replace" avoids pushing a new entry to browser history stack
            window.history.replaceState({}, '');
        },
    });

    useEffect(() => {
        if (isNotDefined(eapDetailResponse)) {
            return;
        }

        if (fullEapPending) {
            return;
        }

        if (isDefined(fullEapResponse)) {
            return;
        }

        const {
            expected_submission_time,
            partners,
            national_society_contact_email,
            national_society_contact_name,
            national_society_contact_title,
            national_society_contact_phone_number,
            dref_focal_point_name,
            dref_focal_point_title,
            dref_focal_point_phone_number,
            dref_focal_point_email,
            ifrc_contact_name,
            ifrc_contact_email,
            ifrc_contact_title,
            ifrc_contact_phone_number,
        } = removeNull(eapDetailResponse);

        setValue((prevValue) => ({
            ...prevValue,
            expected_submission_time,
            national_society_contact_email,
            national_society_contact_name,
            national_society_contact_title,
            national_society_contact_phone_number,
            dref_focal_point_name,
            dref_focal_point_title,
            dref_focal_point_phone_number,
            dref_focal_point_email,
            ifrc_head_of_delegation_email: ifrc_contact_email,
            ifrc_head_of_delegation_name: ifrc_contact_name,
            ifrc_head_of_delegation_title: ifrc_contact_title,
            ifrc_head_of_delegation_phone_number: ifrc_contact_phone_number,
            lead_timeframe_unit: TIMEFRAME_DAYS,
            partners,
        }));
    }, [eapDetailResponse, fullEapPending, fullEapResponse, setValue]);

    const { pending: createFullEapPending, trigger: triggerCreateFullEap } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/full-eap/',
        body: (body: EapFullRequestBody) => body,
        onSuccess: (response) => {
            const message = strings.successMessage;
            alert.show(message, { variant: 'success' });
            eapDetailRetrigger();
            loadResponseToFormValue(response);
        },
        onFailure: (err) => {
            const {
                value: { formErrors, messageForNotification },
            } = err;

            processServerErrors(formErrors, value);

            alert.show(strings.failureMessage, {
                variant: 'danger',
                description: messageForNotification,
            });
        },
    });

    const { pending: updateFullFormPending, trigger: triggerUpdateFullEap } = useLazyRequest({
        url: '/api/v2/full-eap/{id}/',
        method: 'PATCH',
        pathVariables: {
            id: Number(latestFullEapId),
        },
        body: (formFields: EapFullRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(strings.updateSuccess, { variant: 'success' });
            loadResponseToFormValue(response);
        },
        onFailure: (err) => {
            const {
                value: { formErrors, messageForNotification },
            } = err;

            processServerErrors(formErrors, value);

            const modifiedAtError = formErrors.modified_at;

            if (
                (typeof modifiedAtError === 'string' && modifiedAtError === 'OBSOLETE_PAYLOAD')
                || (Array.isArray(modifiedAtError) && modifiedAtError.includes('OBSOLETE_PAYLOAD'))
            ) {
                setShowObsoletePayloadModal(true);
            }

            alert.show(strings.updateFailure, {
                variant: 'danger',
                description: messageForNotification,
            });
        },
    });

    const { trigger: triggerStatusUpdate } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/eap-registration/{id}/status/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
        body: () => ({
            status: EAP_STATUS_UNDER_REVIEW,
        // FIXME: fix typings in the server
        } as EapStatusBody),
        onSuccess: () => {
            alert.show(
                strings.submitApprovalSuccess,
                { variant: 'success' },
            );

            navigate('accountMyFormsEap');
        },
        onFailure: (error) => {
            const {
                value: { formErrors, messageForNotification },
            } = error;
            alert.show(
                strings.submitFailedSuccess,
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
            );
            processServerErrors(formErrors, value);
        },
    });

    const isLatestVersion = currentFullEapId === latestFullEapId;

    const fullEapFormAccess = (isNotDefined(eapDetailResponse?.eap_type)
        || eapDetailResponse?.eap_type === EAP_TYPE_FULL)
        && isNotDefined(fullEapResponseError);

    const isEditable = isLatestVersion
        && !isLocked
        && (eapDetailResponse?.status === EAP_STATUS_UNDER_DEVELOPMENT
            || eapDetailResponse?.status === EAP_STATUS_NS_ADDRESSING_COMMENTS);

    const readOnly = !isEditable;

    const disabled = createFullEapPending || updateFullFormPending || fetchingEap;

    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);

    const canShare = useMemo(
        () => isDefined(eapDetailResponse)
        && isDefined(eapDetailResponse.latest_full_eap),
        [eapDetailResponse],
    );

    const nextStep = getNextStep(activeTab, 1);
    const prevStep = getNextStep(activeTab, -1);

    const handleValidationSuccess = (validatedFormValue: PartialEapFullFormType) => {
        if (isNotDefined(latestFullEapId)) {
            triggerCreateFullEap({
                ...(validatedFormValue as unknown as EapFullRequestBody),
                eap_registration: Number(eapId),
            });
        } else {
            triggerUpdateFullEap({
                ...validatedFormValue,
                id: latestFullEapId,
                modified_at: lastModifiedAtRef.current,
            } as unknown as EapFullRequestBody);
        }
    };

    const handleTabChange = useCallback((newTab: TabKeys) => {
        setActiveTab(newTab);
        tabListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleFormError = () => {
        alert.show(
            strings.validationErrorAlertMessage,
            { variant: 'warning' },
        );
    };

    const handleSave = createSubmitHandler(
        validate,
        setError,
        /* FIXME(shreeyash07): lastModifiedAtRef.current read in render to
         * handle obsolete payload while submitting form */
        /* eslint-disable-next-line react-hooks/refs */
        handleValidationSuccess,
        handleFormError,
    );

    const handleObsoletePayloadOverwriteButtonClick = useCallback(
        (newModifiedAt: string | undefined) => {
            lastModifiedAtRef.current = newModifiedAt;
            setShowObsoletePayloadModal(false);
            handleSave();
        },
        [handleSave],
    );

    const handleRequestForApprovalButtonClick = useCallback(() => {
        shouldSubmitRef.current = true;
        setShouldSubmit(true);
        handleSave();
    }, [handleSave]);

    const handleRequestForApprovalCancel = useCallback(() => {
        shouldSubmitRef.current = false;
        setShouldSubmit(false);
    }, []);

    const handleSubmitForApprovalConfirm = useCallback(() => {
        shouldSubmitRef.current = false;
        triggerStatusUpdate(null);
        setShouldSubmit(false);
    }, [triggerStatusUpdate]);

    const hasFormErrors = useMemo(
        () => analyzeErrors(formError),
        [formError],
    );

    return (
        <Tabs value={activeTab} onChange={setActiveTab} styleVariant="step">
            <Page
                heading={resolveToString(
                    strings.mainHeading,
                    {
                        country: eapDetailResponse?.country_details?.name ?? '--',
                        disaster: eapDetailResponse?.disaster_type_details?.name ?? '--',
                    },
                )}
                description={strings.mainDescription}
                withBackgroundColorInMainSection
                beforeHeaderContent={readOnly && (
                    <TopBanner variant="warning">
                        {strings.readOnlyWarningMessage}
                    </TopBanner>
                )}
                actions={
                    isEditable && fullEapFormAccess ? (
                        <>
                            <Link
                                to="accountMyFormsEap"
                                styleVariant="outline"
                                colorVariant="primary"
                            >
                                {strings.cancelButton}
                            </Link>
                            <Button
                                name={undefined}
                                onClick={handleSave}
                            >
                                {strings.saveButton}
                            </Button>
                            {canShare && (
                                <IconButton
                                    name={undefined}
                                    onClick={setShowShareModalTrue}
                                    disabled={isNotDefined(eapId) || readOnly}
                                    title={strings.formShareButtonAriaLabel}
                                    ariaLabel={strings.formShareButtonAriaLabel}
                                >
                                    <ShareFillIcon />
                                </IconButton>
                            )}
                        </>
                    ) : (
                        <Link
                            to="accountMyFormsEap"
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.backToAccount}
                        </Link>
                    )
                }
                info={fullEapFormAccess && (
                    <TabList elementRef={tabListRef}>
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
                {!fullEapFormAccess ? (
                    <Message
                        variant="error"
                        title={strings.formLoadErrorTitle}
                        description={fullEapResponseError?.value.messageForNotification}
                        actions={strings.formLoadErrorHelpText}
                    />
                ) : (
                    <>
                        <TabPanel name="overview">
                            <Overview
                                value={value}
                                setFieldValue={setFieldValue}
                                error={formError}
                                disabled={disabled}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                eapRegistrationDetail={eapDetailResponse}
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
                        <TabPanel name="triggerModel">
                            <TriggerModel
                                value={value}
                                setFieldValue={setFieldValue}
                                error={formError}
                                disabled={disabled}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                eapRegistrationDetail={eapDetailResponse}
                                readOnly={readOnly}
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
                                readOnly={readOnly}
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
                                readOnly={readOnly}
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
                                readOnly={readOnly}
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
                                readOnly={readOnly}
                            />
                        </TabPanel>
                        <TabPanel name="financeLogistics">
                            <FinanceLogistics
                                value={value}
                                setFieldValue={setFieldValue}
                                setValue={setValue}
                                error={formError}
                                disabled={disabled}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                readOnly={readOnly}
                                isRevision={isRevision}
                            />
                        </TabPanel>
                        <InlineLayout
                            after={isEditable && fullEapFormAccess
                                    && (
                                        <Button name={undefined} onClick={handleSave}>
                                            {strings.saveButton}
                                        </Button>
                                    )}
                        >
                            <ListView withCenteredContents>
                                <Button
                                    name={prevStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(prevStep)}
                                >
                                    {strings.backButton}
                                </Button>
                                {isDefined(nextStep) ? (
                                    <Button
                                        name={nextStep ?? activeTab}
                                        onClick={handleTabChange}
                                    >
                                        {strings.nextButton}
                                    </Button>
                                ) : (
                                    <Button
                                        name={undefined}
                                        onClick={handleRequestForApprovalButtonClick}
                                        disabled={readOnly}
                                        styleVariant="filled"
                                    >
                                        {strings.submitButtonLabel}
                                    </Button>
                                )}
                            </ListView>
                        </InlineLayout>
                        {shouldSubmit && (
                            <Modal
                                heading={strings.submitConfirmHeading}
                                onClose={handleRequestForApprovalCancel}
                                pending={createFullEapPending || updateFullFormPending}
                                pendingMessage={strings.savingPendingMessage}
                                footerActions={(
                                    <Button
                                        name={undefined}
                                        disabled={hasFormErrors}
                                        onClick={handleSubmitForApprovalConfirm}
                                    >
                                        {strings.submitConfirmButtonLabel}
                                    </Button>
                                )}
                            >
                                <ListView layout="block" spacing="sm">
                                    <div>{strings.submitConfirmMessage}</div>
                                    {hasFormErrors && (
                                        <Alert
                                            name="form-error-warning"
                                            title={strings.submitFormErrorMessage}
                                            type="warning"
                                            withLightBackground
                                            withoutShadow
                                        />
                                    )}
                                </ListView>
                            </Modal>
                        )}
                        {showShareModal && isDefined(eapId) && (
                            <EapShareModal
                                onCancel={setShowShareModalFalse}
                                onSuccess={setShowShareModalFalse}
                                eapId={Number(eapId)}
                            />
                        )}
                        {isDefined(latestFullEapId) && showObsoletePayloadModal && (
                            <EapObsoleteResolutionModal
                                fullEapId={latestFullEapId}
                                onOverwriteButtonClick={
                                    handleObsoletePayloadOverwriteButtonClick
                                }
                                onCancelButtonClick={setShowObsoletePayloadModal}
                            />
                        )}
                    </>
                )}
            </Page>
        </Tabs>
    );
}

Component.displayName = 'EapFullForm';
