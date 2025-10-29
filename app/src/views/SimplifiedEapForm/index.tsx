import {
    type ElementRef,
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    Button,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    useForm,
} from '@togglecorp/toggle-form';

import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import Approaches from './Approaches';
import DeliverBudget from './DeliverBudget';
import EarlyAction from './EarlyAction';
import Overview from './Overview';
import PlannedOperations from './PlannedOperations';
import RiskAnalysis from './RiskAnalysis';
import { formSchema } from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EapSimplifiedRequestBody = GoApiBody<'/api/v2/simplified-eap/', 'POST'>;

type TabKeys = 'overview' | 'riskAnalysis' | 'earlyAction' | 'plannedOperations' | 'approaches' | 'deliverBudget';

function getNextStep(current: TabKeys, direction: 1 | -1) {
    if (direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            overview: 'riskAnalysis',
            riskAnalysis: 'earlyAction',
            earlyAction: 'plannedOperations',
            plannedOperations: 'approaches',
            approaches: 'deliverBudget',
        };
        return mapping[current];
    }
    if (direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            deliverBudget: 'approaches',
            approaches: 'plannedOperations',
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
    } = useForm(formSchema, { value: {} });

    const alert = useAlert();
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});

    const {
        pending: eapSimplifiedPending,
        trigger: eapSimplified,
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

    const disabled = eapSimplifiedPending;

    const simplifiedEapForm = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            (formValues) => {
                eapSimplified(formValues as EapSimplifiedRequestBody);
            },
        );
        handler();
    }, [
        setError,
        validate,
        eapSimplified,
    ]);

    const handleFormSubmit = createSubmitHandler(validate, setError, simplifiedEapForm);

    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const formContentRef = useRef<ElementRef<'div'>>(null);

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
            variant="step"
        >
            <Page
                className={styles.simplifiedEapForm}
                heading={strings.simplifiedEapHeading}
                description={strings.simplifiedEapDescription}
                actions={(
                    <>
                        <Button
                            name={undefined}
                            onClick={undefined}
                            variant="secondary"
                        >
                            {strings.simplifiedCancelButton}
                        </Button>
                        <Button
                            name={undefined}
                            onClick={undefined}
                        >
                            {strings.simplifiedSaveAndCloseButton}
                        </Button>
                    </>
                )}
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="overview"
                            step={1}
                        >
                            {strings.simplifiedEapOverview}
                        </Tab>
                        <Tab
                            name="riskAnalysis"
                            step={2}
                        >
                            {strings.simplifiedEapRiskAnalysis}
                        </Tab>
                        <Tab
                            name="earlyAction"
                            step={3}
                        >
                            {strings.simplifiedEapEarlyAction}
                        </Tab>
                        <Tab
                            name="plannedOperations"
                            step={4}
                        >
                            {strings.simplifiedPlannedOperations}
                        </Tab>
                        <Tab
                            name="approaches"
                            step={5}
                        >
                            {strings.simplifiedEnablingApproaches}
                        </Tab>
                        <Tab
                            name="deliverBudget"
                            step={6}
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
                    <Approaches />
                </TabPanel>
                <TabPanel name="deliverBudget">
                    <DeliverBudget
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                        disabled={disabled}
                    />
                </TabPanel>
                <div className={styles.actions}>
                    <div className={styles.pageActions}>
                        <Button
                            name={prevStep ?? activeTab}
                            onClick={handleTabChange}
                            disabled={isNotDefined(prevStep)}
                            variant="secondary"
                        >
                            {strings.simplifiedBackButton}
                        </Button>
                        {isDefined(nextStep) ? (
                            <Button
                                name={nextStep ?? activeTab}
                                onClick={handleTabChange}
                                variant="secondary"
                            >
                                {strings.simplifiedNextButton}
                            </Button>
                        ) : (
                            <Button
                                name={undefined}
                                onClick={handleFormSubmit}
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
