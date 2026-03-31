import { useState } from 'react';
import {
    Outlet,
    useLocation,
} from 'react-router-dom';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';

import Page from '#components/Page';
import useRouting from '#hooks/useRouting';
import ProBonoServicesTable from '#views/SparkProBonoServices';
import WarehouseStocksTable from '#views/SparkStockInventory/WarehouseStocksTable';

import styles from './styles.module.css';

type SparkTabKey =
    | 'warehouse-stocks'
    | 'framework-agreements'
    | 'pro-bono-services'
    | 'custom-regulations';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const location = useLocation();
    const { navigate } = useRouting();

    const [localActiveTab, setLocalActiveTab] = useState<SparkTabKey>('warehouse-stocks');

    const isFrameworkAgreementsRoute = location.pathname.startsWith('/spark/framework-agreements');
    const isCustomRegulationsRoute = location.pathname.startsWith('/spark/custom-regulations');
    let activeTab: SparkTabKey = localActiveTab;
    if (isFrameworkAgreementsRoute) {
        activeTab = 'framework-agreements';
    } else if (isCustomRegulationsRoute) {
        activeTab = 'custom-regulations';
    }

    const handleTabChange = (nextTab: SparkTabKey) => {
        if (nextTab === 'framework-agreements') {
            navigate('sparkFrameworkAgreements');
            return;
        }
        if (nextTab === 'custom-regulations') {
            navigate('sparkCustomRegulations');
            return;
        }

        navigate('globalLogistics');
        setLocalActiveTab(nextTab);
    };

    return (
        <Page
            title="SPARK"
            heading="SPARK"
            description={(
                'Centralised Platform for Enhancing Emergency Supply Chain '
                + 'and Decision-Making'
            )}
        >
            <div className={styles.tabsContainer}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    styleVariant="tab"
                >
                    <TabList>
                        <Tab name="warehouse-stocks">Stock Inventory</Tab>
                        <Tab name="framework-agreements">Framework Agreements</Tab>
                        <Tab name="pro-bono-services">Pro Bono Services</Tab>
                        <Tab name="custom-regulations">Custom Regulations</Tab>
                    </TabList>

                    <TabPanel name="warehouse-stocks">
                        <div className={styles.tabContent}>
                            <WarehouseStocksTable />
                        </div>
                    </TabPanel>

                    <TabPanel name="framework-agreements">
                        <div className={styles.tabContent}>
                            <Outlet />
                        </div>
                    </TabPanel>

                    <TabPanel name="pro-bono-services">
                        <div className={styles.tabContent}>
                            <ProBonoServicesTable />
                        </div>
                    </TabPanel>

                    <TabPanel name="custom-regulations">
                        <div className={styles.tabContent}>
                            <Outlet />
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </Page>
    );
}

Component.displayName = 'Spark';
