import {
    useMemo,
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

import { api } from '#config';
import { resolveUrl } from '#utils/resolveUrl';

import {
    EMPTY_FILTERS,
    normalizeLastUpdate,
    normalizePerformanceData,
} from '../data';
import {
    getSnapshotUrl,
    STATIC_REVIEW_MODE,
    useJsonRequest,
} from '../snapshot';
import {
    getPerformanceCycles,
    getPerformanceRatings,
    getPerformanceRegionData,
    getPerformanceSummary,
    type PerformanceFilterState,
} from './dataHandler';

import i18n from './i18n.json';
import styles from './styles.module.css';

const LAST_UPDATE_DATA_URL = 'https://raw.githubusercontent.com/IFRCGo/ifrc-per-data-fetcher/refs/heads/main/data/last-update.json';

function formatLastUpdate(value: string): string {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? value : dateValue.toLocaleString();
}

function PERPerformanceDashboard() {
    const strings = useTranslation(i18n);
    const [activeFilters, setActiveFilters] = useState<PerformanceFilterState>(() => ({
        ...EMPTY_FILTERS,
        cycle: null,
    }));
    const dashboardDataUrl = STATIC_REVIEW_MODE
        ? getSnapshotUrl('per-dashboard-data.json')
        : resolveUrl(api, 'api/v2/per-dashboard-data');
    const lastUpdateUrl = STATIC_REVIEW_MODE
        ? getSnapshotUrl('snapshot.json')
        : LAST_UPDATE_DATA_URL;
    const {
        pending: dashboardDataPending,
        response: rawDashboardData,
        error: dashboardDataError,
    } = useJsonRequest<unknown>(dashboardDataUrl);
    const {
        pending: lastUpdatePending,
        response: rawLastUpdate,
        error: lastUpdateError,
    } = useJsonRequest<unknown>(lastUpdateUrl);
    const dashboardData = useMemo(
        () => normalizePerformanceData(rawDashboardData),
        [rawDashboardData],
    );
    const lastUpdate = useMemo(() => normalizeLastUpdate(rawLastUpdate), [rawLastUpdate]);
    const cycleData = useMemo(
        () => getPerformanceCycles(dashboardData, activeFilters),
        [activeFilters, dashboardData],
    );
    const ratings = useMemo(
        () => getPerformanceRatings(dashboardData, activeFilters),
        [activeFilters, dashboardData],
    );
    const regionData = useMemo(
        () => getPerformanceRegionData(dashboardData, activeFilters),
        [activeFilters, dashboardData],
    );
    const summary = useMemo(
        () => getPerformanceSummary(dashboardData, activeFilters),
        [activeFilters, dashboardData],
    );

    if (dashboardDataPending || (STATIC_REVIEW_MODE && lastUpdatePending)) {
        return (
            <Container
                className={styles.perPerformanceDashboard}
                aria-label={strings.performanceContainerAriaLabel}
            >
                <BlockLoading />
            </Container>
        );
    }

    if (dashboardDataError || (STATIC_REVIEW_MODE && lastUpdateError)) {
        return (
            <Container
                className={styles.perPerformanceDashboard}
                aria-label={strings.performanceContainerAriaLabel}
            >
                {strings.performanceFetchFailedError}
            </Container>
        );
    }

    const updateFilter = <KEY extends keyof PerformanceFilterState>(
        filterType: KEY,
        value: PerformanceFilterState[KEY],
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
        updateFilter('region', region as PerformanceFilterState['region']);
    };

    return (
        <>
            <div className={styles.lastUpdate}>
                {strings.performanceLastUpdate}
                {' '}
                {formatLastUpdate(lastUpdate)}
            </div>
            <div className={styles.headerDescription}>
                {strings.performanceHeaderDescription}
            </div>
            <div className={styles.content}>
                <PERRegionToggle
                    activeRegion={activeFilters?.region}
                    onRegionClick={handleRegionClick}
                    regions={regionData}
                    precision={1}
                    showCount={false}
                />
                <Container
                    heading={strings.overviewHeading}
                    headerDescription={
                        strings.overviewDescription
                    }
                    className={_cs(styles.container, styles.perAnalysis)}
                    withHeaderBorder
                    headerActions={activeFilters.region !== null || activeFilters.cycle !== null ? (
                        <Button
                            name={undefined}
                            onClick={() => setActiveFilters({ ...EMPTY_FILTERS, cycle: null })}
                            aria-label={
                                strings.performanceResetFilterAriaLabel
                            }
                        >
                            {strings.performanceResetFilter}
                        </Button>
                    ) : undefined}
                >
                    <PERAnalysis
                        data={cycleData}
                        summary={summary}
                        onCycleClick={handleCycleClick}
                        activeCycle={activeFilters.cycle ?? undefined}
                    />
                </Container>
                <Container
                    heading={strings.globalRatingsHeading}
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
