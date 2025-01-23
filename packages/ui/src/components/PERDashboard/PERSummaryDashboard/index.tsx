import { useState, useEffect } from 'react';

import Button from '#components/Button';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import PERChartLegend from '#components/PERChartLegend';
import PERConsiderations from '#components/PERConsiderations';
import PERDonutChart from '#components/PERDonutChart';
import PERKPITabs from '#components/PERKPITabs';
import PERMap from '#components/PERMap';
import PERRegionToggle from '#components/PERRegionToggle';
import PERStackedBarChart from '#components/PERStackedBarChart';
import PERTreemapChart from '#components/PERTreemapChart';

const MAP_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/map-data.json';
const LAST_UPDATE_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/last-update.json';
const GITHUB_TOKEN = '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';

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
import styles from './styles.module.css';

interface Props {
  accessToken?: string;
  mapboxStyle?: string;
}

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

function PERSummaryDashboard(props: Props) {
    const {
        accessToken,
        mapboxStyle = 'mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0',
    } = props;

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
    const [mapData, setMapData] = useState<any>(null);
    const [lastUpdateData, setLastUpdateData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [mapResponse, lastUpdateResponse] = await Promise.all([
                    fetch(MAP_DATA_URL, {
                        headers: {
                            'Authorization': `Bearer ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3.raw'
                        }
                    }),
                    fetch(LAST_UPDATE_DATA_URL, {
                        headers: {
                            'Authorization': `Bearer ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3.raw'
                        }
                    }),
                ]);

                if (!mapResponse.ok || !lastUpdateResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [mapData, lastUpdateData] = await Promise.all([
                    mapResponse.json(),
                    lastUpdateResponse.json(),
                ]);

                setMapData(mapData);
                setLastUpdateData(lastUpdateData);
                initializeData(mapData, lastUpdateData);
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error(err);
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
            >
                <BlockLoading withoutBorder compact />
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                className={styles.perSummaryDashboard}
                contentClassName={styles.content}
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
                Last updated:
                {' '}
                {new Date(getLastUpdateDate()).toLocaleString()}
            </div>
            {/* <PERExportButton /> */}
            <div className={styles.headerDescription}>
                This dashboard contains a summary of National Societies around the world engaged in
                {' '}
                the Preparedness for Effective Response (PER) Approach.
                {' '}
                The visuals below show regional and country-level information on the number of
                {' '}
                National Societies engaged in the PER Approach, as well as the current phase of the
                {' '}
                PER Process the NS is in.
                {' '}
                It also includes information on the PER Components which have been identified as
                {' '}
                &apos;High Priority,&apos; indicating it requires improvement.
                {' '}
                Finally, this dashboard includes the types of PER assessments conducted and the
                {' '}
                year of the assessment by region. Several National Societies have gone through
                {' '}
                multiple cycles of the PER process, and evidence indicates that there have been
                {' '}
                improvements in NS preparedness and response capacity, which has been supported
                {' '}
                by the PER Approach.
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
                    heading="PER Global Distribution"
                    headerDescription="Click on a NS to filter"
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
                                    variant="secondary"
                                >
                                    Clear Filter
                                </Button>
                            ) : null
                    )}
                    withHeaderBorder
                >
                    <div style={{ height: '520px' }}>
                        <PERMap
                            data={getFilteredMapData(activeFilters)}
                            onCountryClick={(id) => updateFilter('id', id)}
                            valueField="assessment_number"
                            tooltipTrigger="click"
                            enableClickToFilter
                            accessToken={accessToken}
                            mapboxStyle={mapboxStyle}
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
                        heading="PER process by type of assessment"
                        headerDescription="Click on an assessment type to filter"
                        withHeaderBorder
                        actions={activeFilters?.assessmentType !== null && (
                            <Button
                                name={undefined}
                                onClick={() => updateFilter('assessmentType', null)}
                                variant="secondary"
                            >
                                Clear Filter
                            </Button>
                        )}
                    >
                        <PERDonutChart
                            data={getRecordsByAssessmentType(activeFilters)}
                            height={300}
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
                        heading="PER process by year and region"
                        headerDescription="Click on a year or region to filter"
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
                                variant="secondary"
                            >
                                Clear Filter
                            </Button>
                        )}
                    >
                        <PERStackedBarChart
                            data={getStackedBarDataByYearAndRegion(activeFilters)}
                            onClick={handleRegionStackedClick}
                            categories={regionCategories}
                            height={190}
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
                        heading="High priority components requiring strengthening"
                        headerDescription="Click on a component to filter"
                        withHeaderBorder
                        actions={activeFilters?.highPriorityComponent !== null && (
                            <Button
                                name={undefined}
                                onClick={() => {
                                    updateFilter('highPriorityComponent', null);
                                    updateFilter('highPriorityArea', null);
                                }}
                                variant="secondary"
                            >
                                Clear Filter
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
                    heading="PER Considerations"
                    headerDescription="Click on a PER consideration type to filter"
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
                            variant="secondary"
                        >
                            Clear Filter
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
