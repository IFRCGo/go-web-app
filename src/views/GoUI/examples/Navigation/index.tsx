import { useState } from 'react';

import Tabs from '#components/Tabs';
import Tab from '#components/Tabs/Tab';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';

import styles from './styles.module.css';

function Navigation() {
    const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');

    return (
        <div className={styles.navigationCollection}>
            <div className={styles.navigationContainer}>
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="primary"
                >
                    <TabList>
                        <Tab name="tab1">
                            Tab 1
                        </Tab>
                        <Tab name="tab2">
                            Tab 2
                        </Tab>
                    </TabList>
                    <TabPanel name="tab1">
                        This is tab for Tab 1
                    </TabPanel>
                    <TabPanel name="tab2">
                        This is tab for Tab 2
                    </TabPanel>
                </Tabs>
            </div>
            <div className={styles.navigationContainer}>
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="secondary"
                >
                    <TabList>
                        <Tab name="tab1">
                            Tab 1
                        </Tab>
                        <Tab name="tab2">
                            Tab 2
                        </Tab>
                    </TabList>
                    <TabPanel name="tab1">
                        This is tab for Tab 1
                    </TabPanel>
                    <TabPanel name="tab2">
                        This is tab for Tab 2
                    </TabPanel>
                </Tabs>
            </div>

            <div className={styles.navigationContainer}>
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="step"
                >
                    <TabList>
                        <Tab name="tab1" errored>
                            Tab 1
                        </Tab>
                        <Tab name="tab2">
                            Tab 2
                        </Tab>
                    </TabList>
                    <TabPanel name="tab1">
                        This is tab for Tab 1
                    </TabPanel>
                    <TabPanel name="tab2">
                        This is tab for Tab 2
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}

export default Navigation;
