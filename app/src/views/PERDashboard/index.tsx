import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import PageContainer from '#components/PageContainer';
import PageHeader from '#components/PageHeader';

import Tabs from '../Tabs';
import Tab from '../Tabs/Tab';
import TabList from '../Tabs/TabList';
import PERPerformanceDashboard from './PERPerformanceDashboard';
import PERSummaryDashboard from './PERSummaryDashboard';

import styles from './styles.module.css';

interface Props {
    className?: string;
    accessToken?: string;
}

function PERDashboard(props: Props) {
    const {
        className,
        accessToken,
    } = props;

    const [activeTab, setActiveTab] = useState<'summary' | 'performance'>('summary');

    return (
        <PageContainer className={_cs(styles.perDashboard, className)}>
            <PageHeader
                className={styles.headerx}
                heading="NS Preparedness and Response Capacity Strengthening (PER)"
                description={[
                    'The National Society Preparedness for Effective Response (PER) ',
                    'Approach is a structured and systematic way of interacting with ',
                    'the knowledge, capacity, systems, and processes a National Society ',
                    'uses to respond to an emergency, fulfilling its mandate to meet ',
                    'the needs of those most affected by disasters and crises with ',
                    'timely, relevant, and effective humanitarian assistance.',
                ].join('')}
            />
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <TabList>
                    <Tab name="summary">
                        Global Summary
                    </Tab>
                    <Tab name="performance">
                        Global Performance
                    </Tab>
                </TabList>
            </Tabs>
            <div className={styles.content}>
                {activeTab === 'summary' && (
                    <PERSummaryDashboard
                        className={className}
                        accessToken={accessToken}
                    />
                )}
                {activeTab === 'performance' && (
                    <PERPerformanceDashboard
                        className={className}
                        accessToken={accessToken}
                    />
                )}
            </div>
        </PageContainer>
    );
}

export default PERDashboard;
