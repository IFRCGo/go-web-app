import React from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import PERChartLegend from '../PERChartLegend';
import PERGaugeChart from '../PERGaugeChart';
import PERStackedHorizontalBarChart from '../PERStackedHorizontalBarChart';
import environmentIcon from './assets/environment.png';
import epidemicIcon from './assets/epidemic.png';
import migrationIcon from './assets/migration.png';
import urbanIcon from './assets/urban.png';

import i18n from './i18n.json';
import styles from './styles.module.css';

// Assessment type colors
const ASSESSMENT_COLORS = {
    selfAssessment: '#236192',
    simulation: '#418FDE',
    operational: '#009CDD',
    postOperational: '#C6C6C6',
} as const;

// Assessment type options with labels and colors
// const ASSESSMENT_TYPE_OPTIONS = [
//     {
//         label: strings.assessmentTypes.selfAssessment,
//         color: ASSESSMENT_COLORS.selfAssessment,
//     },
//     {
//         label: strings.assessmentTypes.simulation,
//         color: ASSESSMENT_COLORS.simulation,
//     },
//     {
//         label: strings.assessmentTypes.operational,
//         color: ASSESSMENT_COLORS.operational,
//     },
//     {
//         label: strings.assessmentTypes.postOperational,
//         color: ASSESSMENT_COLORS.postOperational,
//     },
// ] as const;

interface PercentageData {
    epiPercentage: number;
    climatePercentage: number;
    urbanPercentage: number;
    migrationPercentage: number;
}

interface TotalsData {
    totalAssessments: number;
    totalEpiConsiderations: number;
    totalClimateConsiderations: number;
    totalUrbanConsiderations: number;
    totalMigrationConsiderations: number;
}

interface ChartDataItem {
    name: string;
    SelfAssessment: number;
    Simulation: number;
    PostOperational: number;
    Operational: number;
    [key: string]: string | number;
}

type ChartData = ChartDataItem[];

export interface Props {
    data: {
        percentages: PercentageData;
        totals: TotalsData;
        data: ChartData[];
    };
    activeIndex: string | number | null;
    onClickAssessmentType: (index: string) => void;
    onClickPER: (key: string) => void;
    activePERFilter?: string;
}

function PERConsiderations({
    data,
    activeIndex,
    onClickAssessmentType,
    onClickPER,
    activePERFilter,
}: Props) {
    const strings = useTranslation(i18n)?.strings;

    // Assessment type options with labels and colors
    const ASSESSMENT_TYPE_OPTIONS = [
        {
            label: strings?.considerationSelfAssessmentLabel ?? 'Self assessment',
            color: ASSESSMENT_COLORS.selfAssessment,
        },
        {
            label: strings?.considerationSimulationLabel ?? 'Simulation',
            color: ASSESSMENT_COLORS.simulation,
        },
        {
            label: strings?.considerationOperationalLabel ?? 'Operational',
            color: ASSESSMENT_COLORS.operational,
        },
        {
            label: strings?.considerationPostOperationalLabel ?? 'Post operational',
            color: ASSESSMENT_COLORS.postOperational,
        },
    ] as const;

    // Calculate global maxValue across all charts
    const calculateGlobalMaxValue = (allData: ChartData[]): number => Math.max(
        ...allData
            .flatMap((chart) => chart)
            .map(
                (item) => item.SelfAssessment
            + item.Simulation
            + item.PostOperational
            + item.Operational,
            ),
    );

    const percentageArray = [
        data.percentages.epiPercentage,
        data.percentages.climatePercentage,
        data.percentages.urbanPercentage,
        data.percentages.migrationPercentage,
    ];

    const globalMaxValue = calculateGlobalMaxValue(data.data);

    // Define icons and labels for each chart
    const icons = [
        epidemicIcon,
        environmentIcon,
        urbanIcon,
        migrationIcon,
    ];

    const labels = [
        strings?.considerations?.epiReady ?? 'EPI-ready',
        strings?.considerations?.climateReady ?? 'Climate-ready',
        strings?.considerations?.urbanReady ?? 'Urban-ready',
        strings?.considerations?.migrationReady ?? 'Migration-ready',
    ];

    const key = [
        'epi_considerations',
        'climate_environmental_considerations',
        'urban_considerations',
        'migration_considerations',
    ];

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.perConsiderationsContainer}>
                {data.data.map((chartData, index) => {
                    const currentKey = key[index];
                    const isActive = activePERFilter === currentKey;
                    // Only set inactive if there's an active filter and it's not this one
                    const isInactive = activePERFilter ? currentKey !== activePERFilter : false;

                    return (
                        <div
                            className={_cs(
                                styles.column,
                                isActive && styles.activeColumn,
                                isInactive && styles.inactiveColumn,
                            )}
                            key={`per-consideration-${currentKey}`}
                            aria-label={strings?.ariaLabels?.considerationColumn?.replace('{type}', labels[index]) ?? `PER consideration column for ${labels[index]}`}
                        >
                            <PERGaugeChart
                                title={strings?.chart?.title?.template?.replace('{type}', labels[index]) ?? `PER ${labels[index]} Considerations`}
                                percentage={percentageArray[index]}
                                icon={icons[index]}
                                label={labels[index]}
                                fontSize={12}
                                gaugeColor={isInactive ? '#C6C6C6' : '#236192'}
                                backgroundColor="#F2F2F2"
                                transitionSpeed={750}
                                onClick={() => onClickPER(currentKey)}
                                aria-label={strings?.ariaLabels?.gaugeChart?.replace('{type}', labels[index]) ?? `Gauge chart showing ${labels[index]} considerations`}
                            />

                            <div className={styles.spacer} />

                            {/* Conditionally render the title for the first column */}
                            <div className={styles.stackedBarTitle}>
                                {index === 0 ? strings?.chart?.byRegionAndType ?? 'By region & type' : ''}
                            </div>

                            <PERStackedHorizontalBarChart
                                data={chartData}
                                maxValue={globalMaxValue}
                                barColors={isInactive ? ['#C6C6C6', '#C6C6C6', '#C6C6C6', '#C6C6C6'] : Object.values(ASSESSMENT_COLORS)}
                                xAxisKey="name"
                                barKeys={[
                                    'SelfAssessment',
                                    'Simulation',
                                    'PostOperational',
                                    'Operational',
                                ]}
                                transitionSpeed={1000}
                                aria-label={strings?.ariaLabels?.stackedBarChart?.replace('{type}', labels[index]) ?? `Stacked bar chart showing ${labels[index]} considerations by region`}
                            />
                        </div>
                    );
                })}
            </div>
            <PERChartLegend
                data={ASSESSMENT_TYPE_OPTIONS}
                activeIndex={activeIndex}
                onClick={onClickAssessmentType}
                layout="horizontal"
            />
        </div>
    );
}

export default PERConsiderations;
