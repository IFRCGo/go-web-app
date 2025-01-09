import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import PERContainer from '#components/PERContainer';
import PERAnalysis from '#components/PERAnalysis';
import PERRatingAnalysis from '#components/PERRatingAnalysis';
import PERRegionToggle from '#components/PERRegionToggle';

import {
  groupDataByRegion,
  getComponentRatings,
  summarizeData,
  getCycles,
} from './data/dataHandler.ts';

import styles from './styles.module.css';

interface Props {
  className?: string;
}

interface ActiveFilters {
  id: number | null;
  region: string | null;
  year: number | null;
  cycle: number | null;
}

function PERPerformanceDashboard(props: Props) {
  const { className } = props;

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    id: null,
    region: null,
    year: null,
    cycle: null,
  });

  const updateFilter = (
    filterType: keyof ActiveFilters,
    value: ActiveFilters[keyof ActiveFilters]
  ): void => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value,
    }));
  };

  const handleCycleClick = (cycle: number | null): void => {
    updateFilter('cycle', cycle);
  };

  const handleRegionClick = (region: string | null): void => {
    updateFilter('region', region);
  };

  const ratings = getComponentRatings(activeFilters, true);

  return (
    <div className={_cs(styles.perPerformanceDashboard, className)}>
      <div className={styles.header}>
        <div className={styles.lastUpdated}>
          Last updated: 15:54 02 Dec 2024
        </div>
        <div className={styles.headerBody}>
          <b>NS Preparedness and Response Capacity Strengthening (PER)</b>
          <br />
          <br />
          The National Society Preparedness for Effective Response (PER)
          Approach is a structured and systematic way of interacting with the
          knowledge, capacity, systems, and processes a National Society uses to
          respond to an emergency, fulfilling its mandate to meet the needs of
          those most affected by disasters and crises with timely, relevant, and
          effective humanitarian assistance.
        </div>
      </div>
      <div className={styles.content}>
        <PERRegionToggle
          activeRegion={activeFilters?.region}
          onRegionClick={handleRegionClick}
          regions={groupDataByRegion()}
          precision={1}
          showCount={false}
        />
        <PERContainer
          heading="Performance Overview"
          description="Detailed performance metrics and geographical distribution."
          actions={activeFilters.cycle !== null ? {
            children: 'Reset Filter',
            onClick: () => updateFilter('cycle', null),
          } : undefined}
        >
          <PERAnalysis 
            data={getCycles(activeFilters)} 
            summary={summarizeData(activeFilters, true)}
            onCycleClick={handleCycleClick}
            activeCycle={activeFilters.cycle}
          />
        </PERContainer>
        <PERContainer
          heading="PER Global Performance"
          description="Rating averages are based on the latest assessment of each NS"
        >
          <PERRatingAnalysis 
            overallRating={ratings.overall}
            areaData={ratings.areas}
            componentData={ratings.components}
          />
        </PERContainer>
      </div>
    </div>
  );
}

export default PERPerformanceDashboard;
