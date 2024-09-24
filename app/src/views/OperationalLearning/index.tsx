import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Chip,
    ChipProps,
    Container,
    List,
    RawList,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    mapToList,
    sum,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import Page from '#components/Page';
import { type components } from '#generated/types';
import useCountry, { Country } from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import usePerComponent from '#hooks/domain/usePerComponent';
import useSecondarySector from '#hooks/domain/useSecondarySector';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import DismissableListOutput from './Filters/DismissableListOutput';
import Filters, {
    type EntriesAsListWithString,
    type FilterLabel,
    type FilterValue,
} from './Filters';
import KeyInsights from './KeyInsights';
import Summary, { type Props as SummaryProps } from './Summary';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SummaryStatusEnum = components<'read'>['schemas']['OpsLearningSummaryStatusEnum'];

const SUMMARY_STATUS_PENDING = 1 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_STARTED = 2 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_SUCCESS = 3 satisfies SummaryStatusEnum;
const SUMMARY_NO_EXTRACT_AVAILBLE = 4 satisfies SummaryStatusEnum;
const SUMMARY_STATUS_FAILED = 5 satisfies SummaryStatusEnum;

type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/summary/'>;
type OpsLearningSectorSummary = OpsLearningSummaryResponse['sectors'][number];
type OpsLearningComponentSummary = OpsLearningSummaryResponse['components'][number];

interface FilterValueOption {
    key: string;
    // key: keyof FilterValue;
    label: string | undefined | null;
}

const countryKeySelector = (country: Country) => country.iso3;

