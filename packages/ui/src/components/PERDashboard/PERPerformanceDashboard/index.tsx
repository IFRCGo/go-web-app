import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
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

interface ActiveFilters {
  id: number | null;
  region: string | null;
  year: number | null;
  cycle: number | null;
}

function PERPerformanceDashboard() {
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
        <>
            <div className={styles.lastUpdate}>
                Last updated:
                {' '}
                {new Date(getLastUpdateDate()).toLocaleString()}
            </div>
            <div className={styles.headerDescription}>
                This dashboard contains a summary of the overall preparedness and response capacity
                among National Societies engaged in the PER Approach. The values presented represent
                the ratings for each component within National Societies&apos; PER Mechanism
                aggregated at global and regional levels. The visualizations
                show average rating, the capacity over time, as well as top and bottom-rated
                components. You can filter the components by region and cycle.
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
                    headerDescription="Click on a PER assessment cycle to filter"
                    className={_cs(styles.container, styles.perAnalysis)}
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
                    className={_cs(styles.container, styles.ratingAnalysis)}
                >
                    <PERRatingAnalysis
                        overallRating={ratings.overallRating}
                        areaData={ratings.areaData}
                        componentData={ratings.componentData}
                    />
                </Container>
            </div>
        </>
    );
}

export default PERPerformanceDashboard;
