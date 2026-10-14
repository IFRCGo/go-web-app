import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import {
    PER_ASSESSMENT_TYPE_COLORS,
    PER_ASSESSMENT_TYPE_KEYS,
    PER_CONSIDERATION_GAUGE_COLOR,
    PER_INACTIVE_COLOR,
    type PERAssessmentTypeKey,
} from '../PERAssessmentPalette';
import PERChartLegend from '../PERChartLegend';
import PERGaugeChart from '../PERGaugeChart';
import PERStackedHorizontalBarChart from '../PERStackedHorizontalBarChart';
import environmentIcon from './assets/environment.png';
import epidemicIcon from './assets/epidemic.png';
import migrationIcon from './assets/migration.png';
import urbanIcon from './assets/urban.png';
import usePERAssessmentTypeLabels from './usePERAssessmentTypeLabels';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
    /** Key of the active assessment type */
    activeIndex: PERAssessmentTypeKey | null;
    onClickAssessmentType: (assessmentType: PERAssessmentTypeKey) => void;
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
    const strings = useTranslation(i18n);

    const assessmentTypeLabels = usePERAssessmentTypeLabels();
    // NOTE: `label` is the stable key that is used for filtering, `displayLabel` is translated
    const assessmentTypeOptions = PER_ASSESSMENT_TYPE_KEYS.map((assessmentType) => ({
        label: assessmentType,
        displayLabel: assessmentTypeLabels[assessmentType],
        color: PER_ASSESSMENT_TYPE_COLORS[assessmentType],
    }));

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

    const countArray = [
        data.totals.totalEpiConsiderations,
        data.totals.totalClimateConsiderations,
        data.totals.totalUrbanConsiderations,
        data.totals.totalMigrationConsiderations,
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
        strings.considerationEpiReady,
        strings.considerationClimateReady,
        strings.considerationUrbanReady,
        strings.considerationMigrationReady,
    ];

    const sinceYears = [2018, 2021, 2021, 2023];

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
                    // Only set inactive if there's an active filter and it's not this one
                    const isInactive = activePERFilter ? currentKey !== activePERFilter : false;

                    return (
                        <div
                            className={_cs(
                                styles.column,
                                isInactive && styles.inactiveColumn,
                            )}
                            key={`per-consideration-${currentKey}`}
                            aria-label={resolveToString(
                                strings.considerationColumnLabel,
                                { type: labels[index] },
                            )}
                        >
                            <PERGaugeChart
                                title={resolveToString(
                                    strings.considerationTitleTemplate,
                                    { type: labels[index] },
                                )}
                                subtitle={resolveToString(
                                    strings.considerationSinceYear,
                                    { year: sinceYears[index] },
                                )}
                                percentage={percentageArray[index]}
                                count={countArray[index]}
                                icon={icons[index]}
                                label={labels[index]}
                                gaugeColor={isInactive
                                    ? PER_INACTIVE_COLOR
                                    : PER_CONSIDERATION_GAUGE_COLOR}
                                backgroundColor="#F2F2F2"
                                transitionSpeed={750}
                                onClick={() => onClickPER(currentKey)}
                            />

                            <div className={styles.spacer} />

                            {/* Conditionally render the title for the first column */}
                            <div className={styles.stackedBarTitle}>
                                {index === 0 ? strings.considerationByRegionTypeLabel : ''}
                            </div>

                            <PERStackedHorizontalBarChart
                                data={chartData}
                                maxValue={globalMaxValue}
                                transitionSpeed={1000}
                            />
                        </div>
                    );
                })}
            </div>
            <PERChartLegend
                data={assessmentTypeOptions}
                activeIndex={activeIndex}
                onClick={(item) => {
                    const assessmentType = PER_ASSESSMENT_TYPE_KEYS.find(
                        (typeKey) => typeKey === item.label,
                    );
                    if (assessmentType) {
                        onClickAssessmentType(assessmentType);
                    }
                }}
                layout="horizontal"
            />
        </div>
    );
}

export default PERConsiderations;
