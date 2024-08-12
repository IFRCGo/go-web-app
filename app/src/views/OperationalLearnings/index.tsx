import {
    useCallback,
    useState,
} from 'react';
import {
    ArrowDownSmallFillIcon,
    CopyLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import Link from '#components/Link';
import Page from '#components/Page';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';

import ByComponent from './ByComponent';
import BySector from './BySector';
import Filters, {
    type FilterValue,
    type SelectedFilter,
} from './Filters';
import ViewAllExtractModal from './ViewAllExtractModal';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<'bySector' | 'byComponent'>('bySector');
    const [isExpanded, setIsExpanded] = useState(false);
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
    const isSpecificFilterSelected = () => {
        if (!selectedFilter) {
            return false;
        }
        const {
            country, disasterType, sector, component,
        } = selectedFilter;
        return !!country || !!disasterType || !!sector || !!component;
    };
    const {
        pending: insightsPending,
        response: insightsResponse,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        preserveResponse: true,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

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
            {isSpecificFilterSelected() && (
                <>
                    <Container
                        className={styles.keyInsightsContainer}
                        heading={strings.opsLearningsSummariesHeading}
                        contentViewType="grid"
                        numPreferredGridContentColumns={3}
                        withInternalPadding
                        footerIcons={(
                            <>
                                <div className={styles.disclaimer}>
                                    {strings.keyInsightsDisclaimer}
                                </div>
                                <Link
                                    href="/"
                                    external
                                >
                                    {strings.keyInsightsReportIssue}
                                </Link>
                            </>
                        )}
                        footerActions={(
                            <Button
                                name={undefined}
                                variant="tertiary"
                                onClick={handleExpand}
                            >
                                {isExpanded ? 'See Less' : 'See More'}
                                <ArrowDownSmallFillIcon />
                            </Button>
                        )}
                    >
                        <Container
                            className={styles.keyInsights}
                            key={insightsResponse?.id}
                            pending={insightsPending}
                            heading={insightsResponse?.insights1_title}
                            headerDescription={insightsResponse?.insights1_content}
                            withInternalPadding
                        />
                        <Container
                            className={styles.keyInsights}
                            key={insightsResponse?.id}
                            pending={insightsPending}
                            heading={insightsResponse?.insights2_title}
                            headerDescription={insightsResponse?.insights2_content}
                            withInternalPadding
                        />
                        <Container
                            className={styles.keyInsights}
                            key={insightsResponse?.id}
                            pending={insightsPending}
                            heading={insightsResponse?.insights3_title}
                            headerDescription={insightsResponse?.insights3_content}
                            withInternalPadding
                        />
                    </Container>
                    {isExpanded && (
                        <Container
                            className={styles.sourceContainer}
                            withInternalPadding
                            footerIcons={(
                                <>
                                    <Button
                                        name={undefined}
                                        variant="secondary"
                                        onClick={handleOpenModal}
                                    >
                                        <CopyLineIcon />
                                        {strings.viewAllExtract}
                                    </Button>
                                    {isModalOpen && (
                                        <ViewAllExtractModal onClose={handleCloseModal} />
                                    )}
                                </>
                            )}
                        />
                    )}
                </>
            )}
            <Tabs
                onChange={setActiveTab}
                value={activeTab}
                variant="tertiary"
            >
                <Container
                    heading={(
                        <TabList>
                            <Tab name="bySector">{strings.bySectorTitle}</Tab>
                            <Tab name="byComponent">{strings.byComponentTitle}</Tab>
                        </TabList>
                    )}
                    actions={(
                        <div>
                            {resolveToString(
                                strings.bySummariesExtracts,
                                { count: insightsResponse?.components.length },
                            )}
                        </div>
                    )}
                />
                <TabPanel
                    name="bySector"
                >
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
