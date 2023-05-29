import { useState } from 'react';
import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';

import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';

import i18n from './i18n.json';

type Tabs = 'account-info' | 'notifications' | 'per-form' | 'drefs' | '3w-forms';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [currentTab, setCurrentTab] = useState<Tabs>('3w-forms');

    return (
        <Page
            title={strings.accountTitle}
        >
            <Tabs
                onChange={setCurrentTab}
                value={currentTab}
                variant="primary"
            >
                <TabList>
                    <Tab name="account-page">
                        Account Information
                    </Tab>
                    <Tab name="notifications">
                        Notifications
                    </Tab>
                    <Tab name="per-forms">
                        PER Forms
                    </Tab>
                    <Tab name="drefs">
                        My DREF Applications
                    </Tab>
                    <Tab name="3w-forms">
                        3W Forms
                    </Tab>
                </TabList>
                <TabPanel name="account-page">
                    Account Information
                </TabPanel>
                <TabPanel name="notifications">
                    Notifications
                </TabPanel>
                <TabPanel name="per-forms">
                    PER Forms
                </TabPanel>
                <TabPanel name="drefs">
                    My DREF Applications
                </TabPanel>
                <TabPanel name="3w-forms">
                    3W Forms go here
                </TabPanel>
            </Tabs>
        </Page>
    );
}

Component.displayName = 'Account';
