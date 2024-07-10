import { useState } from 'react';
import {
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Page from '#components/Page';

import ByComponent from './ByComponent';
import BySector from './BySector';
import Filters from './Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<'bySector' | 'byComponent'>('bySector');

    return (
        <Page
            heading={strings.operationalLearningsHeading}
            description={strings.operationalLearningsHeadingDescription}
        >
            <Container
                filters={
                    <Filters />
                }
            />
            <Tabs
                onChange={setActiveTab}
                value={activeTab}
                variant="tertiary"
            >
                <Container
                    className={styles.operationalLearningsStyle}
                    headerDescription={(
                        <TabList>
                            <Tab name="bySector">{strings.bySectorTitle}</Tab>
                            <Tab name="byComponent">{strings.byComponentTitle}</Tab>
                        </TabList>
                    )}
                    actions={(
                        <div>
                            66 extracts
                        </div>
                    )}
                />
                <TabPanel name="bySector">
                    <BySector />
                </TabPanel>
                <TabPanel name="byComponent">
                    <ByComponent />
                </TabPanel>
            </Tabs>
        </Page>
    );
}

Component.displayName = 'OperationalLearnings';
