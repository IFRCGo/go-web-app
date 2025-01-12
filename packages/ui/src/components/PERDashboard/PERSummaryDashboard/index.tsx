import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import PageContainer from '#components/PageContainer';
import PageHeader from '#components/PageHeader';
import PERChartLegend from '#components/PERChartLegend';
import PERConsiderations from '#components/PERConsiderations';
import PERDonutChart from '#components/PERDonutChart';
import PERExportButton from '#components/PERExportButton';
import PERKPITabs from '#components/PERKPITabs';
import PERMap from '#components/PERMap';
import PERRegionToggle from '#components/PERRegionToggle';
import PERStackedBarChart from '#components/PERStackedBarChart';
import PERTreemapChart from '#components/PERTreemapChart';

import { PHASE_COLORS } from '../constants';
import {
    getComponentSummaryForTreemap,
    getFilteredMapData,
    getFilterOptions,
    getKPIData,
    getLastUpdateDate,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
} from './dataHandler';
import { AssessmentType } from './types.js';

import styles from './styles.module.css';

interface Props {
  className?: string;
  accessToken?: string;
  mapboxStyle?: string;
}

interface ActiveFilters {
  id: number | null;
  region: string | null;
  assessmentType: AssessmentType | null;
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
        className,
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

    const updateFilter = (key: keyof ActiveFilters, value: any) => {
        setActiveFilters((prev) => ({
            ...prev,
            [key]: prev[key] === value ? null : value,
        }));
    };

    const regions = ['Africa', 'Americas', 'Asia Pacific', 'Europe', 'MENA'];
    const colors = {
        'Self assessment': 'var(--go-ui-color-primary)',
        Simulation: 'var(--go-ui-color-info)',
        Operational: 'var(--go-ui-color-success)',
        'Post operational': 'var(--go-ui-color-gray-40)',
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

    const regionLegendCategories = ['Africa', 'Americas', 'Asia Pacific', 'Europe', 'MENA'].map((region) => ({
        label: region,
        color: regionColors[region as keyof typeof regionColors],
    }));

    const handleRegionStackedClick = (item: { label: string; year?: string | number | null }) => {
        if (item.year) {
            updateFilter('year', Number(item.year));
        }
        if (item.label) {
            updateFilter('region', item.label);
        }
    };

    const handleYearClick = (year: string) => {
        updateFilter('year', Number(year));
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

    const handlePERClick = (item: string): void => {
        updateFilter('perConsiderations', item);
    };

    const handleHighPriorityComponentClick = (component: { area: string; component: string | null }) => {
        if (component) {
            updateFilter('highPriorityArea', component.area);
            updateFilter('highPriorityComponent', component.component);
        }
    };

    const handlePhaseClick = (item: { label: string; color: string; phaseNumber: number }) => {
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

    return (
        <PageContainer
            className={_cs(styles.perSummaryDashboard, className)}
        >
            <PageHeader
                heading="NS Preparedness and Response Capacity Strengthening (PER)"
                description="The National Society Preparedness for Effective Response (PER) Approach is a structured and systematic way of interacting with the knowledge, capacity, systems, and processes a National Society uses to respond to an emergency, fulfilling its mandate to meet the needs of those most affected by disasters and crises with timely, relevant, and effective humanitarian assistance."
            />
            <div className={styles.lastUpdate}>
                Last updated:
                {' '}
                {new Date(getLastUpdateDate()).toLocaleString()}
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
                        <>
                            <PERExportButton />
                            {(activeFilters?.phase !== null
                || activeFilters?.id !== null
                || activeFilters?.region !== null
                || activeFilters?.numberOfCycles !== null
                || activeFilters?.completedAssessment !== null) && (
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
                            )}
                        </>
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
                        actions={(activeFilters?.region !== null || activeFilters?.year !== null) && (
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
                            height={222}
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

                <Container
                    heading="PER Considerations"
                    headerDescription="Click on a PER consideration type to filter"
                    withHeaderBorder
                    actions={(activeFilters?.perConsiderations !== null || activeFilters?.assessmentType !== null) && (
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
                        onClickAssessmentType={(index) => handleAssessmentTypeClick({ label: index })}
                        onClickPER={(index) => updateFilter('perConsiderations', index)}
                        activeIndex={activeFilters?.assessmentType}
                    />
                </Container>
            </div>
        </PageContainer>
    );
}

export default PERSummaryDashboard;
