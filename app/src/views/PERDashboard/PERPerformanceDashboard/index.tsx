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
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import { api } from '#config';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { resolveUrl } from '#utils/resolveUrl';

import {
    EMPTY_FILTERS,
    getLatestUpdate,
    getRegionLabel,
    normalizePerformanceData,
} from '../data';
import useJsonRequest from '../snapshot';
import {
    getPerformanceCycles,
    getPerformanceRatings,
    getPerformanceRegionData,
    getPerformanceSummary,
    type PerformanceFilterState,
} from './dataHandler';

import i18n from './i18n.json';
import styles from './styles.module.css';

function PERPerformanceDashboard() {
    const strings = useTranslation(i18n);
    const { api_region_name: regionOptions } = useGlobalEnums();
    const currentLanguage = useCurrentLanguage();
    const [activeFilters, setActiveFilters] = useState<PerformanceFilterState>(() => ({
        ...EMPTY_FILTERS,
        cycle: null,
    }));
    const dashboardDataUrl = resolveUrl(api, 'api/v2/per-dashboard-data');
    const {
        pending: dashboardDataPending,
        response: rawDashboardData,
        error: dashboardDataError,
    } = useJsonRequest<unknown>(dashboardDataUrl);
    const dashboardData = useMemo(
        () => normalizePerformanceData(rawDashboardData),
        [rawDashboardData],
    );
    const lastUpdate = useMemo(
        () => getLatestUpdate(
            Object.values(dashboardData.countryAssessments)
                .flat()
                .map((entry) => entry.updatedAt),
        ),
        [dashboardData],
    );
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
    const regionToggleData = useMemo(
        () => regionData.map((item) => ({
            ...item,
            displayName: getRegionLabel(item.name, regionOptions, currentLanguage),
        })),
        [currentLanguage, regionData, regionOptions],
    );
    const summary = useMemo(
        () => getPerformanceSummary(dashboardData, activeFilters),
        [activeFilters, dashboardData],
    );

    if (dashboardDataPending) {
        return (
            <Container
                className={styles.perPerformanceDashboard}
                aria-label={strings.performanceContainerAriaLabel}
            >
                <BlockLoading />
            </Container>
        );
    }

    if (dashboardDataError) {
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
            {isDefined(lastUpdate) && (
                <div className={styles.lastUpdate}>
                    {resolveToString(
                        strings.performanceLastUpdate,
                        { date: formatDate(lastUpdate) },
                    )}
                </div>
            )}
            <details className={styles.aboutDashboard}>
                <summary>{strings.performanceAboutDashboard}</summary>
                <p>{strings.performanceHeaderDescription}</p>
            </details>
            <div className={styles.content}>
                <PERRegionToggle
                    activeRegion={activeFilters?.region}
                    onRegionClick={handleRegionClick}
                    regions={regionToggleData}
                    precision={1}
                    showCount={false}
                />
                <Container
                    heading={strings.overviewHeading}
                    headerDescription={(
                        <span className={styles.filterHint}>
                            {strings.overviewDescription}
                        </span>
                    )}
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
