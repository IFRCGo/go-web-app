import {
    useCallback,
    useState,
} from 'react';
import { ArrowDownSmallFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    List,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    stringTitleSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import Link from '#components/Link';
import Page from '#components/Page';
import useFilterState from '#hooks/useFilterState';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import Filters, {
    type FilterValue,
    type SelectedFilter,
} from './Filters';

import i18n from './i18n.json';

type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/summary/'>;
type OpsLearningSummary = OpsLearningSummaryResponse['sectors'][number];

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

    const {
        pending: opsLearningSummaryPending,
        response: opsLearningSummaryResponse,
        error: opsLearningSummaryError,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        query: {
            // TODO: fix this filters in server and in client
            appeal_code__region: isDefined(rawFilter.region) ? rawFilter.region : undefined,
            appeal_code__country: isDefined(rawFilter.country) ? rawFilter.country : undefined,
            appeal_code__dtype: isDefined(rawFilter.disasterType)
                ? rawFilter.disasterType : undefined,
            sector_validated: isDefined(rawFilter.sector) ? [rawFilter.sector] : undefined,
            per_component_validated: isDefined(rawFilter.component)
                ? [rawFilter.component] : undefined,
        },
        preserveResponse: true,
    });

    const summaryRendererParams = (_: string, summary: OpsLearningSummary) => ({
        heading: summary.title,
        children: summary.content,
    });

    const handleExpandButtonClick = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const showKeyInsights = isDefined(opsLearningSummaryResponse?.insights1_title)
        && isDefined(opsLearningSummaryResponse.insights2_title)
        && isDefined(opsLearningSummaryResponse.insights3_title);

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
            {showKeyInsights && (
                <Container
                    heading={strings.opsLearningsSummariesHeading}
                    contentViewType="grid"
                    numPreferredGridContentColumns={3}
                    footerIcons={resolveToString(strings.keyInsightsDisclaimer, {
                        numOfExtractsUsed: 20,
                        totalNumberOfExtracts: 200,
                        appealsFromDate: 2023,
                        appealsToDate: 2024,
                    })}
                    footerActions={(
                        <>
                            <Link
                                href="/"
                                external
                            >
                                {strings.keyInsightsReportIssue}
                            </Link>
                            <Button
                                name={undefined}
                                variant="tertiary"
                                onClick={handleExpandButtonClick}
                                actions={<ArrowDownSmallFillIcon />}
                            >
                                {isExpanded ? strings.seeLess : strings.seeMore}
                            </Button>
                        </>
                    )}
                >
                    <Container
                        key={opsLearningSummaryResponse?.insights1_title}
                        pending={opsLearningSummaryPending}
                        heading={opsLearningSummaryResponse.insights1_title}
                        headerDescription={opsLearningSummaryResponse.insights1_content}
                        withInternalPadding
                    />
                    <Container
                        key={opsLearningSummaryResponse?.insights2_title}
                        pending={opsLearningSummaryPending}
                        heading={opsLearningSummaryResponse.insights2_title}
                        headerDescription={opsLearningSummaryResponse.insights2_content}
                        withInternalPadding
                    />
                    <Container
                        key={opsLearningSummaryResponse?.insights3_title}
                        pending={opsLearningSummaryPending}
                        heading={opsLearningSummaryResponse.insights3_title}
                        headerDescription={opsLearningSummaryResponse.insights3_content}
                        withInternalPadding
                    />
                </Container>
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
                />
                <TabPanel
                    name="bySector"
                >
                    <List
                        data={opsLearningSummaryResponse?.sectors}
                        renderer={Container}
                        keySelector={stringTitleSelector}
                        rendererParams={summaryRendererParams}
                        emptyMessage="No summary"
                        errored={isDefined(opsLearningSummaryError)}
                        pending={opsLearningSummaryPending}
                        filtered={false}
                        compact
                    />
                </TabPanel>
                <TabPanel
                    name="byComponent"
                >
                    <List
                        data={opsLearningSummaryResponse?.components}
                        renderer={Container}
                        keySelector={stringTitleSelector}
                        rendererParams={summaryRendererParams}
                        emptyMessage="No summary"
                        errored={isDefined(opsLearningSummaryError)}
                        pending={opsLearningSummaryPending}
                        filtered={false}
                        compact
                    />
                </TabPanel>
            </Tabs>
        </Page>
    );
}

Component.displayName = 'OperationalLearnings';
