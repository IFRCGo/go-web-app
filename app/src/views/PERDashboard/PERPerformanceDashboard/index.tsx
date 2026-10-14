import {
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    Description,
    ExpandableContainer,
    ListView,
    PERAnalysis,
    PERRatingAnalysis,
    PERRegionToggle,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { api } from '#config';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { resolveUrl } from '#utils/resolveUrl';

import {
    EMPTY_FILTERS,
    getLatestUpdate,
    getRegionLabel,
    normalizePerformanceData,
    REGION_ORDER,
} from '../data';
import useJsonRequest from '../useJsonRequest';
import {
    getPerformanceCycles,
    getPerformanceRatings,
    getTotalAssessments,
    type PerformanceFilterState,
} from './dataHandler';

import i18n from './i18n.json';

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
    const totalAssessments = useMemo(
        () => getTotalAssessments(dashboardData, activeFilters),
        [activeFilters, dashboardData],
    );

    const cycleChartData = {
        ...cycleData,
        cycles: cycleData.cycles.map((cycle) => ({
            ...cycle,
            cycle: resolveToString(
                strings.performanceCycleLabel,
                { cycleNumber: cycle.cycleNumber },
            ),
        })),
    };
    const regionToggleData = REGION_ORDER.map((name) => ({
        name,
        displayName: getRegionLabel(name, regionOptions, currentLanguage),
    }));

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
        <Container
            aria-label={strings.performanceContainerAriaLabel}
            headerDescription={isDefined(lastUpdate) ? resolveToString(
                strings.performanceLastUpdate,
                { date: formatDate(lastUpdate) },
            ) : undefined}
            pending={dashboardDataPending}
            errored={isDefined(dashboardDataError)}
            errorMessage={strings.performanceFetchFailedError}
        >
            <ListView layout="block">
                <ExpandableContainer heading={strings.performanceAboutDashboard}>
                    <Description>{strings.performanceHeaderDescription}</Description>
                </ExpandableContainer>
                <ListView
                    layout="block"
                    withBackground
                    withPadding
                >
                    <PERRegionToggle
                        activeRegion={activeFilters?.region}
                        onRegionClick={handleRegionClick}
                        regions={regionToggleData}
                    />
                    <Container
                        heading={strings.overviewHeading}
                        headerDescription={strings.overviewDescription}
                        withHeaderBorder
                        headerActions={(
                            activeFilters.region !== null || activeFilters.cycle !== null
                        ) && (
                            <Button
                                name={undefined}
                                onClick={() => setActiveFilters({ ...EMPTY_FILTERS, cycle: null })}
                            >
                                {strings.performanceClearAllFilters}
                            </Button>
                        )}
                    >
                        <PERAnalysis
                            data={cycleChartData}
                            summary={{
                                averageRating: ratings.overallRating.rating,
                                totalAssessments,
                            }}
                            onCycleClick={handleCycleClick}
                            activeCycle={activeFilters.cycle ?? undefined}
                        />
                    </Container>
                    <Container
                        heading={strings.globalRatingsHeading}
                        withHeaderBorder
                    >
                        <PERRatingAnalysis
                            overallRating={ratings.overallRating}
                            areaData={ratings.areaData}
                            componentData={ratings.componentData}
                        />
                    </Container>
                </ListView>
            </ListView>
        </Container>
    );
}

export default PERPerformanceDashboard;
