import { useState, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import PERAnalysis from '#components/PERAnalysis';
import PERRatingAnalysis from '#components/PERRatingAnalysis';
import PERRegionToggle from '#components/PERRegionToggle';

const PER_DASHBOARD_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/per-dashboard-data.json';
const LAST_UPDATE_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/last-update.json';
const GITHUB_TOKEN = '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';

import {
    getComponentRatings,
    getCycles,
    getLastUpdateDate,
    groupDataByRegion,
    summarizeData,
    initializeData,
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

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [lastUpdateData, setLastUpdateData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [dashboardResponse, lastUpdateResponse] = await Promise.all([
                    fetch(PER_DASHBOARD_DATA_URL, {
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

                if (!dashboardResponse.ok || !lastUpdateResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [dashboardData, lastUpdateData] = await Promise.all([
                    dashboardResponse.json(),
                    lastUpdateResponse.json(),
                ]);

                setDashboardData(dashboardData);
                setLastUpdateData(lastUpdateData);
                initializeData(dashboardData, lastUpdateData);
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
                className={styles.perPerformanceDashboard}
                contentClassName={styles.content}
            >
                Loading...
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                className={styles.perPerformanceDashboard}
                contentClassName={styles.content}
            >
                {error}
            </Container>
        );
    }

    if (!dashboardData || !lastUpdateData) {
        return null;
    }

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
