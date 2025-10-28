import { useState } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Page from '#components/Page';

import Approaches from './Approaches';
import DeliverBudget from './DeliverBudget';
import EarlyAction from './EarlyAction';
import Overview from './Overview';
import PlannedOperations from './PlannedOperations';
import RiskAnalysis from './RiskAnalysis';

import i18n from './i18n.json';

type TabKeys = 'overview' | 'riskAnalysis' | 'earlyAction' | 'plannedOperations' | 'approaches' | 'deliverBudget';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<TabKeys>('overview');

    return (
        <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                heading={strings.simplifiedEapHeading}
                description={strings.simplifiedEapDescription}
                info={(
                    <TabList>
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
                            name="operation"
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
            >
                <TabPanel name="overview">
                    <Overview />
                </TabPanel>
                <TabPanel name="riskAnalysis">
                    <RiskAnalysis />
                </TabPanel>
                <TabPanel name="earlyAction">
                    <EarlyAction />
                </TabPanel>
                <TabPanel name="plannedOperations">
                    <PlannedOperations />
                </TabPanel>
                <TabPanel name="approaches">
                    <Approaches />
                </TabPanel>
                <TabPanel name="deliverBudget">
                    <DeliverBudget />
                </TabPanel>
            </Page>
        </Tabs>
    );
}
