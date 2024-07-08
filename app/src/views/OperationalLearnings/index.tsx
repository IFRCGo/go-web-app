import { useState } from 'react';
import {
    Button,
    Container,
    Tab,
    TabList,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Page from '#components/Page';

import Filters from './Filters';

import i18n from './i18n.json';

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
                    headerDescription={(
                        <TabList>
                            <Tab name="bySector">{strings.bySectorTitle}</Tab>
                            <Tab name="byComponent">{strings.byComponentTitle}</Tab>
                        </TabList>
                    )}
                    actions={(
                        <Button
                            name={undefined}
                            variant="tertiary"
                        >
                            66 extracts
                        </Button>
                    )}
                />
            </Tabs>
        </Page>
    );
}

Component.displayName = 'OperationalLearnings';
