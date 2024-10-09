import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Chip,
    Container,
    DismissableListOutput,
    DismissableMultiListOutput,
    DismissableTextOutput,
    List,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    hasSomeDefinedValue,
    numericIdSelector,
    resolveToString,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
    sum,
} from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import { type RegionOption } from '#components/domain/RegionSelectInput';
import Page from '#components/Page';
import { type components } from '#generated/types';
import useCountry, { Country } from '#hooks/domain/useCountry';
import useDisasterTypes, { DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import usePerComponent, { type PerComponent } from '#hooks/domain/usePerComponent';
import useSecondarySector, { type SecondarySector } from '#hooks/domain/useSecondarySector';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { getFormattedComponentName } from '#utils/domain/per';
import {
    type GoApiResponse,
    GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import Filters, { type FilterValue } from './Filters';
import KeyInsights from './KeyInsights';
import Summary, { type Props as SummaryProps } from './Summary';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SummaryStatusEnum = components<'read'>['schemas']['OpsLearningSummaryStatusEnum'];

const SUMMARY_STATUS_PENDING = 1 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_STARTED = 2 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_SUCCESS = 3 satisfies SummaryStatusEnum;
const SUMMARY_NO_EXTRACT_AVAILABLE = 4 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_FAILED = 5 satisfies SummaryStatusEnum;

type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/summary/'>;
type OpsLearningSectorSummary = OpsLearningSummaryResponse['sectors'][number];
type OpsLearningComponentSummary = OpsLearningSummaryResponse['components'][number];

type OpsLearningQuery = GoApiUrlQuery<'/api/v2/ops-learning/'>;
type QueryType = Pick<
    OpsLearningQuery,
    | 'appeal_code__region'
    | 'appeal_code__country__in'
    | 'appeal_code__dtype__in'
    | 'appeal_code__start_date__gte'
    | 'appeal_code__start_date__lte'
    | 'sector_validated__in'
    | 'per_component_validated__in'
    | 'search_extracts'
>;

const regionKeySelector = (region: RegionOption) => region.key;
const countryKeySelector = (country: Country) => country.id;
const sectorKeySelector = (d: SecondarySector) => d.key;
const sectorLabelSelector = (d: SecondarySector) => d.label;
const perComponentKeySelector = (option: PerComponent) => option.id;
const disasterTypeKeySelector = (type: DisasterType) => type.id;
const disasterTypeLabelSelector = (type: DisasterType) => type.name ?? '?';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<'sector' | 'component'>('sector');

    const {
        rawFilter,
        filter,
        filtered,
        setFilterField,
        resetFilter,
    } = useFilterState<FilterValue>({
        debounceTime: 300,
        filter: {},
    });

    const onFilterChange = useCallback((...args: EntriesAsList<FilterValue>) => {
        setFilterField(...args);
    }, [setFilterField]);

    const alert = useAlert();

    const { api_region_name: regionList } = useGlobalEnums();
    const countryList = useCountry({ region: filter.region });
    const disasterTypeOptions = useDisasterTypes();
    const secondarySectorOptions = useSecondarySector();
    const perComponentOptions = usePerComponent();
    const [query, setQuery] = useState<QueryType>();
    const [filterPristine, setFilterPristine] = useState(true);

    const {
        pending: opsLearningSummaryPending,
        response: opsLearningSummaryResponse,
        error: opsLearningSummaryError,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        query,
        shouldPoll: (poll) => {
            const { errored, value } = poll;

            const stopPolling = errored
                || value?.status === SUMMARY_STATUS_FAILED
                || value?.status === SUMMARY_STATUS_SUCCESS
                || value?.status === SUMMARY_NO_EXTRACT_AVAILABLE;

            if (stopPolling) {
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
        extractsCount: summary.extracts_count,
        summaryContent: summary.content,
    });

    const componentSummaryRendererParams = (
        summaryId: number,
        summary: OpsLearningComponentSummary,
    ): SummaryProps => ({
        id: summaryId,
        summaryType: 'component',
        summaryTitle: summary.title,
        extractsCount: summary.extracts_count,
        summaryContent: summary.content,
    });

    const showKeyInsights = !opsLearningSummaryPending
        && isDefined(opsLearningSummaryResponse)
        && (
            isDefined(opsLearningSummaryResponse?.insights1_title)
            || isDefined(opsLearningSummaryResponse?.insights2_title)
            || isDefined(opsLearningSummaryResponse?.insights3_title)
        );

    const pendingMessage = opsLearningSummaryPending
        || (opsLearningSummaryResponse?.status === SUMMARY_STATUS_PENDING)
        ? strings.pendingMessage : strings.startedMessage;

    const extractsCount = useMemo(() => {
        if (activeTab === 'sector') {
            return sum(
                opsLearningSummaryResponse?.sectors.map((summary) => summary.extracts_count)
                ?? [],
            );
        }
        return sum(
            opsLearningSummaryResponse?.components.map((summary) => summary.extracts_count)
            ?? [],
        );
    }, [opsLearningSummaryResponse?.sectors, opsLearningSummaryResponse?.components, activeTab]);

    const {
        pending: opsLearningPending,
        response: opsLearningResponse,
    } = useRequest({
        url: '/api/v2/ops-learning/',
        query: {
            ...query,
            format: 'json',
            is_validated: true,
        },
        preserveResponse: true,
    });

    const [
        pendingExport,,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        disableProgress: true,
        onFailure: () => {
            alert.show(
                strings.failedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, 'operational-learning.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!opsLearningResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/ops-learning/',
            opsLearningResponse?.count,
            {
                ...query,
                format: 'json',
                is_validated: true,
            },
        );
    }, [
        triggerExportStart,
        opsLearningResponse?.count,
        query,
    ]);

    const handleApplyFilters = useCallback(() => {
        const newQuery = {
            appeal_code__region: isDefined(filter.region) ? filter.region : undefined,
            appeal_code__country__in: isDefined(filter.countries) ? filter.countries : undefined,
            appeal_code__dtype__in: isDefined(filter.disasterTypes)
                ? filter.disasterTypes : undefined,
            appeal_code__start_date__gte: isDefined(filter.appealStartDateAfter)
                ? filter.appealStartDateAfter : undefined,
            appeal_code__start_date__lte: isDefined(filter.appealStartDateBefore)
                ? filter.appealStartDateBefore : undefined,
            sector_validated__in: isDefined(filter.secondarySectors)
                ? filter.secondarySectors : undefined,
            per_component_validated__in: isDefined(filter.perComponents)
                ? filter.perComponents : undefined,
            search_extracts: isTruthyString(filter.appealSearchText)
                ? (filter.appealSearchText) : undefined,
        };

        setFilterPristine(true);
        setQuery(newQuery);
    }, [filter]);

    const handleResetFilters = useCallback(() => {
        resetFilter();
        setFilterPristine(true);
        setQuery(undefined);
    }, [resetFilter]);

    return (
        <Page
            heading={strings.operationalLearningHeading}
            description={strings.operationalLearningHeadingDescription}
            mainSectionClassName={styles.mainSection}
        >
            <Container
                footerClassName={styles.footer}
                footerContentClassName={styles.footerContent}
                contentViewType="grid"
                filters={(
                    <Filters
                        value={rawFilter}
                        onChange={onFilterChange}
                        disasterTypeOptions={disasterTypeOptions}
                        secondarySectorOptions={secondarySectorOptions}
                        perComponentOptions={perComponentOptions}
                    />
                )}
                footerContent={(
                    <>
                        <div className={styles.filterChips}>
                            {isDefined(filter) && hasSomeDefinedValue(filter) && (
                                <TextOutput
                                    className={styles.selectedFilters}
                                    valueClassName={styles.options}
                                    withoutLabelColon
                                    strongLabel
                                    label={strings.selectedFilters}
                                    value={(
                                        <>
                                            <DismissableListOutput
                                                name="region"
                                                value={filter.region}
                                                onDismiss={onFilterChange}
                                                options={regionList}
                                                labelSelector={stringValueSelector}
                                                keySelector={regionKeySelector}
                                            />
                                            <DismissableMultiListOutput
                                                name="countries"
                                                onDismiss={onFilterChange}
                                                value={filter.countries}
                                                options={countryList}
                                                labelSelector={stringNameSelector}
                                                keySelector={countryKeySelector}
                                            />
                                            <DismissableMultiListOutput
                                                name="disasterTypes"
                                                onDismiss={onFilterChange}
                                                value={filter.disasterTypes}
                                                options={disasterTypeOptions}
                                                labelSelector={disasterTypeLabelSelector}
                                                keySelector={disasterTypeKeySelector}
                                            />
                                            <DismissableMultiListOutput
                                                name="secondarySectors"
                                                onDismiss={onFilterChange}
                                                value={filter.secondarySectors}
                                                options={secondarySectorOptions}
                                                labelSelector={sectorLabelSelector}
                                                keySelector={sectorKeySelector}
                                            />
                                            <DismissableMultiListOutput
                                                name="perComponents"
                                                onDismiss={onFilterChange}
                                                value={filter.perComponents}
                                                options={perComponentOptions}
                                                labelSelector={getFormattedComponentName}
                                                keySelector={perComponentKeySelector}
                                            />
                                            <DismissableTextOutput
                                                name="appealStartDateAfter"
                                                value={filter.appealStartDateAfter}
                                                onDismiss={onFilterChange}
                                            />
                                            <DismissableTextOutput
                                                name="appealStartDateBefore"
                                                value={filter.appealStartDateBefore}
                                                onDismiss={onFilterChange}
                                            />
                                            <DismissableTextOutput
                                                name="appealSearchText"
                                                value={filter.appealSearchText}
                                                onDismiss={onFilterChange}
                                            />
                                        </>
                                    )}
                                />
                            )}
                        </div>
                        <div className={styles.actionButtons}>
                            <Button
                                name={undefined}
                                onClick={handleResetFilters}
                                disabled={!filtered}
                                variant="secondary"
                            >
                                {strings.clearFilters}
                            </Button>
                            <Button
                                name="apply"
                                onClick={handleApplyFilters}
                                disabled={filterPristine}
                                variant="primary"
                            >
                                {strings.applyFilters}
                            </Button>
                            <ExportButton
                                onClick={handleExportClick}
                                pendingExport={pendingExport}
                                totalCount={opsLearningResponse?.count}
                                disabled={(
                                    opsLearningSummaryResponse?.status !== SUMMARY_STATUS_SUCCESS
                                    || opsLearningPending
                                )}
                            />
                        </div>
                    </>
                )}
            />
            {showKeyInsights && (
                <KeyInsights
                    opsLearningSummaryResponse={opsLearningSummaryResponse}
                />
            )}
            <Container
                pending={opsLearningSummaryPending
                    || opsLearningSummaryResponse?.status === SUMMARY_STATUS_PENDING
                    || opsLearningSummaryResponse?.status === SUMMARY_STATUS_STARTED}
                pendingMessage={pendingMessage}
                errored={isDefined(opsLearningSummaryError)
                    || opsLearningSummaryResponse?.status === SUMMARY_STATUS_FAILED}
                errorMessage={strings.errorMessage}
                filtered={filtered}
                empty={isDefined(opsLearningSummaryResponse) && ((
                    opsLearningSummaryResponse?.components.length < 1
                    && opsLearningSummaryResponse?.sectors.length < 1
                ) || opsLearningSummaryResponse?.status === SUMMARY_NO_EXTRACT_AVAILABLE)}
                emptyMessage={strings.emptyMessage}
                filteredEmptyMessage={strings.filteredEmptyMessage}
            >
                <Tabs
                    onChange={setActiveTab}
                    value={activeTab}
                    variant="tertiary"
                >
                    <Container
                        heading={(
                            <TabList>
                                <Tab name="sector">{strings.bySectorTitle}</Tab>
                                <Tab name="component">{strings.byComponentTitle}</Tab>
                            </TabList>
                        )}
                        headingContainerClassName={styles.summaryHeading}
                        headingDescription={extractsCount > 0 && (
                            <Chip
                                name="extractsCount"
                                label={((extractsCount) > 1) ? (
                                    resolveToString(
                                        strings.extractsCount,
                                        { count: extractsCount },
                                    )
                                ) : (
                                    resolveToString(
                                        strings.extractCount,
                                        { count: extractsCount },
                                    )
                                )}
                                variant="tertiary"
                            />
                        )}
                    >
                        <TabPanel
                            name="sector"
                        >
                            <List
                                className={styles.summaryList}
                                data={opsLearningSummaryResponse?.sectors}
                                renderer={Summary}
                                keySelector={numericIdSelector}
                                rendererParams={sectorSummaryRendererParams}
                                emptyMessage={strings.noSummariesAvailableForSector}
                                errored={isDefined(opsLearningSummaryError)}
                                pending={opsLearningSummaryPending}
                                filtered={false}
                            />
                        </TabPanel>
                        <TabPanel
                            name="component"
                        >
                            <List
                                className={styles.summaryList}
                                data={opsLearningSummaryResponse?.components}
                                renderer={Summary}
                                keySelector={numericIdSelector}
                                rendererParams={componentSummaryRendererParams}
                                emptyMessage={strings.noSummariesAvailableForComponent}
                                errored={isDefined(opsLearningSummaryError)}
                                pending={opsLearningSummaryPending}
                                filtered={false}
                            />
                        </TabPanel>
                    </Container>
                </Tabs>
            </Container>
        </Page>
    );
}

Component.displayName = 'OperationalLearning';
