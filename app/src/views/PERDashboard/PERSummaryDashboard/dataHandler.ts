import { PER_ASSESSMENT_TYPE_KEYS } from '@ifrc-go/ui';

import { PER_PHASE_ACTION } from '#utils/domain/per';

import {
    AREA_COLORS,
    type AssessmentTypeKey,
    assessmentTypeKey,
    type DashboardFilterState,
    type FilteredDashboardState,
    getCompletedCycleCount,
    getPhaseColor,
    getProcessYear,
    groupByCountry,
    hasReachedAssessment,
    latestProcess,
    type ProcessRecord,
    REGION_ORDER,
    type RegionName,
    selectFilteredDashboard,
} from '../data';

export type SummaryKpiKey = 'total-engaged' | 'orientation' | 'assessment' | 'action' | 'completed';

interface SummaryKpi {
    key: SummaryKpiKey;
    value: number;
    color?: string;
}

interface SummaryChartDataItem {
    name: RegionName;
    SelfAssessment: number;
    Simulation: number;
    PostOperational: number;
    Operational: number;
    [key: string]: string | number;
}

interface SummaryConsiderationData {
    data: SummaryChartDataItem[][];
    totals: {
        totalAssessments: number;
        totalEpiConsiderations: number;
        totalClimateConsiderations: number;
        totalUrbanConsiderations: number;
        totalMigrationConsiderations: number;
    };
    percentages: {
        epiPercentage: number;
        climatePercentage: number;
        urbanPercentage: number;
        migrationPercentage: number;
    };
}

interface ComponentSummary {
    id: string;
    color: string;
    name: string;
    value?: number;
    children?: ComponentSummary[];
}

type MapProcessRecord = ProcessRecord & {
    color: string;
};

function emptySummaryChartData(): SummaryChartDataItem[] {
    return REGION_ORDER.map((region) => ({
        name: region,
        SelfAssessment: 0,
        Simulation: 0,
        PostOperational: 0,
        Operational: 0,
    }));
}

function countConsiderationByRegionAndType(
    processes: ProcessRecord[],
    field: 'epiConsiderations'
        | 'climateEnvironmentalConsiderations'
        | 'urbanConsiderations'
        | 'migrationConsiderations',
    introducedYear: number,
): {
    chart: SummaryChartDataItem[];
    count: number;
    processCount: number;
    eligibleProcessCount: number;
} {
    const chart = emptySummaryChartData();
    const chartByRegion = new Map(chart.map((item) => [item.name, item]));
    const readyByCountry = groupByCountry(processes.filter(
        (process) => hasReachedAssessment(process) && process[field] === true,
    ));
    readyByCountry.forEach((countryProcesses) => {
        const process = latestProcess(countryProcesses);
        if (!process) {
            return;
        }
        const type = assessmentTypeKey(process.typeOfAssessment);
        const regionItem = process.regionName ? chartByRegion.get(process.regionName) : undefined;
        if (type && regionItem) {
            regionItem[type] += 1;
        }
    });

    const eligibleProcesses = processes.filter((process) => (
        hasReachedAssessment(process)
        && (getProcessYear(process) ?? Number.NEGATIVE_INFINITY) >= introducedYear
    ));
    const readyProcessCount = eligibleProcesses.filter(
        (process) => process[field] === true,
    ).length;

    return {
        chart,
        count: readyByCountry.size,
        processCount: readyProcessCount,
        eligibleProcessCount: eligibleProcesses.length,
    };
}

export function getKPIData(state: FilteredDashboardState): SummaryKpi[] {
    const countryProcesses = groupByCountry(state.processes);
    let orientation = 0;
    let assessment = 0;
    let action = 0;
    let completed = 0;

    countryProcesses.forEach((processes) => {
        if (!processes.some(hasReachedAssessment)) {
            orientation += 1;
        } else {
            assessment += 1;
        }
        if (processes.some((process) => (process.phase ?? 0) >= PER_PHASE_ACTION)) {
            action += 1;
        }
        if (getCompletedCycleCount(processes) >= 2) {
            completed += 1;
        }
    });

    return [
        {
            key: 'total-engaged',
            value: state.countryIds.size,
        },
        {
            key: 'orientation',
            value: orientation,
            color: '#A4BEDE',
        },
        {
            key: 'assessment',
            value: assessment,
            color: '#009CDD',
        },
        {
            key: 'action',
            value: action,
            color: '#1B365D',
        },
        {
            key: 'completed',
            value: completed,
            color: '#418FDE',
        },
    ];
}

export function getFilteredMapData(state: FilteredDashboardState): MapProcessRecord[] {
    return Array.from(state.latestProcessByCountry.values()).map((process) => ({
        ...process,
        color: getPhaseColor(process.phase),
    }));
}

export function getRecordsByRegion(
    state: FilteredDashboardState,
): Array<{ name: RegionName; count: number }> {
    const counts = new Map(REGION_ORDER.map((region) => [region, 0]));
    state.latestProcessByCountry.forEach((process) => {
        if (process.regionName && counts.has(process.regionName as typeof REGION_ORDER[number])) {
            const region = process.regionName as typeof REGION_ORDER[number];
            counts.set(region, counts.get(region)! + 1);
        }
    });
    return REGION_ORDER.map((region) => ({
        name: region,
        count: counts.get(region) ?? 0,
    }));
}

