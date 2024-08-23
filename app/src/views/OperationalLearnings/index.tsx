import {
    useCallback,
    useState,
} from 'react';
import {
    Chip,
    ChipProps,
    Container,
    List,
    RawList,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import Page from '#components/Page';
import { type components } from '#generated/types';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import Filters, {
    type FilterLabel,
    type FilterValue,
} from './Filters';
import KeyInsights from './KeyInsights';
import Summary, { type Props as SummaryProps } from './Summary';

import i18n from './i18n.json';

type SummaryStatusEnum = components<'read'>['schemas']['OpsLearningSummaryStatusEnum'];

const SUMMARY_STATUS_SUCCESS = 3 satisfies SummaryStatusEnum;
const SUMMARY_NO_EXTRACT_AVAILBLE = 4 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_FAILED = 5 satisfies SummaryStatusEnum;

type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/summary/'>;
type OpsLearningSectorSummary = OpsLearningSummaryResponse['sectors'][number];
type OpsLearningComponentSummary = OpsLearningSummaryResponse['components'][number];

interface FilterValueOption {
    key: keyof FilterValue;
    label: string;
}

function filterValueOptionKeySelector(option: FilterValueOption) {
    return option.key;
}

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

    const [selectedFilterLabel, setSelectedFilterLabel] = useState<FilterLabel>();

    const handleFilterChange = useCallback((...args: EntriesAsList<FilterValue>) => {
        const [, key, option] = args;

        setSelectedFilterLabel((oldFilterLabel) => {
            const newFilterLabel = { ...oldFilterLabel };

            if (isNotDefined(option)) {
                delete newFilterLabel[key];
            } else {
                newFilterLabel[key] = option as string;
            }

            return newFilterLabel;
        });
        setFilterField(...args);
    }, [setFilterField]);

    const handleFilterRemove = useCallback((filterKey: keyof FilterValue) => {
        setFilterField(undefined, filterKey);
        setSelectedFilterLabel((oldFilterLabel) => {
            const newFilterLabel = { ...oldFilterLabel };
            delete newFilterLabel[filterKey];
            return newFilterLabel;
        });
    }, [setFilterField]);

    const selectedFilterOptions = mapToList(
        selectedFilterLabel,
        (label, key) => ({ key, label } as { key: keyof FilterValue, label: string }),
    );

    const {
        pending: opsLearningSummaryPending,
        response: opsLearningSummaryResponse,
        error: opsLearningSummaryError,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        query: {
            // appeal_code__region: isDefined(rawFilter.region) ? rawFilter.region : undefined,
            appeal_code__country: isDefined(rawFilter.country) ? rawFilter.country : undefined,
            appeal_code__dtype: isDefined(rawFilter.disasterType)
                ? rawFilter.disasterType : undefined,
            sector_validated: isDefined(rawFilter.sector) ? rawFilter.sector : undefined,
            per_component_validated: isDefined(rawFilter.component)
                ? rawFilter.component : undefined,
        },
        shouldPoll: (poll) => {
            if (poll?.errored
                || poll?.value?.status === SUMMARY_STATUS_FAILED
                || poll?.value?.status === SUMMARY_STATUS_SUCCESS
                || poll?.value.status === SUMMARY_NO_EXTRACT_AVAILBLE
            ) {
                return -1;
            }

            return 5000;
        },
        preserveResponse: true,
    });

    const sectorSummaryRendererParams = (
        summaryId: number,
        summary: OpsLearningSectorSummary,
    ): SummaryProps => ({
        id: summaryId,
        summaryType: 'sector',
        summaryTitle: summary.title,
        extractsCount: summary.extract_count,
        summaryContent: summary.content,
    });

    const componentSummaryRendererParams = (
        summaryId: number,
        summary: OpsLearningComponentSummary,
    ): SummaryProps => ({
        id: summaryId,
        summaryType: 'component',
        summaryTitle: summary.title,
        extractsCount: summary.extract_count,
        summaryContent: summary.content,
    });

    const chipRendererParams = useCallback((
        key: keyof FilterValue,
        option: FilterValueOption,
    ): ChipProps<keyof FilterValue> => ({
        label: option.label,
        name: key,
        variant: 'primary' as const,
        onDelete: handleFilterRemove,
    }), [handleFilterRemove]);

    const filtersSelected = isDefined(rawFilter.country)
        || isDefined(rawFilter.disasterType)
        || isDefined(rawFilter.sector)
        || isDefined(rawFilter.component);

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
                footerIcons={(
                    <RawList<FilterValueOption, keyof FilterValue, ChipProps<keyof FilterValue>>
                        data={selectedFilterOptions}
                        renderer={Chip}
                        keySelector={filterValueOptionKeySelector}
                        rendererParams={chipRendererParams}
                    />
                )}
            />
            {showKeyInsights && filtersSelected && (
                <KeyInsights
                    opsLearningSummaryResponse={opsLearningSummaryResponse}
                />
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
                        renderer={Summary}
                        keySelector={numericIdSelector}
                        rendererParams={sectorSummaryRendererParams}
                        emptyMessage="No summary"
                        errored={isDefined(opsLearningSummaryError)}
                        pending={opsLearningSummaryPending}
                        filtered={false}
                    />
                </TabPanel>
                <TabPanel
                    name="byComponent"
                >
                    <List
                        data={opsLearningSummaryResponse?.components}
                        renderer={Summary}
                        keySelector={numericIdSelector}
                        rendererParams={componentSummaryRendererParams}
                        emptyMessage="No summary"
                        errored={isDefined(opsLearningSummaryError)}
                        pending={opsLearningSummaryPending}
                        filtered={false}
                    />
                </TabPanel>
            </Tabs>
        </Page>
    );
}

Component.displayName = 'OperationalLearnings';
