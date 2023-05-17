import React from 'react';

import Header from '#components/Header';
import Tabs from '#components/Tabs';
import Tab from '#components/Tabs/Tab';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';

import styles from './styles.module.scss';

function Navigation() {
  const [activeTab, setActiveTab] = React.useState<'tab1' | 'tab2'>('tab1');

  return (
    <div className={styles.navigationCollection}>
      <Header
        heading="NAVIGATION COLLECTION"
        headingSize="medium"
      />
      <Header
        heading="PRIMARY"
        headingSize="small"
      />
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
      <Header
        heading="SECONDARY"
        headingSize="small"
      />
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
      <Header
        heading="STEP"
        headingSize="small"
      />
      <div className={styles.navigationContainer}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="step"
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
    </div>
  );

}

export default Navigation;