// NOTE: The region filter is left out, so selecting a region keeps the counts of the
// other regions visible
export function getRegionToggleCounts(
    processes: ProcessRecord[],
    filters: DashboardFilterState,
): Array<{ name: RegionName; count: number }> {
    return getRecordsByRegion(selectFilteredDashboard(processes, { ...filters, region: null }));
}

// NOTE: `label` is the stable assessment type key, translate it only when showing it
export function getRecordsByAssessmentType(
    state: FilteredDashboardState,
): Array<{ label: AssessmentTypeKey; count: number }> {
    const counts = new Map<AssessmentTypeKey, number>(
        PER_ASSESSMENT_TYPE_KEYS.map((key) => [key, 0]),
    );
    state.processes
        .filter(hasReachedAssessment)
        .forEach((process) => {
            const type = assessmentTypeKey(process.typeOfAssessment);
            if (type !== null) {
                counts.set(type, (counts.get(type) ?? 0) + 1);
            }
        });
    return PER_ASSESSMENT_TYPE_KEYS.map((label) => ({
        label,
        count: counts.get(label) ?? 0,
    }));
}

export function getStackedBarDataByYearAndRegion(
    state: FilteredDashboardState,
): Array<{ year: number; values: Record<string, number>; label: string }> {
    const byYear = new Map<number, Map<string, number>>();
    state.processes.forEach((process) => {
        const year = getProcessYear(process);
        if (year === null || process.regionName === null || process.countryId === null) {
            return;
        }
        const regionCounts = byYear.get(year) ?? new Map(
            REGION_ORDER.map((region) => [region, 0]),
        );
        const count = regionCounts.get(process.regionName);
        if (count !== undefined) {
            regionCounts.set(process.regionName, count + 1);
        }
        byYear.set(year, regionCounts);
    });

    return Array.from(byYear.entries())
        .sort(([left], [right]) => left - right)
        .map(([year, regionCounts]) => ({
            year,
            label: String(year),
            values: Object.fromEntries(
                REGION_ORDER.map((region) => [region, regionCounts.get(region) ?? 0]),
            ),
        }));
}

export function getComponentSummaryForTreemap(
    state: FilteredDashboardState,
): ComponentSummary {
    const componentCounts = new Map<string, {
        areaName: string;
        componentName: string;
        count: number;
        color: string;
    }>();
    state.latestProcessByCountry.forEach((process) => {
        const seen = new Set<string>();
        process.prioritizedComponents.forEach((component) => {
            if (!component.componentTitle) {
                return;
            }
            const key = component.componentId === null
                ? component.componentTitle
                : String(component.componentId);
            if (seen.has(key)) {
                return;
            }
            seen.add(key);
            const areaName = component.areaTitle ?? 'Unknown';
            const componentKey = `${areaName}:${key}`;
            const current = componentCounts.get(componentKey);
            if (current) {
                current.count += 1;
            } else {
                componentCounts.set(componentKey, {
                    areaName,
                    componentName: component.componentTitle,
                    count: 1,
                    color: AREA_COLORS[areaName] ?? '#CCCCCC',
                });
            }
        });
    });

    const areas = new Map<string, ComponentSummary>();
    componentCounts.forEach((component) => {
        const area = areas.get(component.areaName) ?? {
            name: component.areaName,
            id: component.areaName,
            color: AREA_COLORS[component.areaName] ?? '#CCCCCC',
            children: [],
        };
        area.children!.push({
            name: component.componentName,
            id: `${component.areaName}-${component.componentName}`,
            value: component.count,
            color: component.color,
        });
        areas.set(component.areaName, area);
    });

    const children = Array.from(areas.values())
        .map((area) => ({
            ...area,
            children: area.children!.sort((left, right) => (right.value ?? 0) - (left.value ?? 0)),
        }))
        .sort((left, right) => (
            (right.children?.reduce((sum, child) => sum + (child.value ?? 0), 0) ?? 0)
            - (left.children?.reduce((sum, child) => sum + (child.value ?? 0), 0) ?? 0)
        ));

    return {
        name: 'Root',
        id: 'root',
        color: '#CCCCCC',
        children,
    };
}

export function getPERConsiderations(
    state: FilteredDashboardState,
): SummaryConsiderationData {
    const epi = countConsiderationByRegionAndType(
        state.processes,
        'epiConsiderations',
        2018,
    );
    const climate = countConsiderationByRegionAndType(
        state.processes,
        'climateEnvironmentalConsiderations',
        2021,
    );
    const urban = countConsiderationByRegionAndType(
        state.processes,
        'urbanConsiderations',
        2021,
    );
    const migration = countConsiderationByRegionAndType(
        state.processes,
        'migrationConsiderations',
        2023,
    );
    const percentage = (count: number, total: number) => (total > 0
        ? Math.floor((count / total) * 100)
        : 0);

    return {
        data: [epi.chart, climate.chart, urban.chart, migration.chart],
        totals: {
            totalAssessments: state.processes.filter(hasReachedAssessment).length,
            totalEpiConsiderations: epi.count,
            totalClimateConsiderations: climate.count,
            totalUrbanConsiderations: urban.count,
            totalMigrationConsiderations: migration.count,
        },
        percentages: {
            epiPercentage: percentage(epi.processCount, epi.eligibleProcessCount),
            climatePercentage: percentage(
                climate.processCount,
                climate.eligibleProcessCount,
            ),
            urbanPercentage: percentage(urban.processCount, urban.eligibleProcessCount),
            migrationPercentage: percentage(
                migration.processCount,
                migration.eligibleProcessCount,
            ),
        },
    };
}
