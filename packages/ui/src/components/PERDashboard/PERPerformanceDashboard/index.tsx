import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import PageContainer from '#components/PageContainer';
import PageHeader from '#components/PageHeader';
import PERAnalysis from '#components/PERAnalysis';
import PERRatingAnalysis from '#components/PERRatingAnalysis';
import PERRegionToggle from '#components/PERRegionToggle';

import {
    getComponentRatings,
    getCycles,
    getLastUpdateDate,
    groupDataByRegion,
    summarizeData,
} from './dataHandler';

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
        value: ActiveFilters[keyof ActiveFilters],
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
        <PageContainer
            className={_cs(styles.perPerformanceDashboard, className)}
        >
            <PageHeader
                heading="NS Preparedness and Response Capacity Strengthening (PER)"
                description={`
                    The National Society Preparedness for Effective Response (PER) Approach is a structured
                    and systematic way of interacting with the knowledge, capacity, systems, and processes
                    a National Society uses to respond to an emergency, fulfilling its mandate to meet the
                    needs of those most affected by disasters and crises with timely, relevant, and
                    effective humanitarian assistance.
                `}
            />
            <div className={styles.lastUpdate}>
                Last updated:
                {' '}
                {new Date(getLastUpdateDate()).toLocaleString()}
            </div>
            <div className={styles.content}>
                <PERRegionToggle
                    activeRegion={activeFilters?.region}
                    onRegionClick={handleRegionClick}
                    regions={groupDataByRegion()}
                    precision={1}
                    showCount={false}
                />
                <Container
                    heading="Performance Overview"
                    description="Detailed performance metrics and geographical distribution."
                    actions={activeFilters.cycle !== null ? (
                        <Button
                            name={undefined}
                            onClick={() => updateFilter('cycle', null)}
                        >
                            Reset Filter
                        </Button>
                    ) : undefined}
                >
                    <PERAnalysis
                        data={getCycles(activeFilters)}
                        summary={summarizeData(activeFilters, true)}
                        onCycleClick={handleCycleClick}
                        activeCycle={activeFilters.cycle}
                    />
                </Container>
                <Container
                    heading="PER Global Performance"
                    description="Overview of PER ratings and performance metrics."
                >
                    <PERRatingAnalysis
                        overallRating={ratings.overallRating}
                        areaData={ratings.areaData}
                        componentData={ratings.componentData}
                    />
                </Container>
            </div>
        </PageContainer>
    );
}

export default PERPerformanceDashboard;
