import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ButtonLayout,
    Container,
    Description,
    DismissableListOutput,
    DismissableMultiListOutput,
    DismissableTextOutput,
    ListView,
    RawList,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    hasSomeDefinedValue,
    numericIdSelector,
    numericKeySelector,
    resolveToComponent,
    resolveToString,
    stringLabelSelector,
    stringNameSelector,
    stringTitleSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    sum,
} from '@togglecorp/fujs';
import { type EntriesAsList } from '@togglecorp/toggle-form';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import OpsLearningKeyInsights from '#components/domain/OpsLearningKeyInsights';
import { type RegionOption } from '#components/domain/RegionSelectInput';
import Link from '#components/Link';
import Page from '#components/Page';
import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes, { type DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useSecondarySector from '#hooks/domain/useSecondarySector';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import {
    SUMMARY_NO_EXTRACT_AVAILABLE,
    SUMMARY_STATUS_FAILED,
    SUMMARY_STATUS_PENDING,
    SUMMARY_STATUS_STARTED,
    SUMMARY_STATUS_SUCCESS,
} from '#utils/domain/opsLearning';
import { getFormattedComponentName } from '#utils/domain/per';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import Filters, {
    type FilterValue,
    type PerLearningType,
} from './Filters';
import Stats from './Stats';
import Summary, { type Props as SummaryProps } from './Summary';

import i18n from './i18n.json';

const opsLearningDashboardURL = 'https://app.powerbi.com/view?r=eyJrIjoiMTM4Y2ZhZGEtNGZmMS00ODZhLWFjZjQtMTE2ZTIyYTI0ODc4IiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9&pageName=ReportSectionfa0be9512521e929ae4a';
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
const disasterTypeLabelSelector = (type: DisasterType) => type.name ?? '?';
const perLearningTypeKeySelector = (perLearningType: PerLearningType) => perLearningType.key;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<'sector' | 'component'>('sector');
    const [query, setQuery] = useState<QueryType>();
    const [filterPristine, setFilterPristine] = useState(true);

    const {
        rawFilter,
        filter,
        rawFiltered,
        filtered,
        setFilterField,
        resetFilter,
    } = useFilterState<FilterValue>({
        debounceTime: 300,
        filter: {},
    });

    const onFilterChange = useCallback((...args: EntriesAsList<FilterValue>) => {
        setFilterPristine(false);
        setFilterField(...args);
    }, [setFilterField]);

    const alert = useAlert();

    const {
        api_region_name: regionList,
        per_learning_type: perLearningTypeOptions,
    } = useGlobalEnums();
    const countryList = useCountry({ region: rawFilter.region });
    const disasterTypeOptions = useDisasterTypes();
    const secondarySectorOptions = useSecondarySector();
    const {
        response: perComponentsResponse,
    } = useRequest({
        url: '/api/v2/per-formcomponent/',
        query: {
            exclude_subcomponents: true,
        },
        preserveResponse: true,
        onFailure: () => {
            alert.show(
                strings.failedToFetchPerComponents,
                { variant: 'danger' },
            );
        },
    });

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
        onFailure: () => {
            alert.show(
                strings.failedToFetchSummary,
                { variant: 'danger' },
            );
        },
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
        onFailure: () => {
            alert.show(
                strings.failedToFetchLearning,
                { variant: 'danger' },
            );
        },
    });

    const {
        pending: opsLearningOrganizationTypePending,
        response: opsLearningOrganizationTypes,
    } = useRequest({
        url: '/api/v2/ops-learning/organization-type/',
        preserveResponse: true,
    });

    const [
        pendingExport, ,
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
            appeal_code__region: hasSomeDefinedValue(filter.region) ? filter.region : undefined,
            appeal_code__country__in: hasSomeDefinedValue(filter.countries)
                ? filter.countries : undefined,
            appeal_code__dtype__in: hasSomeDefinedValue(filter.disasterTypes)
                ? filter.disasterTypes : undefined,
            appeal_code__start_date__gte: hasSomeDefinedValue(filter.appealStartDateAfter)
                ? filter.appealStartDateAfter : undefined,
            appeal_code__start_date__lte: hasSomeDefinedValue(filter.appealStartDateBefore)
                ? filter.appealStartDateBefore : undefined,
            sector_validated__in: hasSomeDefinedValue(filter.secondarySectors)
                ? filter.secondarySectors : undefined,
            per_component_validated__in: hasSomeDefinedValue(filter.perComponents)
                ? filter.perComponents : undefined,
            search_extracts: isTruthyString(filter.appealSearchText)
                ? (filter.appealSearchText) : undefined,
            type_validated__in: hasSomeDefinedValue(filter.perLearningTypes)
                ? filter.perLearningTypes : undefined,
            organization_validated__in: hasSomeDefinedValue(filter.organizationTypes)
                ? filter.organizationTypes : undefined,
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
            actions={(
                <ButtonLayout
                    spacing="2xs"
                    readOnly
                    textSize="sm"
                >
                    {strings.beta}
                </ButtonLayout>
            )}
            description={strings.operationalLearningHeadingDescription}
            info={(
                <Description
                    textSize="sm"
                    withLightText
                    withCenteredContent
                >
                    {resolveToComponent(
                        strings.disclaimerMessage,
                        {
                            link: (
                                <Link
                                    href={opsLearningDashboardURL}
                                    external
                                    styleVariant="action"
                                    withLinkIcon
                                >
                                    {strings.here}
                                </Link>
                            ),
                        },
                    )}
                </Description>
            )}
        >
            <ListView layout="block">
                <ListView
                    layout="grid"
                    numPreferredGridColumns={6}
                >
                    <Filters
                        value={rawFilter}
                        onChange={onFilterChange}
                        disasterTypeOptions={disasterTypeOptions}
                        secondarySectorOptions={secondarySectorOptions}
                        perComponentOptions={perComponentsResponse?.results}
                        organizationTypeOptions={opsLearningOrganizationTypes?.results}
                        perLearningTypeOptions={perLearningTypeOptions}
                        organizationTypePending={opsLearningOrganizationTypePending}
                    />
                </ListView>
                <ListView
                    withWrap
                    withSpaceBetweenContents
                >
                    <TextInput
                        name="appealSearchText"
                        placeholder={strings.searchPlaceholder}
                        value={rawFilter.appealSearchText}
                        onChange={onFilterChange}
                        icons={<SearchLineIcon />}
                        // disabled={disabled}
                    />
                    <ListView
                        withWrap
                        spacing="sm"
                    >
                        <ExportButton
                            onClick={handleExportClick}
                            pendingExport={pendingExport}
                            totalCount={opsLearningResponse?.count}
                            disabled={(
                                opsLearningSummaryResponse?.status !== SUMMARY_STATUS_SUCCESS
                                || opsLearningPending
                            )}
                        />
                        {rawFiltered && (
                            <Button
                                name={undefined}
                                onClick={handleResetFilters}
                            >
                                {strings.clearFilters}
                            </Button>
                        )}
                        {!filterPristine && (
                            <Button
                                name="apply"
                                onClick={handleApplyFilters}
                                disabled={filterPristine}
                            >
                                {strings.applyFilters}
                            </Button>
                        )}
                    </ListView>
                </ListView>
                {isDefined(rawFilter) && hasSomeDefinedValue(rawFilter) && (
                    <ListView
                        withWrap
                        spacing="xs"
                    >
                        <DismissableListOutput
                            name="region"
                            value={rawFilter.region}
                            onDismiss={onFilterChange}
                            options={regionList}
                            labelSelector={stringValueSelector}
                            keySelector={regionKeySelector}
                        />
                        <DismissableMultiListOutput
                            name="countries"
                            onDismiss={onFilterChange}
                            value={rawFilter.countries}
                            options={countryList}
                            labelSelector={stringNameSelector}
                            keySelector={numericIdSelector}
                        />
                        <DismissableMultiListOutput
                            name="disasterTypes"
                            onDismiss={onFilterChange}
                            value={rawFilter.disasterTypes}
                            options={disasterTypeOptions}
                            labelSelector={disasterTypeLabelSelector}
                            keySelector={numericIdSelector}
                        />
                        <DismissableMultiListOutput
                            name="secondarySectors"
                            onDismiss={onFilterChange}
                            value={rawFilter.secondarySectors}
                            options={secondarySectorOptions}
                            labelSelector={stringLabelSelector}
                            keySelector={numericKeySelector}
                        />
                        <DismissableMultiListOutput
                            name="perComponents"
                            onDismiss={onFilterChange}
                            value={rawFilter.perComponents}
                            options={perComponentsResponse?.results}
                            labelSelector={getFormattedComponentName}
                            keySelector={numericIdSelector}
                        />
                        <DismissableMultiListOutput
                            name="organizationTypes"
                            onDismiss={onFilterChange}
                            value={rawFilter.organizationTypes}
                            options={opsLearningOrganizationTypes?.results}
                            labelSelector={stringTitleSelector}
                            keySelector={numericIdSelector}
                        />
                        <DismissableMultiListOutput
                            name="perLearningTypes"
                            onDismiss={onFilterChange}
                            value={rawFilter.perLearningTypes}
                            options={perLearningTypeOptions}
                            labelSelector={stringValueSelector}
                            keySelector={perLearningTypeKeySelector}
                        />
                        <DismissableTextOutput
                            name="appealStartDateAfter"
                            value={rawFilter.appealStartDateAfter}
                            onDismiss={onFilterChange}
                        />
                        <DismissableTextOutput
                            name="appealStartDateBefore"
                            value={rawFilter.appealStartDateBefore}
                            onDismiss={onFilterChange}
                        />
                        <DismissableTextOutput
                            name="appealSearchText"
                            value={rawFilter.appealSearchText}
                            onDismiss={onFilterChange}
                        />
                    </ListView>
                )}
            </ListView>
            <Stats query={query} />
            {showKeyInsights && (
                <Container
                    heading={strings.opsLearningSummariesHeading}
                    withPadding
                    withDarkBackground
                    headingLevel={5}
                    spacing="lg"
                >
                    <OpsLearningKeyInsights
                        opsLearningSummaryResponse={opsLearningSummaryResponse}
                    />
                </Container>
            )}
            <Container
                pending={opsLearningSummaryPending
                    || opsLearningSummaryResponse?.status === SUMMARY_STATUS_PENDING
                    || opsLearningSummaryResponse?.status === SUMMARY_STATUS_STARTED}
                pendingMessage={pendingMessage}
                errored={isDefined(opsLearningSummaryError)
                    || opsLearningSummaryResponse?.status === SUMMARY_STATUS_FAILED}
                errorMessage={resolveToComponent(
                    strings.errorMessage,
                    {

                        link: (
                            <Link
                                href="mailto:im@ifrc.org"
                                external
                            >
                                im@ifrc.org
                            </Link>
                        ),
                    },
                )}
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
                    styleVariant="nav"
                >
                    <ListView layout="block">
                        <ListView>
                            <TabList>
                                <Tab name="sector">{strings.bySectorTitle}</Tab>
                                <Tab name="component">{strings.byComponentTitle}</Tab>
                            </TabList>
                            {extractsCount > 0 && (
                                <ButtonLayout
                                    spacing="2xs"
                                    readOnly
                                    textSize="sm"
                                >
                                    {((extractsCount) > 1) ? (
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
                                </ButtonLayout>
                            )}
                        </ListView>
                        <TabPanel name="sector">
                            <Container
                                emptyMessage={strings.noSummariesAvailableForSector}
                                errored={isDefined(opsLearningSummaryError)}
                                pending={opsLearningSummaryPending}
                                empty={isNotDefined(opsLearningSummaryResponse?.sectors)
                                    || opsLearningSummaryResponse.sectors.length === 0}
                            >
                                <ListView
                                    layout="block"
                                    spacing="sm"
                                >
                                    <RawList
                                        data={opsLearningSummaryResponse?.sectors}
                                        renderer={Summary}
                                        keySelector={numericIdSelector}
                                        rendererParams={sectorSummaryRendererParams}
                                    />
                                </ListView>
                            </Container>
                        </TabPanel>
                        <TabPanel name="component">
                            <Container
                                emptyMessage={strings.noSummariesAvailableForComponent}
                                errored={isDefined(opsLearningSummaryError)}
                                pending={opsLearningSummaryPending}
                                empty={isNotDefined(opsLearningSummaryResponse?.components)
                                    || opsLearningSummaryResponse.components.length === 0}
                            >
                                <ListView
                                    layout="block"
                                    spacing="sm"
                                >
                                    <RawList
                                        data={opsLearningSummaryResponse?.components}
                                        renderer={Summary}
                                        keySelector={numericIdSelector}
                                        rendererParams={componentSummaryRendererParams}
                                    />
                                </ListView>
                            </Container>
                        </TabPanel>
                    </ListView>
                </Tabs>
            </Container>
        </Page>
    );
}

Component.displayName = 'OperationalLearning';
