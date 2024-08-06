import {
    useCallback,
    useState,
} from 'react';
import {
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import Page from '#components/Page';
import useFilterState from '#hooks/useFilterState';

import ByComponent from './ByComponent';
import BySector from './BySector';
import Filters, {
    type FilterValue,
    type SelectedFilter,
} from './Filters';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<'bySector' | 'byComponent'>('bySector');

    const {
        rawFilter,
        setFilterField,
    } = useFilterState<FilterValue>({
        filter: {},
    });

    const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>();
    const handleFilterChange = useCallback((...args: EntriesAsList<FilterValue>) => {
        const [, key, option] = args;

        setSelectedFilter((oldFilterValue) => {
            const newFilterValue = { ...oldFilterValue };

            if (isNotDefined(option)) {
                delete newFilterValue[key];
            } else {
                newFilterValue[key] = option as string;
            }

            return newFilterValue;
        });
        setFilterField(...args);
    }, [setFilterField]);

    const selectedFilterOptions = mapToList(selectedFilter, (label, key) => ({ key, label }));

    return (
        <Page
            heading={strings.operationalLearningsHeading}
            description={strings.operationalLearningsHeadingDescription}
        >
            <Container
                withGridViewInFilter
                filters={(
                    <Filters
                        value={rawFilter}
                        onChange={handleFilterChange}
                    />
                )}
                footerIcons={(selectedFilterOptions?.map((option) => (
                    <div key={option.key}>
                        {option.label}
                    </div>
                )))}
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
