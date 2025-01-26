import {
    useEffect,
    useState,
} from 'react';
import {
    BlockLoading,
    Button,
    Container,
    PERAnalysis,
    PERRatingAnalysis,
    PERRegionToggle,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import {
    getComponentRatings,
    getCycles,
    getLastUpdateDate,
    groupDataByRegion,
    initializeData,
    summarizeData,
} from './dataHandler';

import i18n from '../i18n.json';
import styles from './styles.module.css';

const PER_DASHBOARD_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/per-dashboard-data.json';
const LAST_UPDATE_DATA_URL = 'https://api.github.com/repos/matthewsmawfield/ifrc-per-data-fetcher/contents/data/last-update.json';
const GITHUB_TOKEN = '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';

interface ActiveFilters {
    id: number | null;
    region: string | null;
    year: number | null;
    cycle: number | null;
}

function PERPerformanceDashboard() {
    const strings = useTranslation(i18n);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        id: null,
        region: null,
        year: null,
        cycle: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    interface DashboardData {
        assessments: Record<string, Component>;
    }
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [lastUpdateData, setLastUpdateData] = useState<AssessmentRecord[]| null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [dashboardResponse, lastUpdateResponse] = await Promise.all([
                    fetch(PER_DASHBOARD_DATA_URL, {
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

                if (!dashboardResponse.ok || !lastUpdateResponse.ok) {
                    throw new Error(strings.common.errors.fetchFailed);
                }

                const [dashboardData, lastUpdateData] = await Promise.all([
                    dashboardResponse.json(),
                    lastUpdateResponse.json(),
                ]);

                setDashboardData(dashboardData);
                setLastUpdateData(lastUpdateData);
                initializeData(dashboardData, lastUpdateData);
            } catch {
                setError(strings.common.errors.fetchFailed);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [strings.common.errors.fetchFailed]);

    if (isLoading) {
        return (
            <Container
                className={styles.perPerformanceDashboard}
                contentClassName={styles.loadingContainer}
                aria-label={strings.perPerformanceDashboard.ariaLabels.container}
            >
                <BlockLoading />
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                className={styles.perPerformanceDashboard}
                contentClassName={styles.content}
                aria-label={strings.perPerformanceDashboard.ariaLabels.container}
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
                {strings.common.lastUpdate.label}
                {' '}
                {new Date(getLastUpdateDate()).toLocaleString()}
            </div>
            <div className={styles.headerDescription}>
                {strings.perPerformanceDashboard.header.description}
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
                    heading={strings.perPerformanceDashboard.containers.overview.heading}
                    headerDescription={
                        strings.perPerformanceDashboard.containers.overview.description
                    }
                    className={_cs(styles.container, styles.perAnalysis)}
                    withHeaderBorder
                    actions={activeFilters.cycle !== null ? (
                        <Button
                            name={undefined}
                            onClick={() => updateFilter('cycle', null)}
                            aria-label={
                                strings.perPerformanceDashboard.ariaLabels.resetFilterButton
                            }
                        >
                            {strings.common.buttons.resetFilter}
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
                    heading={strings.perPerformanceDashboard.containers.globalRatings.heading}
                    description={
                        strings.perPerformanceDashboard.containers.globalRatings.description
                    }
                    withHeaderBorder
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
