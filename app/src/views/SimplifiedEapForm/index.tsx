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
import { useTranslation } from '@ifrc-go/ui/hooks';
import { injectClientId } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
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
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import { checkTabErrors } from './common';
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
import styles from './styles.module.css';

type EapSimplifiedRequestBody = GoApiBody<'/api/v2/simplified-eap/', 'POST'>;
type GetSimplifiedResponse = GoApiResponse<'/api/v2/simplified-eap/{id}/'>;

type TabKeys = 'overview' | 'riskAnalysis' | 'earlyAction' | 'plannedOperations' | 'enablingApproaches' | 'deliveryAndBudget';

function getNextStep(current: TabKeys, direction: 1 | -1) {
    if (direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            overview: 'riskAnalysis',
            riskAnalysis: 'earlyAction',
            earlyAction: 'plannedOperations',
            plannedOperations: 'enablingApproaches',
            enablingApproaches: 'deliveryAndBudget',
        };
        return mapping[current];
    }
    if (direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            deliveryAndBudget: 'enablingApproaches',
            enablingApproaches: 'plannedOperations',
            plannedOperations: 'earlyAction',
            earlyAction: 'riskAnalysis',
            riskAnalysis: 'overview',
        };
        return mapping[current];
    }
    return undefined;
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

    const handleSimplifiedLoad = useCallback((response: GetSimplifiedResponse) => {
        setFileIdToUrlMap((preMap) => {
            const newMap = {
                ...preMap,
            };

            const {
                budget_file_details,
                cover_image_file,
            } = response;

            if (
                budget_file_details
                && budget_file_details.id
                && budget_file_details.file
            ) {
                newMap[
                    budget_file_details.id
                ] = budget_file_details.file;
            }

            if (
                cover_image_file
                && cover_image_file.id
                && cover_image_file.file
            ) {
                newMap[cover_image_file.id] = cover_image_file.file;
            }
            return newMap;
        });
    }, []);

    const loadResponseToFormValue = useCallback((response: GetSimplifiedResponse) => {
        handleSimplifiedLoad(response);

        const {
            planned_operations,
            enable_approaches,
            cover_image_file,
            hazard_impact_images,
            selected_early_actions_images,
            risk_selected_protocols_images,
            ...otherValues
        } = removeNull(response);

        setValue({
            ...otherValues,

            cover_image_file: isDefined(cover_image_file)
                ? injectClientId(cover_image_file)
                : undefined,

            hazard_impact_images: hazard_impact_images?.map(injectClientId),
            selected_early_actions_images: selected_early_actions_images?.map(injectClientId),
            risk_selected_protocols_images: risk_selected_protocols_images?.map(injectClientId),

            planned_operations: planned_operations?.map((intervention) => ({
                ...injectClientId(intervention),
                early_action_activities: intervention.early_action_activities?.map(injectClientId),
                readiness_activities: intervention.readiness_activities?.map(injectClientId),
                prepositioning_activities: intervention.prepositioning_activities
                    ?.map(injectClientId),
            })),
            enable_approaches: enable_approaches?.map((approach) => ({
                ...injectClientId(approach),
                early_action_activities: approach.early_action_activities?.map(injectClientId),
                readiness_activities: approach.readiness_activities?.map(injectClientId),
                prepositioning_activities: approach.prepositioning_activities?.map(injectClientId),
            })),
        });
    }, [handleSimplifiedLoad, setValue]);

    const {
        pending: fetchingEap,
        response: eapDetailResponse,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
    });

    // FIXME: get the latest simplified instead of using 0
    const latestSimplifiedEapId = eapDetailResponse?.simplified_eap_details[0]?.id;

    // FIXME: handle errors
    useRequest({
        skip: isNotDefined(latestSimplifiedEapId),
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(latestSimplifiedEapId) ? ({
            id: latestSimplifiedEapId,
        }) : undefined,
        onSuccess: (simplifiedEapResponse) => loadResponseToFormValue(simplifiedEapResponse),
    });

    const {
        pending: eapSimplifiedPending,
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
                },
            } = err;

            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['cover_image_file', NUM]);
                    if (isDefined(match)) {
                        return value?.cover_image_file?.client_id;
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
                        return value?.planned_operations?.[poIndex!]?.client_id;
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
                        return value?.enable_approaches?.[eaIndex!]?.client_id;
                    }
                    return undefined;
                },
            ));

            alert.show(
                strings.eapSimplifiedFailure,
                { variant: 'danger' },
            );
        },
    });

    const {
        pending: updateSimplifiedFormPending,
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

            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['cover_image_file']);
                    if (isDefined(match)) {
                        return value?.cover_image_file?.client_id;
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
                        return value?.planned_operations?.[poIndex!]?.client_id;
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
                        return value?.enable_approaches
                            ?.[eaIndex!]?.client_id;
                    }
                    return undefined;
                },
            ));

            alert.show(
                strings.eapSimplifiedFailure,
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
            );
        },
    });

    const disabled = eapSimplifiedPending || fetchingEap || updateSimplifiedFormPending;

    const handleValidationSuccess = useCallback((validatedFormValue: PartialSimplifiedEapType) => {
        if (isNotDefined(latestSimplifiedEapId)) {
            createSimplifiedEap({
                ...validatedFormValue as EapSimplifiedRequestBody,
                eap_registration: Number(eapId),

                // FIXME: update admin2 input
                admin2: [27485],
            });
        } else {
            updateSimplifiedEap({
                ...validatedFormValue,
                id: latestSimplifiedEapId,
            } as EapSimplifiedRequestBody);
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
                className={styles.simplifiedEapForm}
                heading={strings.simplifiedEapHeading}
                description={strings.simplifiedEapDescription}
                actions={(
                    <Link
                        to="accountMyFormsEap"
                        styleVariant="outline"
                        colorVariant="primary"
                    >
                        {strings.simplifiedCancelButton}
                    </Link>
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
                            name="approaches"
                            step={5}
                            errored={checkTabErrors(formError, 'approaches')}
                        >
                            {strings.simplifiedEnablingApproaches}
                        </Tab>
                        <Tab
                            name="deliverBudget"
                            step={6}
                            errored={checkTabErrors(formError, 'deliverBudget')}
                        >
                            {strings.simplifiedDeliverAndBudget}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
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
                <TabPanel name="earlyAction">
                    <EarlyAction
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                        eapRegistrationDetail={eapDetailResponse}
                    />
                </TabPanel>
                <TabPanel name="plannedOperations">
                    <PlannedOperations
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                    />
                </TabPanel>
                <TabPanel name="approaches">
                    <EnablingApproaches
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                    />
                </TabPanel>
                <TabPanel name="deliverBudget">
                    <DeliveryAndBudget
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
                        >
                            {strings.simplifiedSaveButton}
                        </Button>
                    )}
                </ListView>
            </Page>
        </Tabs>
    );
}