function filterValueOptionKeySelector(option: FilterValueOption) {
    return option.key;
}

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

    const alert = useAlert();

    const [selectedFilterLabel, setSelectedFilterLabel] = useState<FilterLabel>();

    // const [selectedFilters, setSelectedFilters] = useState<FilterValueOption[]>([]);
    // TODO:
    const handleFilterChange = useCallback((...args: EntriesAsListWithString<FilterValue>) => {
        const [, key, option] = args;

        setSelectedFilterLabel((oldFilterLabel) => {
            const newFilterLabel = { ...oldFilterLabel };

            if (isNotDefined(option)) {
                delete newFilterLabel[key];
            } else {
                newFilterLabel[key] = option;
            }

            return newFilterLabel;
        });
        setFilterField(...args);
    }, [setFilterField]);

    const handleFilterRemove = useCallback((filterKey: string) => {
        // setFilterField(undefined, filterKey);
        setSelectedFilterLabel((oldFilterLabel) => {
            const newFilterLabel = { ...oldFilterLabel };
            delete newFilterLabel[filterKey];
            return newFilterLabel;
        });
    }, [setFilterField]);

    // const selectedFilterOptions = mapToList(
    //     selectedFilterLabel,
    //     (label, key) => ({ key, label } as FilterValueOption),
    // );

    const query = useMemo(() => ({
        appeal_code__region: isDefined(filter.region) ? filter.region : undefined,
        appeal_code__country_in: isDefined(filter.countries) ? filter.countries : undefined,
        appeal_code__dtype_in: isDefined(filter.disasterTypes)
            ? filter.disasterTypes : undefined,
        sector_validated_in: isDefined(filter.secondarySectors)
            ? filter.secondarySectors : undefined,
        per_component_validated_in: isDefined(filter.perComponents)
            ? filter.perComponents : undefined,
        appeal_code__start_date__gte: isDefined(filter.appealStartDateAfter)
            ? filter.appealStartDateAfter : undefined,
        appeal_code__start_date__lte: isDefined(filter.appealStartDateBefore)
            ? filter.appealStartDateBefore : undefined,
        search_extracts: isTruthyString(filter.appealSearchText)
            ? (filter.appealSearchText) : undefined,
    }), [filter]);

    const {
        pending: opsLearningSummaryPending,
        response: opsLearningSummaryResponse,
        error: opsLearningSummaryError,
        trigger: triggerSummary,
    } = useLazyRequest({
        url: '/api/v2/ops-learning/summary/',
        query,
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

    const chipRendererParams = useCallback((
        key: keyof FilterValue,
        option: FilterValueOption,
    ): ChipProps<keyof FilterValue> => ({
        label: option?.label,
        name: key,
        variant: 'tertiary' as const,
        onDelete: handleFilterRemove,
    }), [handleFilterRemove]);

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
        trigger: triggerOperationalLearning,
    } = useLazyRequest({
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

    // NOTE: This effect is intentionally run only once on the initial render
    useEffect(() => {
        triggerSummary(query);
        triggerOperationalLearning(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        triggerSummary(query);
        triggerOperationalLearning(query);
    }, [
        query,
        triggerSummary,
        triggerOperationalLearning,
    ]);

    const handleFilterCancel = useCallback(() => {
        resetFilter();
    }, [resetFilter]);

    const [secondarySectorOptions, secondarySectorOptionsPending] = useSecondarySector();
    const [perComponentOptions, perComponentOptionsPending] = usePerComponent();

    const countryList = useCountry({ region: filter.region });

    const disasterTypeOptions = useDisasterTypes();

    const getCountryLabel = useCallback((key: string | undefined) => (
        countryList?.find((country) => country?.iso3 === key)?.name
    ), [countryList]);

    const getDisasterTypeLabel = useCallback((key: number) => (
        disasterTypeOptions?.find((disaster) => disaster?.id === key)?.name
    ), [disasterTypeOptions]);

    const getSecondarySectorLabel = useCallback((key: number) => (
        secondarySectorOptions?.find((sector) => sector?.key === key)?.label
    ), [secondarySectorOptions]);

    const getPerComponentLabel = useCallback((key: number) => (
        perComponentOptions?.find((perComponent) => perComponent?.id === key)?.title
    ), [perComponentOptions]);

    const filterMapping = useMemo(() => ({
        region: (id: string) => ({
            key: `region_${id}`,
            label: id,
        }),
        countries: (val: string[]) => val.map((iso3) => ({
            key: `country_${iso3}`,
            label: getCountryLabel(iso3),
        })),
        disasterTypes: (val: number[]) => val.map((id) => ({
            key: `disaster_${id}`,
            label: getDisasterTypeLabel(id),
        })),
        secondarySectors: (val: number[]) => val.map((id) => ({
            key: `disaster_${id}`,
            label: getSecondarySectorLabel(id),
        })),
        perComponents: (val: number[]) => val.map((id) => ({
            key: `disaster_${id}`,
            label: getPerComponentLabel(id),
        })),
        appealStartDateAfter: (val: string) => ({
            key: 'appealStartDateAfter',
            label: val,
        }),
        appealStartDateBefore: (val: string) => ({
            key: 'appealStartDateBefore',
            label: val,
        }),
        appealSearchText: () => 'aaa',
    }), [
        getCountryLabel,
        getDisasterTypeLabel,
        getSecondarySectorLabel,
        getPerComponentLabel,
    ]);

    const selectedFilterOptions: FilterValueOption[] = useMemo(() => {
        const selectedFilters: FilterValueOption[] = [];

        // Iterate over filterValue keys and map
        Object.keys(filter).forEach((key) => {
            const filterHandler = filterMapping[key as keyof typeof filterMapping];
            if (filterHandler) {
                const result = filterHandler(filter[key]);
                if (Array.isArray(result)) {
                    selectedFilters.push(...result);
                } else {
                    selectedFilters.push(result as FilterValueOption);
                }
            }
        });

        return selectedFilters;
    }, [filterMapping, filter]);

    return (
        <Page
            heading={strings.operationalLearningHeading}
            description={strings.operationalLearningHeadingDescription}
            mainSectionClassName={styles.mainSection}
        >
            <Container
                withGridViewInFilter
                filters={(
                    <>
                        <Filters
                            value={rawFilter}
                            onChange={setFilterField}
                            countryList={countryList}
                            disasterTypeOptions={disasterTypeOptions}
                            secondarySectorOptions={secondarySectorOptions}
                            perComponentOptions={perComponentOptions}
                            secondarySectorOptionsPending={secondarySectorOptionsPending}
                            perComponentOptionsPending={perComponentOptionsPending}
                        />
                        <div className={styles.exportButton}>
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
                footerIcons={((selectedFilterOptions?.length ?? 0) > 0 && (
                    <TextOutput
                        className={styles.selectedFilters}
                        valueClassName={styles.options}
                        // value={(
                        //     <RawList<
                        //         FilterValueOption,
                        //         keyof FilterValue,
                        //         ChipProps<keyof FilterValue
                        //         >>
                        //         data={filter.countries}
                        //         renderer={Chip}
                        //         keySelector={filterValueOptionKeySelector}
                        //         rendererParams={chipRendererParams}
                        //     />
                        // )}
                        value={(
                            <DismissableListOutput
                                label="Countries"
                                name="countries"
                                onChange={setFilterField}
                                value={filter.countries}
                                options={countryList}
                                labelSelector={stringNameSelector}
                                keySelector={countryKeySelector}
                            />
                        )}
                        label={strings.selectedFilters}
                    />
                ))}
                footerContent={(
                    <>
                        <Button
                            name="apply"
                            onClick={handleApplyFilters}
                            variant="secondary"
                        >
                            Apply
                        </Button>
                        <Button
                            name="cancel"
                            onClick={handleFilterCancel}
                            variant="primary"
                        >
                            Cancel
                        </Button>
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
                ) || opsLearningSummaryResponse?.status === SUMMARY_NO_EXTRACT_AVAILBLE)}
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
