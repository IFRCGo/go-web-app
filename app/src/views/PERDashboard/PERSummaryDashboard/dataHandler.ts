import {
    AREA_COLORS,
    assessmentTypeKey,
    compareProcessRecency,
    type FilteredDashboardState,
    getPhaseColor,
    getProcessYear,
    type ProcessRecord,
    REGION_ORDER,
} from '../data';

export interface SummaryKpi {
    key: string;
    value: number;
    color?: string;
    description: string;
}

export interface SummaryChartDataItem {
    name: string;
    SelfAssessment: number;
    Simulation: number;
    PostOperational: number;
    Operational: number;
    [key: string]: string | number;
}

export interface SummaryConsiderationData {
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

export interface ComponentSummary {
    id: string;
    color: string;
    name: string;
    value?: number;
    children?: ComponentSummary[];
}

export type MapProcessRecord = ProcessRecord & {
    color: string;
};

function groupByCountry(processes: ProcessRecord[]): Map<number, ProcessRecord[]> {
    const result = new Map<number, ProcessRecord[]>();
    processes.forEach((process) => {
        if (process.countryId === null) {
            return;
        }
        const countryProcesses = result.get(process.countryId) ?? [];
        countryProcesses.push(process);
        result.set(process.countryId, countryProcesses);
    });
    return result;
}

function latestProcess(processes: ProcessRecord[]): ProcessRecord | undefined {
    return processes.reduce<ProcessRecord | undefined>(
        (latest, process) => (
            !latest || compareProcessRecency(process, latest) > 0 ? process : latest
        ),
        undefined,
    );
}

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
): {
    chart: SummaryChartDataItem[];
    count: number;
} {
    const chart = emptySummaryChartData();
    const chartByRegion = new Map(chart.map((item) => [item.name, item]));
    const processByCountry = groupByCountry(processes);
    let count = 0;

    processByCountry.forEach((countryProcesses) => {
        const eligibleProcesses = countryProcesses.filter(
            (process) => (process.phase ?? 0) >= 2 && process[field] === true,
        );
        const process = latestProcess(eligibleProcesses);
        if (!process) {
            return;
        }

        count += 1;
        const type = assessmentTypeKey(process.typeOfAssessmentName);
        const regionItem = process.regionName ? chartByRegion.get(process.regionName) : undefined;
        if (type && regionItem) {
            regionItem[type] += 1;
        }
    });

    return { chart, count };
}

export function getKPIData(state: FilteredDashboardState): SummaryKpi[] {
    const countryProcesses = groupByCountry(state.processes);
    let orientation = 0;
    let assessment = 0;
    let action = 0;
    let completed = 0;

    countryProcesses.forEach((processes) => {
        if (!processes.some((process) => (process.phase ?? 0) >= 2)) {
            orientation += 1;
        } else {
            assessment += 1;
        }
        if (processes.some((process) => (process.phase ?? 0) >= 5)) {
            action += 1;
        }
        if (Math.max(...processes.map((process) => process.assessmentNumber)) >= 2) {
            completed += 1;
        }
    });

    return [
        {
            key: 'total-engaged',
            value: state.countryIds.size,
            description: 'Total number of NS engaged in PER process',
        },
        {
            key: 'orientation',
            value: orientation,
            color: '#A4BEDE',
            description: 'Number of NS currently in initial Orientation phase',
        },
        {
            key: 'assessment',
            value: assessment,
            color: '#009CDD',
            description: 'Number of NS who completed or are in assessment phase',
        },
        {
            key: 'action',
            value: action,
            color: '#1B365D',
            description: 'Number of NS at Action & Accountability phase',
        },
        {
            key: 'completed',
            value: completed,
            color: '#418FDE',
            description: 'Number of NS completed 2+ cycles of PER process',
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
): Array<{ name: string; count: number }> {
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

export function getRecordsByAssessmentType(
    state: FilteredDashboardState,
): Array<{ label: string; count: number }> {
    const labels = [
        'Self assessment',
        'Simulation',
        'Operational',
        'Post operational',
    ] as const;
    const counts = new Map(labels.map((label) => [label, 0]));
    state.processes.forEach((process) => {
        const type = assessmentTypeKey(process.typeOfAssessmentName);
        let label: typeof labels[number] | null = null;
        if (type === 'SelfAssessment') {
            label = 'Self assessment';
        } else if (type === 'Simulation') {
            label = 'Simulation';
        } else if (type === 'Operational') {
            label = 'Operational';
        } else if (type === 'PostOperational') {
            label = 'Post operational';
        }
        if (label && counts.has(label as typeof labels[number])) {
            const typedLabel = label as typeof labels[number];
            counts.set(typedLabel, counts.get(typedLabel)! + 1);
        }
    });
    return labels.map((label) => ({
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
    const prioritizedByCountry = new Map<number, ProcessRecord>();
    state.processes.forEach((process) => {
        if (process.countryId === null || process.prioritizedComponents.length === 0) {
            return;
        }
        const current = prioritizedByCountry.get(process.countryId);
        if (!current || compareProcessRecency(process, current) > 0) {
            prioritizedByCountry.set(process.countryId, process);
        }
    });

    const componentCounts = new Map<string, {
        areaName: string;
        componentName: string;
        count: number;
        color: string;
    }>();
    prioritizedByCountry.forEach((process) => {
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
    const epi = countConsiderationByRegionAndType(state.processes, 'epiConsiderations');
    const climate = countConsiderationByRegionAndType(
        state.processes,
        'climateEnvironmentalConsiderations',
    );
    const urban = countConsiderationByRegionAndType(state.processes, 'urbanConsiderations');
    const migration = countConsiderationByRegionAndType(state.processes, 'migrationConsiderations');
    const totalAssessments = Array.from(groupByCountry(state.processes).values())
        .filter((processes) => processes.some((process) => (process.phase ?? 0) >= 2))
        .length;

    const percentage = (count: number) => (totalAssessments > 0
        ? Math.floor((count / totalAssessments) * 100)
        : 0);

    return {
        data: [epi.chart, climate.chart, urban.chart, migration.chart],
        totals: {
            totalAssessments,
            totalEpiConsiderations: epi.count,
            totalClimateConsiderations: climate.count,
            totalUrbanConsiderations: urban.count,
            totalMigrationConsiderations: migration.count,
        },
        percentages: {
            epiPercentage: percentage(epi.count),
            climatePercentage: percentage(climate.count),
            urbanPercentage: percentage(urban.count),
            migrationPercentage: percentage(migration.count),
        },
    };
}
