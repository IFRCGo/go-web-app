import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
  ASSESSMENT_COLORS,
  ASSESSMENT_TYPE_OPTIONS,
} from '../PERDashboard/constants';

import Container from '../Container';
import PERChartLegend from '../PERChartLegend';
import PERGaugeChart from '../PERGaugeChart';
import PERStackedHorizontalBarChart from '../PERStackedHorizontalBarChart';

import styles from './styles.module.css';

// Import icons
import epidemicIcon from './assets/epidemic.png';
import environmentIcon from './assets/environment.png';
import urbanIcon from './assets/urban.png';
import migrationIcon from './assets/migration.png';

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
  onClick: (index: string) => void;
  onClickPER: (key: string) => void;
}

function PERConsiderations({
  data,
  activeIndex,
  onClick,
  onClickPER,
}: Props) {
  // Calculate global maxValue across all charts
  const calculateGlobalMaxValue = (allData: ChartData[]): number => {
    return Math.max(
      ...allData
        .flatMap((chart) => chart)
        .map(
          (item) =>
            item.SelfAssessment +
            item.Simulation +
            item.PostOperational +
            item.Operational
        )
    );
  };

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
    migrationIcon
  ];
  
  const labels = ['EPI-ready', 'Climate-ready', 'Urban-ready', 'Migration-ready'];

  const key = [
    'epi_considerations',
    'climate_environmental_considerations',
    'urban_considerations',
    'migration_considerations',
  ];

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.perConsiderationsContainer}>
        {data.data.map((chartData, index) => (
          <div className={styles.column} key={index}>
            <PERGaugeChart
              title={`PER ${labels[index]} Considerations`}
              percentage={percentageArray[index]}
              icon={icons[index]}
              label={labels[index]}
              fontSize={12}
              gaugeColor="#236192"
              backgroundColor="#F2F2F2"
              transitionSpeed={1000}
              onClick={() => onClickPER(key[index])}
              width="100%"
            />

            <div className={styles.spacer} />

            {/* Conditionally render the title for the first column */}
            <div className={styles.stackedBarTitle}>
              {index === 0 ? 'By region & type' : ' '}
            </div>

            <PERStackedHorizontalBarChart
              data={chartData}
              maxValue={globalMaxValue}
              barColors={ASSESSMENT_COLORS}
              xAxisKey="name"
              barKeys={[
                'SelfAssessment',
                'Simulation',
                'PostOperational',
                'Operational',
              ]}
              transitionSpeed={1000}
            />
          </div>
        ))}
      </div>
      <PERChartLegend
        data={ASSESSMENT_TYPE_OPTIONS}
        activeIndex={activeIndex}
        onClick={(item) => onClick(item.label)}
        layout="horizontal"
      />
    </div>
  );
}

export default PERConsiderations;