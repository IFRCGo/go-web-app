import {
    useEffect,
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

import { mbtoken } from '#config';
import { defaultMapStyle } from '#utils/map';

import { PHASE_COLORS } from './constants';
import {
    getComponentSummaryForTreemap,
    getFilteredMapData,
    getKPIData,
    getLastUpdateDate,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
    initializeData,
} from './dataHandler';

import i18n from '../i18n.json';
import styles from './styles.module.css';

const MAP_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/map-data.json';
const LAST_UPDATE_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/last-update.json';
const GITHUB_TOKEN = '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';

interface ActiveFilters {
    id: number | null;
    region: string | null;
    assessmentType: string | null;
    year: number | null;
    phase: number | null;
    highPriorityComponent: string | null;
    perConsiderations: string | null;
    numberOfCycles: number | null;
    completedAssessment: boolean | null;
    highPriorityArea: string | null;
}

function PERSummaryDashboard() {
    const strings = useTranslation(i18n);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        id: null,
        region: null,
        assessmentType: null,
        year: null,
        phase: null,
        highPriorityComponent: null,
        perConsiderations: null,
        numberOfCycles: null,
        completedAssessment: null,
        highPriorityArea: null,
    });
    const [activeTab, setActiveTab] = useState<number>(0);
    const [activePhase, setActivePhase] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapData, setMapData] = useState<AssessmentRecord[] | null>(null);
    interface LastUpdateData {
        lastUpdate: string;
    }
    const [lastUpdateData, setLastUpdateData] = useState<LastUpdateData | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [mapResponse, lastUpdateResponse] = await Promise.all([
                    fetch(MAP_DATA_URL, {
                        headers: {
                            Authorization: `Bearer ${GITHUB_TOKEN}`,
                            Accept: 'application/vnd.github.v3.raw',
                        },
                    }),
                    fetch(LAST_UPDATE_DATA_URL, {
                        headers: {
                            Authorization: `Bearer ${GITHUB_TOKEN}`,
                            Accept: 'application/vnd.github.v3.raw',
                        },
                    }),
                ]);

                if (!mapResponse.ok || !lastUpdateResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [mapDataResponse, lastUpdateDataResponse] = await Promise.all([
                    mapResponse.json(),
                    lastUpdateResponse.json(),
                ]);

                setMapData(mapDataResponse);
                setLastUpdateData(lastUpdateDataResponse);
                initializeData(mapDataResponse, lastUpdateDataResponse);
            } catch {
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Container
                className={styles.perSummaryDashboard}
                contentClassName={styles.loadingContainer}
                aria-label={strings.perSummaryDashboard.ariaLabels.container}
            >
                <BlockLoading className={styles.blockLoading} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                className={styles.perSummaryDashboard}
                contentClassName={styles.content}
                aria-label={strings.perSummaryDashboard.ariaLabels.container}
            >
                {error}
            </Container>
        );
    }

    if (!mapData || !lastUpdateData) {
        return null;
    }

    const updateFilter = (key: keyof ActiveFilters, value: ActiveFilters[keyof ActiveFilters]) => {
        setActiveFilters((prev) => ({
            ...prev,
            [key]: prev[key] === value ? null : value,
        }));
    };

    const handleRegionStackedClick = (item: { label: string; year?: string | number | null }) => {
        if (item.year) {
            updateFilter('year', Number(item.year));
        }
        if (item.label) {
            updateFilter('region', item.label);
        }
    };

    const handleTabClick = (key: string): void => {
        if (key === 'total-engaged') {
            updateFilter('phase', null);
            updateFilter('numberOfCycles', null);
            updateFilter('completedAssessment', null);
            setActivePhase(null);
        }
        if (key === 'orientation') {
            updateFilter('phase', 1);
            updateFilter('numberOfCycles', null);
            updateFilter('completedAssessment', null);
            setActivePhase('Orientation');
        }
        if (key === 'assessment') {
            updateFilter('phase', null);
            updateFilter('numberOfCycles', null);
            updateFilter('completedAssessment', true);
            setActivePhase(null);
        }
        if (key === 'action') {
            setActivePhase('Action & accountability');
            updateFilter('completedAssessment', null);
            updateFilter('phase', 5);
            updateFilter('numberOfCycles', null);
        }
        if (key === 'completed') {
            updateFilter('completedAssessment', null);
            updateFilter('phase', null);
            updateFilter('numberOfCycles', 2);
            setActivePhase(null);
        }
    };

    const handleAssessmentTypeClick = (item: { label: string }) => {
        updateFilter('assessmentType', item.label);
    };

    const handleHighPriorityComponentClick = (component: {
        area: string;
        component: string | null;
    }) => {
        if (component) {
            updateFilter('highPriorityArea', component.area);
            updateFilter('highPriorityComponent', component.component);
        }
    };

    const handlePhaseClick = (item: {
        label: string;
        color: string;
        phaseNumber: number;
    }) => {
        if (activeTab !== 4) {
            updateFilter('numberOfCycles', null);
            updateFilter('completedAssessment', null);
            setActiveTab(0);
            setActivePhase(null);
        }

        if (item.label === 'assessment') {
            updateFilter('numberOfCycles', null);
            updateFilter('completedAssessment', null);
            setActiveTab(1);
        }

        if (item.label === 'Action & accountability') {
            updateFilter('numberOfCycles', null);
            updateFilter('completedAssessment', null);
        }

        updateFilter('phase', item.phaseNumber);

        if (!activeFilters.phase) {
            setActivePhase(item.label);
        } else {
            setActivePhase(null);
        }
    };

    const regionColors = {
        Africa: '#1B365D',
        Americas: '#236192',
        'Asia Pacific': '#418FDE',
        Europe: '#009CDD',
        MENA: '#C6C6C6',
    };

    const regionCategories = ['Africa', 'Americas', 'Asia Pacific', 'Europe', 'MENA'].map((region) => ({
        label: region,
        fillColor: regionColors[region as keyof typeof regionColors],
    }));

    const regionLegendCategories = ['Africa', 'Americas', 'Asia Pacific', 'Europe', 'MENA'].map(
        (region) => ({
            label: region,
            color: regionColors[region as keyof typeof regionColors],
        }),
    );

    return (
        <>
            <div className={styles.lastUpdate}>
                {strings.common.lastUpdate.label}
                {' '}
                {new Date(getLastUpdateDate()).toLocaleString()}
            </div>
            {/* <PERExportButton /> */}
            <div className={styles.headerDescription}>
                {strings.perSummaryDashboard.header.description}
            </div>
            <div className={styles.content}>
                <PERKPITabs
                    kpis={getKPIData(activeFilters)}
                    activeIndex={activeTab}
                    onActiveIndexChange={(index) => {
                        const keys = ['total-engaged', 'orientation', 'assessment', 'action', 'completed'];
                        setActiveTab(index);
                        handleTabClick(keys[index]);
                    }}
                    disableTabs={false}
                />

                <PERRegionToggle
                    activeRegion={activeFilters?.region}
                    onRegionClick={(region) => updateFilter('region', region)}
                    regions={getRecordsByRegion(activeFilters)}
                    precision={0}
                    showCount
                />

                <Container
                    heading={strings.perSummaryDashboard.containers.map.heading}
                    headerDescription={strings.perSummaryDashboard.containers.map.description}
                    className={styles.container}
                    withHeaderBorder
                    actions={(
                        activeFilters?.phase !== null
                || activeFilters?.id !== null
                || activeFilters?.region !== null
                || activeFilters?.numberOfCycles !== null
                || activeFilters?.completedAssessment !== null
                            ? (
                                <Button
                                    name={undefined}
                                    onClick={() => {
                                        updateFilter('phase', null);
                                        updateFilter('id', null);
                                        updateFilter('region', null);
                                        updateFilter('completedAssessment', null);
                                        updateFilter('numberOfCycles', null);
                                        setActiveTab(0);
                                        setActivePhase(null);
                                    }}
                                    aria-label={strings.common.ariaLabels.resetFilterButton}
                                >
                                    {strings.common.buttons.resetFilter}
                                </Button>
                            ) : null
                    )}
                >
                    <div style={{ height: '470px' }}>
                        <PERMap
                            data={getFilteredMapData(activeFilters)}
                            onCountryClick={(id) => updateFilter('id', id)}
                            valueField="assessment_number"
                            tooltipTrigger="click"
                            enableClickToFilter
                            accessToken={mbtoken}
                            mapboxStyle={defaultMapStyle}
                            minRadius={4}
                            maxRadius={7}
                            scrollZoom={false}
                            onClick={(d) => updateFilter('id', d.id)}
                        />
                    </div>
                    <PERChartLegend
                        data={PHASE_COLORS}
                        onClick={handlePhaseClick}
                        activeIndex={activePhase}
                        activeField="phaseNumber"
                        layout="horizontal"
                    />
                </Container>

                <div className={styles.charts}>
                    <Container
                        heading={strings.perSummaryDashboard.containers.assessmentType.heading}
                        headerDescription={
                            strings.perSummaryDashboard.containers.assessmentType.description
                        }
                        withHeaderBorder
                        actions={activeFilters?.assessmentType !== null && (
                            <Button
                                name={undefined}
                                onClick={() => updateFilter('assessmentType', null)}
                                aria-label={strings.common.ariaLabels.resetFilterButton}
                            >
                                {strings.common.buttons.resetFilter}
                            </Button>
                        )}
                    >
                        <PERDonutChart
                            data={getRecordsByAssessmentType(activeFilters)}
                            height={210}
                            width={400}
                            cutout="70%"
                            tooltipEnabled
                            onClick={handleAssessmentTypeClick}
                            colors={['#236192', '#418FDE', '#009CDD', '#C6C6C6']}
                            activeRegion={activeFilters?.assessmentType}
                        />
                        <PERChartLegend
                            data={[
                                { label: 'Self assessment', color: '#236192' },
                                { label: 'Simulation', color: '#418FDE' },
                                { label: 'Operational', color: '#009CDD' },
                                { label: 'Post operational', color: '#C6C6C6' },
                            ]}
                            onClick={handleAssessmentTypeClick}
                            activeIndex={activeFilters?.assessmentType}
                            layout="horizontal"
                            clickable
                        />
                    </Container>

                    <Container
                        heading={strings.perSummaryDashboard.containers.yearAndRegion.heading}
                        headerDescription={
                            strings.perSummaryDashboard.containers.yearAndRegion.description
                        }
                        withHeaderBorder
                        actions={(
                            activeFilters?.region !== null
                            || activeFilters?.year !== null
                        ) && (
                            <Button
                                name={undefined}
                                onClick={() => {
                                    updateFilter('region', null);
                                    updateFilter('year', null);
                                }}
                                aria-label={strings.common.ariaLabels.resetFilterButton}
                            >
                                {strings.common.buttons.resetFilter}
                            </Button>
                        )}
                    >
                        <PERStackedBarChart
                            data={getStackedBarDataByYearAndRegion(activeFilters)}
                            onClick={handleRegionStackedClick}
                            categories={regionCategories}
                            height={250}
                            tooltipEnabled
                            showDataLabels={false}
                            activeRegion={activeFilters?.region}
                            activeYear={activeFilters?.year?.toString()}
                        />
                        <PERChartLegend
                            data={regionLegendCategories}
                            onClick={handleRegionStackedClick}
                            activeIndex={activeFilters?.region}
                            activeField="label"
                            layout="horizontal"
                            clickable
                        />
                    </Container>
                </div>

                <div className={styles.treemap}>
                    <Container
                        heading={
                            strings.perSummaryDashboard.containers.highPriorityComponents.heading
                        }
                        headerDescription={
                            strings
                                .perSummaryDashboard.containers.highPriorityComponents.description
                        }
                        withHeaderBorder
                        actions={activeFilters?.highPriorityComponent !== null && (
                            <Button
                                name={undefined}
                                onClick={() => {
                                    updateFilter('highPriorityComponent', null);
                                    updateFilter('highPriorityArea', null);
                                }}
                                aria-label={strings.common.ariaLabels.resetFilterButton}
                            >
                                {strings.common.buttons.resetFilter}
                            </Button>
                        )}
                    >
                        <PERTreemapChart
                            d={getComponentSummaryForTreemap(activeFilters)}
                            activeIndex={activeFilters?.highPriorityComponent}
                            onClick={handleHighPriorityComponentClick}
                        />
                    </Container>
                </div>

                <Container
                    heading={strings.perSummaryDashboard.containers.perConsiderations.heading}
                    headerDescription={
                        strings.perSummaryDashboard.containers.perConsiderations.description
                    }
                    withHeaderBorder
                    actions={(
                        activeFilters?.perConsiderations !== null
                        || activeFilters?.assessmentType !== null
                    ) && (
                        <Button
                            name={undefined}
                            onClick={() => {
                                updateFilter('perConsiderations', null);
                                updateFilter('assessmentType', null);
                            }}
                            aria-label={strings.common.ariaLabels.resetFilterButton}
                        >
                            {strings.common.buttons.resetFilter}
                        </Button>
                    )}
                >
                    <PERConsiderations
                        data={getPERConsiderations(activeFilters)}
                        onClickAssessmentType={handleAssessmentTypeClick}
                        onClickPER={(index) => updateFilter('perConsiderations', index)}
                        activeIndex={activeFilters?.assessmentType}
                        activePERFilter={activeFilters?.perConsiderations}
                    />
                </Container>
            </div>
        </>
    );
}

export default PERSummaryDashboard;
