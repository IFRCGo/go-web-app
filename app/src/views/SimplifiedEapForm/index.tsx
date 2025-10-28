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
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { hasSomeDefinedValue } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    useForm,
} from '@togglecorp/toggle-form';

import Link from '#components/Link';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    type GoApiBody,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import { checkTabErrors } from './common';
import DeliveryAndBudget from './DeliveryAndBudget';
import EarlyAction from './EarlyAction';
import EnablingApproches from './EnablingApproaches';
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
        onSuccess: (simplifiedEapResponse) => {
            // FIXME: remove unnecessary variables
            // FIXME: add setFileIdToUrlMap
            // FIXME: inject client ID
            const {
                admin2_details,
                budget_file_details,
                ...otherValues
            } = simplifiedEapResponse;

            // FIXME: typings
            setValue(otherValues);
        },
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

            setError(transformObjectError(formErrors, () => undefined));

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
                () => undefined,
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
                admin2: [27485],
                cover_image_file: hasSomeDefinedValue(validatedFormValue.cover_image_file)
                    ? validatedFormValue.cover_image_file
                    : undefined,
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
                    <TabList className={styles.tabList}>
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
                    <EnablingApproches
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
                <div className={styles.actions}>
                    <div className={styles.pageActions}>
                        <Button
                            name={prevStep ?? activeTab}
                            onClick={handleTabChange}
                            disabled={isNotDefined(prevStep)}
                            colorVariant="secondary"
                            styleVariant="outline"
                        >
                            {strings.simplifiedBackButton}
                        </Button>
                        {isDefined(nextStep) ? (
                            <Button
                                name={nextStep ?? activeTab}
                                onClick={handleTabChange}
                                colorVariant="secondary"
                                styleVariant="outline"
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
                    </div>
                </div>
            </Page>
        </Tabs>
    );
}
