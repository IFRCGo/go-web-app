import {
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    Description,
    ExpandableContainer,
    ListView,
    PERChartLegend,
    PERConsiderations,
    PERDonutChart,
    PERKPITabs,
    PERMap,
    PERRegionToggle,
    PERStackedBarChart,
    PERTreemapChart,
} from '@ifrc-go/ui';
import {
    usePERAssessmentTypeLabels,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import {
    api,
    mbtoken,
} from '#config';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import {
    PER_PHASE_ACTION,
    PER_PHASE_OVERVIEW,
} from '#utils/domain/per';
import { defaultMapStyle } from '#utils/map';
import { resolveUrl } from '#utils/resolveUrl';

import {
    ASSESSMENT_TYPE_COLORS,
    type DashboardFilterState,
    EMPTY_FILTERS,
    getLatestUpdate,
    getPhaseLabel,
    getRegionLabel,
    isAssessmentTypeKey,
    normalizeMapData,
    PHASE_COLORS,
    REGION_COLORS,
    REGION_ORDER,
    type RegionName,
    selectFilteredDashboard,
} from '../data';
import useJsonRequest from '../useJsonRequest';
import {
    getComponentSummaryForTreemap,
    getFilteredMapData,
    getKPIData,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRegionToggleCounts,
    getStackedBarDataByYearAndRegion,
    type SummaryKpiKey,
} from './dataHandler';
import {
    downloadDashboardWorkbook,
    getDashboardWorkbookData,
} from './export';

import i18n from './i18n.json';

type ActiveFilters = DashboardFilterState;

function considerationKeyFromChartKey(key: string): ActiveFilters['consideration'] {
    if (key === 'epi_considerations') return 'epi';
    if (key === 'climate_environmental_considerations') return 'climate';
    if (key === 'urban_considerations') return 'urban';
    return 'migration';
}

function considerationChartKey(
    consideration: ActiveFilters['consideration'],
): string | undefined {
    if (consideration === 'epi') return 'epi_considerations';
    if (consideration === 'climate') return 'climate_environmental_considerations';
    if (consideration === 'urban') return 'urban_considerations';
    if (consideration === 'migration') return 'migration_considerations';
    return undefined;
}

function isRegionName(value: string | null): value is RegionName {
    return value !== null && REGION_ORDER.includes(value as RegionName);
}

function PERSummaryDashboard() {
    const strings = useTranslation(i18n);
    const alert = useAlert();
    const {
        api_region_name: regionOptions,
        per_perphases: phaseOptions,
    } = useGlobalEnums();
    const assessmentTypeLabels = usePERAssessmentTypeLabels();
    const currentLanguage = useCurrentLanguage();
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => ({ ...EMPTY_FILTERS }));
    const [activeTab, setActiveTab] = useState<number>(0);
    const [activePhase, setActivePhase] = useState<number | string | null>(null);
    const [exporting, setExporting] = useState(false);
    const mapDataUrl = resolveUrl(api, 'api/v2/per-map-data');
    const {
        pending: mapDataPending,
        response: rawMapData,
        error: mapDataError,
    } = useJsonRequest<unknown>(mapDataUrl);

    const mapData = useMemo(() => normalizeMapData(rawMapData), [rawMapData]);
    const filteredState = useMemo(
        () => selectFilteredDashboard(mapData.processes, activeFilters),
        [activeFilters, mapData.processes],
    );
    const lastUpdate = useMemo(
        () => getLatestUpdate(mapData.processes.map((process) => process.updatedAt)),
        [mapData.processes],
    );
    const kpiData = useMemo(() => getKPIData(filteredState), [filteredState]);
    const filteredMapData = useMemo(() => getFilteredMapData(filteredState), [filteredState]);
    const workbookData = useMemo(
        () => getDashboardWorkbookData(filteredState, activeFilters),
        [activeFilters, filteredState],
    );
    const regionData = useMemo(
        () => getRegionToggleCounts(mapData.processes, activeFilters),
        [activeFilters, mapData.processes],
    );
    const assessmentTypeData = useMemo(
        () => getRecordsByAssessmentType(filteredState),
        [filteredState],
    );
    const yearRegionData = useMemo(
        () => getStackedBarDataByYearAndRegion(filteredState),
        [filteredState],
    );
    const componentSummary = useMemo(
        () => getComponentSummaryForTreemap(filteredState),
        [filteredState],
    );
    const considerationData = useMemo(
        () => getPERConsiderations(filteredState),
        [filteredState],
    );
    const hasActiveFilters = Object.values(activeFilters).some((value) => value !== null);

    const kpiDescriptions: Record<SummaryKpiKey, string> = {
        'total-engaged': strings.kpiTotalEngagedDescription,
        orientation: strings.kpiOrientationDescription,
        assessment: strings.kpiAssessmentDescription,
        action: strings.kpiActionDescription,
        completed: strings.kpiCompletedDescription,
    };
    const kpiTabData = kpiData.map((kpi) => ({
        ...kpi,
        description: kpiDescriptions[kpi.key],
    }));

    // NOTE: `label` / `name` identify an item and are used for filtering. Only
    // `displayLabel` / `displayName` are shown, and they are translated.
    const regionToggleData = useMemo(
        () => regionData.map((item) => ({
            ...item,
            displayName: getRegionLabel(item.name, regionOptions, currentLanguage),
        })),
        [currentLanguage, regionData, regionOptions],
    );
    const regionCategories = useMemo(
        () => Object.entries(REGION_COLORS).map(([label, fillColor]) => ({
            label,
            displayLabel: getRegionLabel(label as RegionName, regionOptions, currentLanguage),
            fillColor,
        })),
        [currentLanguage, regionOptions],
    );
    const regionLegendData = useMemo(
        () => Object.entries(REGION_COLORS).map(([label, color]) => ({
            label,
            displayLabel: getRegionLabel(label as RegionName, regionOptions, currentLanguage),
            color,
        })),
        [currentLanguage, regionOptions],
    );
    const phaseLegendData = useMemo(
        () => PHASE_COLORS.map((phase) => ({
            ...phase,
            displayLabel: getPhaseLabel(phase, phaseOptions),
        })),
        [phaseOptions],
    );
    const assessmentTypeChartData = useMemo(
        () => assessmentTypeData.map((item) => ({
            ...item,
            displayLabel: assessmentTypeLabels[item.label],
        })),
        [assessmentTypeData, assessmentTypeLabels],
    );
    const assessmentTypeLegendData = useMemo(
        () => assessmentTypeData.map((item) => ({
            label: item.label,
            displayLabel: assessmentTypeLabels[item.label],
            color: ASSESSMENT_TYPE_COLORS[item.label],
        })),
        [assessmentTypeData, assessmentTypeLabels],
    );
    const considerationChartData = useMemo(
        () => ({
            ...considerationData,
            data: considerationData.data.map((chart) => chart.map((row) => ({
                ...row,
                displayName: getRegionLabel(row.name, regionOptions, currentLanguage),
            }))),
        }),
        [considerationData, currentLanguage, regionOptions],
    );

    const updateFilter = <KEY extends keyof ActiveFilters>(
        key: KEY,
        value: ActiveFilters[KEY],
    ) => {
        setActiveFilters((prev) => ({
            ...prev,
            [key]: prev[key] === value ? null : value,
        }));
    };

    const handleRegionStackedClick = (item: { label: string; year?: string | number | null }) => {
        if (item.year !== undefined && item.year !== null) {
            updateFilter('year', Number(item.year));
        } else if (isRegionName(item.label)) {
            updateFilter('region', item.label);
        }
    };

    const handleTabClick = (key: string): void => {
        setActiveFilters((prev) => {
            if (key === 'orientation') {
                return {
                    ...prev,
                    phaseCohort: prev.phaseCohort === 'orientation' ? null : 'orientation',
                    minimumCycles: null,
                };
            }
            if (key === 'assessment') {
                return {
                    ...prev,
                    phaseCohort: prev.phaseCohort === 'assessment' ? null : 'assessment',
                    minimumCycles: null,
                };
            }
            if (key === 'action') {
                return {
                    ...prev,
                    phaseCohort: prev.phaseCohort === 'action' ? null : 'action',
                    minimumCycles: null,
                };
            }
            if (key === 'completed') {
                return {
                    ...prev,
                    phaseCohort: null,
                    minimumCycles: prev.minimumCycles === 2 ? null : 2,
                };
            }
            return {
                ...prev,
                phaseCohort: null,
                minimumCycles: null,
            };
        });
        let phaseLabel: string | null = null;
        if (key === 'orientation') {
            phaseLabel = 'Orientation';
        } else if (key === 'action') {
            phaseLabel = 'Action & accountability';
        }
        setActivePhase(phaseLabel);
    };

    const handleAssessmentTypeClick = (item: { label: string }) => {
        if (isAssessmentTypeKey(item.label)) {
            updateFilter('assessmentType', item.label);
        }
    };

    const handleHighPriorityComponentClick = (component: {
        area: string;
        component: string | null;
    }) => {
        if (component) {
            updateFilter('highPriorityComponent', component.component);
        }
    };

    const handlePhaseClick = (item: { label: string; color: string; phaseNumber: number }) => {
        let phaseCohort: 'orientation' | 'assessment' | 'action';
        if (item.phaseNumber === PER_PHASE_OVERVIEW) {
            phaseCohort = 'orientation';
        } else if (item.phaseNumber === PER_PHASE_ACTION) {
            phaseCohort = 'action';
        } else {
            phaseCohort = 'assessment';
        }
        setActiveFilters((prev) => ({
            ...prev,
            phaseCohort: prev.phaseCohort === phaseCohort ? null : phaseCohort,
            minimumCycles: null,
        }));
        if (phaseCohort === 'orientation') {
            setActiveTab(1);
        } else if (phaseCohort === 'assessment') {
            setActiveTab(2);
        } else {
            setActiveTab(3);
        }
        setActivePhase(activePhase === item.label ? null : item.label);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await downloadDashboardWorkbook(workbookData);
        } catch {
            alert.show(strings.summaryExportFailure, { variant: 'danger' });
        } finally {
            setExporting(false);
        }
    };
    const exportButton = (
        <Button
            name={undefined}
            onClick={handleExport}
            disabled={exporting || workbookData.nationalSocietyCount === 0}
            aria-label={strings.summaryExportAriaLabel}
        >
            {strings.summaryExport}
        </Button>
    );

    return (
        <Container
            aria-label={strings.summaryContainerAriaLabel}
            headerDescription={isDefined(lastUpdate) ? resolveToString(
                strings.summaryLastUpdate,
                { date: formatDate(lastUpdate) },
            ) : undefined}
            pending={mapDataPending}
            errored={isDefined(mapDataError)}
            errorMessage={strings.summaryFetchFailedError}
        >
            <ListView layout="block">
                <ExpandableContainer heading={strings.summaryAboutDashboard}>
                    <Description>{strings.summaryHeaderDescription}</Description>
                </ExpandableContainer>
                <ListView
                    layout="block"
                    withBackground
                    withPadding
                >
                    <PERKPITabs
                        kpis={kpiTabData}
                        activeIndex={activeTab}
                        onActiveIndexChange={(index) => {
                            const key = kpiTabData[index]?.key;
                            setActiveTab(index);
                            if (isDefined(key)) {
                                handleTabClick(key);
                            }
                        }}
                        disableTabs={false}
                    />

                    <PERRegionToggle
                        activeRegion={activeFilters?.region}
                        onRegionClick={(region) => {
                            if (region === null || isRegionName(region)) {
                                updateFilter('region', region);
                            }
                        }}
                        regions={regionToggleData}
                    />

                    <Container
                        heading={strings.mapHeading}
                        headerDescription={strings.mapDescription}
                        withHeaderBorder
                        headerActions={hasActiveFilters ? (
                            <>
                                {exportButton}
                                <Button
                                    name={undefined}
                                    onClick={() => {
                                        setActiveFilters({ ...EMPTY_FILTERS });
                                        setActiveTab(0);
                                        setActivePhase(null);
                                    }}
                                >
                                    {strings.summaryClearAllFilters}
                                </Button>
                            </>
                        ) : null}
                    >
                        <PERMap
                            data={filteredMapData}
                            onClick={(record) => {
                                if (record.countryId !== null) {
                                    updateFilter('countryId', record.countryId);
                                }
                            }}
                            valueField="assessmentNumber"
                            tooltipTrigger="click"
                            enableClickToFilter
                            accessToken={mbtoken}
                            mapboxStyle={defaultMapStyle}
                            minRadius={4}
                            maxRadius={7}
                        />
                        <PERChartLegend
                            data={phaseLegendData}
                            onClick={(item) => {
                                const phaseItem = item as {
                                    label: string;
                                    color: string;
                                    phaseNumber: number;
                                };
                                handlePhaseClick(phaseItem);
                            }}
                            activeIndex={activePhase}
                            layout="horizontal"
                        />
                    </Container>

                    <ListView
                        layout="grid"
                        numPreferredGridColumns={2}
                        minGridColumnSize="20rem"
                    >
                        <Container
                            heading={strings.assessmentTypeHeading}
                            headerDescription={strings.assessmentTypeDescription}
                            withHeaderBorder
                            headerActions={activeFilters?.assessmentType !== null && (
                                <Button
                                    name={undefined}
                                    onClick={() => updateFilter('assessmentType', null)}
                                >
                                    {strings.summaryResetFilter}
                                </Button>
                            )}
                        >
                            <PERDonutChart
                                data={assessmentTypeChartData}
                                height={210}
                                width={400}
                                cutout="70%"
                                tooltipEnabled
                                onClick={handleAssessmentTypeClick}
                                colors={Object.values(ASSESSMENT_TYPE_COLORS)}
                            />
                            <PERChartLegend
                                data={assessmentTypeLegendData}
                                onClick={handleAssessmentTypeClick}
                                activeIndex={activeFilters?.assessmentType}
                                layout="horizontal"
                            />
                        </Container>

                        <Container
                            heading={strings.yearAndRegionHeading}
                            headerDescription={strings.yearAndRegionDescription}
                            withHeaderBorder
                            headerActions={(
                                activeFilters?.region !== null
                                || activeFilters?.year !== null
                            ) && (
                                <Button
                                    name={undefined}
                                    onClick={() => {
                                        updateFilter('region', null);
                                        updateFilter('year', null);
                                    }}
                                >
                                    {strings.summaryResetFilter}
                                </Button>
                            )}
                        >
                            <PERStackedBarChart
                                data={yearRegionData}
                                onClick={handleRegionStackedClick}
                                categories={regionCategories}
                                height={250}
                                tooltipEnabled
                                showDataLabels={false}
                            />
                            <PERChartLegend
                                data={regionLegendData}
                                onClick={handleRegionStackedClick}
                                activeIndex={activeFilters?.region}
                                layout="horizontal"
                            />
                        </Container>
                    </ListView>

                    <Container
                        heading={
                            strings.highPriorityComponentsHeading
                        }
                        headerDescription={strings.highPriorityComponentsDescription}
                        withHeaderBorder
                        headerActions={activeFilters?.highPriorityComponent !== null && (
                            <Button
                                name={undefined}
                                onClick={() => updateFilter('highPriorityComponent', null)}
                            >
                                {strings.summaryResetFilter}
                            </Button>
                        )}
                    >
                        <PERTreemapChart
                            d={componentSummary}
                            activeIndex={activeFilters?.highPriorityComponent}
                            onClick={handleHighPriorityComponentClick}
                        />
                    </Container>

                    <Container
                        heading={strings.perConsiderationsHeading}
                        headerDescription={strings.perConsiderationsDescription}
                        withHeaderBorder
                        headerActions={activeFilters.consideration !== null && (
                            <Button
                                name={undefined}
                                onClick={() => {
                                    updateFilter('consideration', null);
                                }}
                            >
                                {strings.summaryResetFilter}
                            </Button>
                        )}
                    >
                        <PERConsiderations
                            data={considerationChartData}
                            onClickAssessmentType={(assessmentType) => updateFilter(
                                'assessmentType',
                                assessmentType,
                            )}
                            onClickPER={(key) => updateFilter(
                                'consideration',
                                considerationKeyFromChartKey(key),
                            )}
                            activeIndex={activeFilters?.assessmentType}
                            activePERFilter={considerationChartKey(activeFilters.consideration)}
                        />
                    </Container>
                </ListView>
            </ListView>
        </Container>
    );
}

export default PERSummaryDashboard;
