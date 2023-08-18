import { useState } from 'react';
import {
    bound,
    randomString,
} from '@togglecorp/fujs';
import {
    useForm,
    getErrorObject,
    PartialForm,
    analyzeErrors,
} from '@togglecorp/toggle-form';

import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import Button from '#components/Button';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';

import i18n from './i18n.json';
import schema, {
    type FormType,
} from './schema';
import ActionsTab from './ActionsTab';
import ContextTab from './ContextTab';
import FocalPointsTab from './FocalPointsTab';
import styles from './styles.module.css';

type TabKeys = 'context' | 'actions' | 'focal';
type TabNumbers = 1 | 2 | 3;

const tabStepMap: Record<TabKeys, TabNumbers> = {
    context: 1,
    actions: 2,
    focal: 3,
};

const tabByStepMap: Record<TabNumbers, TabKeys> = {
    1: 'context',
    2: 'actions',
    3: 'focal',
};

const minStep = 1;
const maxStep = 3;

function getNextStep(currentStep: TabKeys, minSteps: number, maxSteps: number) {
    const next = bound(tabStepMap[currentStep] + 1, minSteps, maxSteps) as TabNumbers;
    return tabByStepMap[next];
}

function getPreviousStep(currentStep: TabKeys, minSteps: number, maxSteps: number) {
    const prev = bound(tabStepMap[currentStep] - 1, minSteps, maxSteps) as TabNumbers;
    return tabByStepMap[prev];
}

type ActionWithoutSummary = Omit<NonNullable<FormType['actions_taken']>[number], 'summary'>;
const defaultActionsTaken: ActionWithoutSummary[] = [
    { client_id: randomString(), organization: 'NTLS', actions: [] },
    { client_id: randomString(), organization: 'PNS', actions: [] },
    { client_id: randomString(), organization: 'FDRN', actions: [] },
    { client_id: randomString(), organization: 'GOV', actions: [] },
];

const defaultFormValues: FormType = {
    country_district: [{
        client_id: randomString(),
    }],
    actions_taken: defaultActionsTaken,
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<TabKeys>('context');
    const {
        value,
        error,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValues });

    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});

    return (
        <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                className={styles.flashUpdateForm}
                title={strings.flashUpdateFormPageTitle}
                heading={strings.flashUpdateFormPageHeading}
                description={strings.flashUpdateFormPageDescription}
                mainSectionClassName={styles.content}
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="context"
                            step={1}
                            // errored={erroredTabs['context']}
                        >
                            {strings.flashUpdateTabContextLabel}
                        </Tab>
                        <Tab
                            name="actions"
                            step={2}
                            // errored={erroredTabs['action']}
                        >
                            {strings.flashUpdateTabActionLabel}
                        </Tab>
                        <Tab
                            name="focal"
                            step={3}
                            // errored={erroredTabs['focal']}
                        >
                            {strings.flashUpdateTabFocalLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
            >
                <TabPanel name="context">
                    <ContextTab
                        error={error}
                        onValueChange={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        value={value}
                    />
                </TabPanel>
                <TabPanel name="actions">
                    <ActionsTab
                        error={error}
                        onValueChange={setFieldValue}
                        value={value}
                    />
                </TabPanel>
                <TabPanel name="focal">
                    <FocalPointsTab
                        error={error}
                        onValueChange={setFieldValue}
                        value={value}
                    />
                </TabPanel>
                <div className={styles.pageActions}>
                    <Button
                        name={getPreviousStep(activeTab, minStep, maxStep)}
                        onClick={setActiveTab}
                        disabled={tabStepMap[activeTab] <= minStep}
                        variant="secondary"
                    >
                        {strings.flashUpdateBackButtonLabel}
                    </Button>
                    <Button
                        name={getNextStep(activeTab, minStep, maxStep)}
                        onClick={setActiveTab}
                        disabled={tabStepMap[activeTab] >= maxStep}
                        variant="secondary"
                    >
                        {strings.flashUpdateContinueButtonLabel}
                    </Button>
                </div>
            </Page>
        </Tabs>
    );
}

Component.displayName = 'FlashUpdateForm';
