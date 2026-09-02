import {
    useMemo,
    useState,
} from 'react';
import {
    BlockLoading,
    Button,
    Container,
    PERChartLegend,
    PERConsiderations,
    PERDonutChart,
    PERKPITabs,
    PERMap,
    PERRegionToggle,
    PERStackedBarChart,
    PERTreemapChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import {
    api,
    mbtoken,
} from '#config';
import { defaultMapStyle } from '#utils/map';
import { resolveUrl } from '#utils/resolveUrl';

import {
    ASSESSMENT_TYPE_COLORS,
    type DashboardFilterState,
    EMPTY_FILTERS,
    normalizeLastUpdate,
    normalizeMapData,
    PHASE_COLORS,
    REGION_COLORS,
    REGION_ORDER,
    type RegionName,
    selectFilteredDashboard,
} from '../data';
import {
    getSnapshotUrl,
    STATIC_REVIEW_MODE,
    useJsonRequest,
} from '../snapshot';
import {
    getComponentSummaryForTreemap,
    getFilteredMapData,
    getKPIData,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
} from './dataHandler';

import i18n from './i18n.json';
import styles from './styles.module.css';

const LAST_UPDATE_DATA_URL = 'https://raw.githubusercontent.com/IFRCGo/ifrc-per-data-fetcher/refs/heads/main/data/last-update.json';

type ActiveFilters = DashboardFilterState;

const REGION_CATEGORIES = Object.entries(REGION_COLORS).map(([label, fillColor]) => ({
    label,
    fillColor,
}));

const REGION_LEGEND_CATEGORIES = Object.entries(REGION_COLORS).map(([label, color]) => ({
    label,
    color,
}));

const ASSESSMENT_TYPE_CATEGORIES = Object.entries(ASSESSMENT_TYPE_COLORS).map(([
    label,
    color,
]) => ({
    label,
    color,
}));

function formatLastUpdate(value: string): string {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? value : dateValue.toLocaleString();
}

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
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => ({ ...EMPTY_FILTERS }));
    const [activeTab, setActiveTab] = useState<number>(0);
    const [activePhase, setActivePhase] = useState<number | string | null>(null);
    const mapDataUrl = STATIC_REVIEW_MODE
        ? getSnapshotUrl('per-map-data.json')
        : resolveUrl(api, 'api/v2/per-map-data');
    const lastUpdateUrl = STATIC_REVIEW_MODE
        ? getSnapshotUrl('snapshot.json')
        : LAST_UPDATE_DATA_URL;
    const {
        pending: mapDataPending,
        response: rawMapData,
        error: mapDataError,
    } = useJsonRequest<unknown>(mapDataUrl);
    const {
        pending: lastUpdatePending,
        response: rawLastUpdate,
        error: lastUpdateError,
    } = useJsonRequest<unknown>(lastUpdateUrl);

    const mapData = useMemo(() => normalizeMapData(rawMapData), [rawMapData]);
    const filteredState = useMemo(
        () => selectFilteredDashboard(mapData.processes, activeFilters),
        [activeFilters, mapData.processes],
    );
    const lastUpdate = useMemo(() => normalizeLastUpdate(rawLastUpdate), [rawLastUpdate]);
    const kpiData = useMemo(() => getKPIData(filteredState), [filteredState]);
    const filteredMapData = useMemo(() => getFilteredMapData(filteredState), [filteredState]);
    const regionData = useMemo(() => getRecordsByRegion(filteredState), [filteredState]);
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

    if (mapDataPending || (STATIC_REVIEW_MODE && lastUpdatePending)) {
        return (
            <Container
                className={styles.perSummaryDashboard}
                aria-label={strings.summaryContainerAriaLabel}
            >
                <BlockLoading className={styles.blockLoading} />
            </Container>
        );
    }

    if (mapDataError || (STATIC_REVIEW_MODE && lastUpdateError)) {
        return (
            <Container
                className={styles.perSummaryDashboard}
                aria-label={strings.summaryContainerAriaLabel}
            >
                Failed to load dashboard data
            </Container>
        );
    }

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
        updateFilter('assessmentType', item.label);
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
        if (item.phaseNumber === 1) {
            phaseCohort = 'orientation';
        } else if (item.phaseNumber === 5) {
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

    return (
        <>
            <div className={styles.lastUpdate}>
                {strings.summaryLastUpdate}
                {' '}
                {formatLastUpdate(lastUpdate)}
            </div>
            {/* <PERExportButton /> */}
            <div className={styles.headerDescription}>
                {strings.summaryHeaderDescription}
            </div>
            <div className={styles.content}>
                <PERKPITabs
                    kpis={kpiData}
                    activeIndex={activeTab}
                    onActiveIndexChange={(index) => {
                        const keys = ['total-engaged', 'orientation', 'assessment', 'action', 'completed'];
                        setActiveTab(index);
                        handleTabClick(keys[index]!);
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
                    regions={regionData}
                    precision={0}
                    showCount
                />

                <Container
                    heading={strings.mapHeading}
                    headerDescription={strings.mapDescription}
                    className={styles.container}
                    withHeaderBorder
                    headerActions={Object.values(activeFilters).some((value) => value !== null) ? (
                        <Button
                            name={undefined}
                            onClick={() => {
                                setActiveFilters({ ...EMPTY_FILTERS });
                                setActiveTab(0);
                                setActivePhase(null);
                            }}
                            aria-label={strings.summaryResetFilterAriaLabel}
                        >
                            {strings.summaryResetFilter}
                        </Button>
                    ) : null}
                >
                    <div style={{ height: '470px' }}>
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
                    </div>
                    <PERChartLegend
                        data={[...PHASE_COLORS]}
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

                <div className={styles.charts}>
                    <Container
                        heading={strings.assessmentTypeHeading}
                        headerDescription={
                            strings.assessmentTypeDescription
                        }
                        withHeaderBorder
                        headerActions={activeFilters?.assessmentType !== null && (
                            <Button
                                name={undefined}
                                onClick={() => updateFilter('assessmentType', null)}
                                aria-label={strings.summaryResetFilterAriaLabel}
                            >
                                {strings.summaryResetFilter}
                            </Button>
                        )}
                    >
                        <PERDonutChart
                            data={assessmentTypeData}
                            height={210}
                            width={400}
                            cutout="70%"
                            tooltipEnabled
                            onClick={handleAssessmentTypeClick}
                            colors={Object.values(ASSESSMENT_TYPE_COLORS)}
                        />
                        <PERChartLegend
                            data={ASSESSMENT_TYPE_CATEGORIES}
                            onClick={handleAssessmentTypeClick}
                            activeIndex={activeFilters?.assessmentType}
                            layout="horizontal"
                        />
                    </Container>

                    <Container
                        heading={strings.yearAndRegionHeading}
                        headerDescription={
                            strings.yearAndRegionDescription
                        }
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
                                aria-label={strings.summaryResetFilterAriaLabel}
                            >
                                {strings.summaryResetFilter}
                            </Button>
                        )}
                    >
                        <PERStackedBarChart
                            data={yearRegionData}
                            onClick={handleRegionStackedClick}
                            categories={REGION_CATEGORIES}
                            height={250}
                            tooltipEnabled
                            showDataLabels={false}
                        />
                        <PERChartLegend
                            data={REGION_LEGEND_CATEGORIES}
                            onClick={handleRegionStackedClick}
                            activeIndex={activeFilters?.region}
                            layout="horizontal"
                        />
                    </Container>
                </div>

                <div className={styles.treemap}>
                    <Container
                        heading={
                            strings.highPriorityComponentsHeading
                        }
                        headerDescription={
                            strings.highPriorityComponentsDescription
                        }
                        withHeaderBorder
                        headerActions={activeFilters?.highPriorityComponent !== null && (
                            <Button
                                name={undefined}
                                onClick={() => updateFilter('highPriorityComponent', null)}
                                aria-label={strings.summaryResetFilterAriaLabel}
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
                </div>

                <Container
                    heading={strings.perConsiderationsHeading}
                    headerDescription={
                        strings.perConsiderationsDescription
                    }
                    withHeaderBorder
                    headerActions={(
                        activeFilters.consideration !== null
                        || activeFilters.assessmentType !== null
                    ) && (
                        <Button
                            name={undefined}
                            onClick={() => {
                                updateFilter('consideration', null);
                                updateFilter('assessmentType', null);
                            }}
                            aria-label={strings.summaryResetFilterAriaLabel}
                        >
                            {strings.summaryResetFilter}
                        </Button>
                    )}
                >
                    <PERConsiderations
                        data={considerationData}
                        onClickAssessmentType={handleAssessmentTypeClick}
                        onClickPER={(key) => updateFilter(
                            'consideration',
                            considerationKeyFromChartKey(key),
                        )}
                        activeIndex={activeFilters?.assessmentType}
                        activePERFilter={considerationChartKey(activeFilters.consideration)}
                    />
                </Container>
            </div>
        </>
    );
}

export default PERSummaryDashboard;
