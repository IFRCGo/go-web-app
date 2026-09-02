import { PER_ASSESSMENT_TYPE_COLORS } from '@ifrc-go/ui';

export const REGION_ORDER = [
    'Africa',
    'Americas',
    'Asia Pacific',
    'Europe',
    'MENA',
] as const;

export type RegionName = typeof REGION_ORDER[number];

export function normalizeRegionName(value: unknown): RegionName | null {
    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '');
    if (normalized === 'africa') return 'Africa';
    if (normalized === 'americas') return 'Americas';
    if (normalized === 'asiapacific') return 'Asia Pacific';
    if (normalized === 'europe') return 'Europe';
    if (normalized === 'mena' || normalized === 'middleeastandnorthafrica') return 'MENA';
    return null;
}

export const PHASE_COLORS = [
    {
        phaseNumber: 1,
        label: 'Orientation',
        color: '#A4BEDE',
    },
    {
        phaseNumber: 2,
        label: 'Assessment',
        color: '#009CDD',
    },
    {
        phaseNumber: 3,
        label: 'Prioritisation & analysis',
        color: '#418FDE',
    },
    {
        phaseNumber: 4,
        label: 'Workplan',
        color: '#236192',
    },
    {
        phaseNumber: 5,
        label: 'Action & accountability',
        color: '#1B365D',
    },
] as const;

export const ASSESSMENT_TYPE_COLORS = PER_ASSESSMENT_TYPE_COLORS;

export const REGION_COLORS = {
    Africa: '#A4BEDE',
    Americas: '#009CDD',
    'Asia Pacific': '#418FDE',
    Europe: '#236192',
    MENA: '#1B365D',
} as const;

export const AREA_COLORS: Record<string, string> = {
    'Policy Strategy and Standards': '#8748b3',
    'Analysis and planning': '#ff8655',
    'Operations support': '#da283d',
    'Operational capacity': '#3478ec',
    Coordination: '#00B2A2',
};

export type ConsiderationKey = 'epi' | 'climate' | 'urban' | 'migration';
export type PhaseCohort = 'orientation' | 'assessment' | 'action';

export interface PrioritizedComponent {
    componentId: number | null;
    componentTitle: string | null;
    areaTitle: string | null;
    description: string | null;
}

export interface ComponentResponse {
    responseId: number | null;
    componentId: number | null;
    componentName: string | null;
    componentNum: number | null;
    areaId: number | null;
    areaName: string | null;
    ratingId: number | null;
    ratingValue: number | null;
    ratingTitle: string | null;
    urbanConsiderations: string | null;
    epiConsiderations: string | null;
    climateEnvironmentalConsiderations: string | null;
    migrationConsiderations: string | null;
    notes: string | null;
}

export interface ProcessRecord {
    processId: number;
    countryId: number | null;
    countryName: string | null;
    countryIso3: string | null;
    regionId: number | null;
    regionName: string | null;
    latitude: number | null;
    longitude: number | null;
    assessmentNumber: number;
    dateOfAssessment: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    phase: number | null;
    phaseDisplay: string | null;
    typeOfAssessment: number | null;
    typeOfAssessmentName: string | null;
    assessmentMethod: string | null;
    prioritizedComponents: PrioritizedComponent[];
    epiConsiderations: boolean | null;
    climateEnvironmentalConsiderations: boolean | null;
    urbanConsiderations: boolean | null;
    migrationConsiderations: boolean | null;
    components: ComponentResponse[];
}

export interface MapDataResponse {
    results: ProcessRecord[];
    processes: ProcessRecord[];
}

export interface ComponentAssessment {
    assessmentId: number | null;
    assessmentNumber: number;
    countryId: number | null;
    countryName: string | null;
    countryIso3: string | null;
    regionId: number | null;
    regionName: string | null;
    typeOfAssessmentName: string | null;
    dateOfAssessment: string | null;
    ratingValue: number | null;
    ratingTitle: string | null;
}

export interface PerformanceComponent {
    componentId: number | null;
    componentNum: number | null;
    componentName: string | null;
    areaId: number | null;
    areaName: string | null;
    assessments: ComponentAssessment[];
}

export interface PerformanceCountryAssessment {
    assessmentId: number | null;
    assessmentNumber: number;
    dateOfAssessment: string | null;
    countryId: number | null;
    countryName: string | null;
    countryIso3: string | null;
    regionId: number | null;
    regionName: string | null;
    typeOfAssessmentName: string | null;
    phase: number | null;
    phaseDisplay: string | null;
    components: ComponentResponse[];
}

export interface PerformanceData {
    assessments: PerformanceComponent[];
    countryAssessments: Record<string, PerformanceCountryAssessment[]>;
}

export interface DashboardFilterState {
    countryId: number | null;
    region: RegionName | null;
    year: number | null;
    assessmentType: string | null;
    phaseCohort: PhaseCohort | null;
    minimumCycles: number | null;
    consideration: ConsiderationKey | null;
    highPriorityComponent: string | null;
}

export const EMPTY_FILTERS: DashboardFilterState = {
    countryId: null,
    region: null,
    year: null,
    assessmentType: null,
    phaseCohort: null,
    minimumCycles: null,
    consideration: null,
    highPriorityComponent: null,
};

export interface FilteredDashboardState {
    processes: ProcessRecord[];
    countryIds: Set<number>;
    latestProcessByCountry: Map<number, ProcessRecord>;
}

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function asBooleanOrNull(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}

function rawRecord(value: unknown): RawRecord {
    return isRecord(value) ? value : {};
}

function normalizeComponentResponse(value: unknown): ComponentResponse | null {
    const item = rawRecord(value);
    const componentId = asNumber(item.componentId ?? item.component_id);
    const componentNum = asNumber(item.componentNum ?? item.component_num);

    if (componentId === null && componentNum === null) {
        return null;
    }

    return {
        responseId: asNumber(item.responseId ?? item.response_id),
        componentId,
        componentName: asString(item.componentName ?? item.component_name),
        componentNum,
        areaId: asNumber(item.areaId ?? item.area_id),
        areaName: asString(item.areaName ?? item.area_name),
        ratingId: asNumber(item.ratingId ?? item.rating_id),
        ratingValue: asNumber(item.ratingValue ?? item.rating_value),
        ratingTitle: asString(item.ratingTitle ?? item.rating_title),
        urbanConsiderations: asString(item.urbanConsiderations ?? item.urban_considerations),
        epiConsiderations: asString(item.epiConsiderations ?? item.epi_considerations),
        climateEnvironmentalConsiderations: asString(
            item.climateEnvironmentalConsiderations
            ?? item.climate_environmental_considerations,
        ),
        migrationConsiderations: asString(
            item.migrationConsiderations ?? item.migration_considerations,
        ),
        notes: asString(item.notes),
    };
}

function normalizePrioritizedComponent(value: unknown): PrioritizedComponent {
    const item = rawRecord(value);
    return {
        componentId: asNumber(item.componentId ?? item.component_id),
        componentTitle: asString(item.componentTitle ?? item.component_title),
        areaTitle: asString(item.areaTitle ?? item.area_title),
        description: asString(item.description),
    };
}

export function normalizeProcessRecord(value: unknown): ProcessRecord | undefined {
    const item = rawRecord(value);
    const processId = asNumber(item.processId ?? item.id);

    if (processId === null) {
        return undefined;
    }

    const latitude = asNumber(item.latitude ?? item.lat);
    const longitude = asNumber(item.longitude ?? item.lon);
    const components = asArray(item.components)
        .map(normalizeComponentResponse)
        .filter((component): component is ComponentResponse => component !== null);

    return {
        processId,
        countryId: asNumber(item.countryId ?? item.country_id),
        countryName: asString(item.countryName ?? item.country_name),
        countryIso3: asString(item.countryIso3 ?? item.country_iso3),
        regionId: asNumber(item.regionId ?? item.region_id),
        regionName: normalizeRegionName(item.regionName ?? item.region_name),
        latitude,
        longitude,
        assessmentNumber: asNumber(item.assessmentNumber ?? item.assessment_number) ?? 0,
        dateOfAssessment: asString(item.dateOfAssessment ?? item.date_of_assessment),
        createdAt: asString(item.createdAt ?? item.created_at),
        updatedAt: asString(item.updatedAt ?? item.updated_at),
        phase: asNumber(item.phase),
        phaseDisplay: asString(item.phaseDisplay ?? item.phase_display),
        typeOfAssessment: asNumber(item.typeOfAssessment ?? item.type_of_assessment),
        typeOfAssessmentName: asString(
            item.typeOfAssessmentName ?? item.type_of_assessment_name,
        ),
        assessmentMethod: asString(item.assessmentMethod ?? item.assessment_method),
        prioritizedComponents: asArray(item.prioritizedComponents ?? item.prioritized_components)
            .map(normalizePrioritizedComponent),
        epiConsiderations: asBooleanOrNull(
            item.epiConsiderations ?? item.epi_considerations,
        ),
        climateEnvironmentalConsiderations: asBooleanOrNull(
            item.climateEnvironmentalConsiderations
            ?? item.climate_environmental_considerations,
        ),
        urbanConsiderations: asBooleanOrNull(
            item.urbanConsiderations ?? item.urban_considerations,
        ),
        migrationConsiderations: asBooleanOrNull(
            item.migrationConsiderations ?? item.migration_considerations,
        ),
        components,
    };
}

function latestProcessMap(processes: ProcessRecord[]): Map<number, ProcessRecord> {
    const latest = new Map<number, ProcessRecord>();

    processes.forEach((process) => {
        if (process.countryId === null) {
            return;
        }

        const current = latest.get(process.countryId);
        if (!current || compareProcessRecency(process, current) > 0) {
            latest.set(process.countryId, process);
        }
    });

    return latest;
}

export function normalizeMapData(value: unknown): MapDataResponse {
    const item = rawRecord(value);
    const rawProcesses = asArray(item.processes);
    const rawResults = asArray(item.results);
    const processes = (rawProcesses.length > 0 ? rawProcesses : rawResults)
        .map(normalizeProcessRecord)
        .filter((process): process is ProcessRecord => process !== undefined);
    const results = rawResults
        .map(normalizeProcessRecord)
        .filter((process): process is ProcessRecord => process !== undefined);

    return {
        processes,
        results: results.length > 0 ? results : Array.from(latestProcessMap(processes).values()),
    };
}

function normalizeComponentAssessment(value: unknown): ComponentAssessment {
    const item = rawRecord(value);
    return {
        assessmentId: asNumber(item.assessmentId ?? item.assessment_id),
        assessmentNumber: asNumber(item.assessmentNumber ?? item.assessment_number) ?? 0,
        countryId: asNumber(item.countryId ?? item.country_id),
        countryName: asString(item.countryName ?? item.country_name),
        countryIso3: asString(item.countryIso3 ?? item.country_iso3),
        regionId: asNumber(item.regionId ?? item.region_id),
        regionName: normalizeRegionName(item.regionName ?? item.region_name),
        typeOfAssessmentName: asString(
            item.typeOfAssessmentName ?? item.type_of_assessment_name,
        ),
        dateOfAssessment: asString(item.dateOfAssessment ?? item.date_of_assessment),
        ratingValue: asNumber(item.ratingValue ?? item.rating_value),
        ratingTitle: asString(item.ratingTitle ?? item.rating_title),
    };
}

function normalizePerformanceComponent(value: unknown): PerformanceComponent | undefined {
    const item = rawRecord(value);
    const componentId = asNumber(item.componentId ?? item.component_id);
    const componentNum = asNumber(item.componentNum ?? item.component_num);
    if (componentId === null && componentNum === null) {
        return undefined;
    }

    return {
        componentId,
        componentNum,
        componentName: asString(item.componentName ?? item.component_name),
        areaId: asNumber(item.areaId ?? item.area_id),
        areaName: asString(item.areaName ?? item.area_name),
        assessments: asArray(item.assessments).map(normalizeComponentAssessment),
    };
}

function normalizeCountryAssessment(value: unknown): PerformanceCountryAssessment {
    const item = rawRecord(value);
    return {
        assessmentId: asNumber(item.assessmentId ?? item.assessment_id),
        assessmentNumber: asNumber(item.assessmentNumber ?? item.assessment_number) ?? 0,
        dateOfAssessment: asString(
            item.dateOfAssessment ?? item.date_of_assessment ?? item.date,
        ),
        countryId: asNumber(item.countryId ?? item.country_id),
        countryName: asString(item.countryName ?? item.country_name),
        countryIso3: asString(item.countryIso3 ?? item.country_iso3),
        regionId: asNumber(item.regionId ?? item.region_id),
        regionName: normalizeRegionName(item.regionName ?? item.region_name),
        typeOfAssessmentName: asString(
            item.typeOfAssessmentName ?? item.type_of_assessment_name,
        ),
        phase: asNumber(item.phase),
        phaseDisplay: asString(item.phaseDisplay ?? item.phase_display),
        components: asArray(item.components)
            .map(normalizeComponentResponse)
            .filter((component): component is ComponentResponse => component !== null),
    };
}

export function normalizePerformanceData(value: unknown): PerformanceData {
    const item = rawRecord(value);
    const rawAssessments = item.assessments;
    const componentValues = Array.isArray(rawAssessments)
        ? rawAssessments
        : Object.values(rawRecord(rawAssessments));
    const assessments = componentValues
        .map(normalizePerformanceComponent)
        .filter((component): component is PerformanceComponent => component !== undefined);
    const rawCountryAssessments = rawRecord(item.countryAssessments);
    const countryAssessments = Object.fromEntries(
        Object.entries(rawCountryAssessments).map(([countryName, entries]) => [
            countryName,
            asArray(entries).map(normalizeCountryAssessment),
        ]),
    );

    return {
        assessments,
        countryAssessments,
    };
}

export function normalizeLastUpdate(value: unknown): string {
    const item = rawRecord(value);
    return asString(item.lastUpdate ?? item.last_update ?? item.exportedAt) ?? 'N/A';
}

function dateTimestamp(value: string | null): number {
    if (value === null) {
        return Number.NEGATIVE_INFINITY;
    }

    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export function getProcessYear(process: ProcessRecord): number | null {
    const timestamp = dateTimestamp(process.dateOfAssessment);
    return Number.isFinite(timestamp) ? new Date(timestamp).getUTCFullYear() : null;
}

export function compareProcessRecency(left: ProcessRecord, right: ProcessRecord): number {
    return left.assessmentNumber - right.assessmentNumber
        || dateTimestamp(left.dateOfAssessment) - dateTimestamp(right.dateOfAssessment)
        || dateTimestamp(left.updatedAt) - dateTimestamp(right.updatedAt)
        || left.processId - right.processId;
}

const considerationField: Record<ConsiderationKey, keyof ProcessRecord> = {
    epi: 'epiConsiderations',
    climate: 'climateEnvironmentalConsiderations',
    urban: 'urbanConsiderations',
    migration: 'migrationConsiderations',
};

function matchesBaseFilters(process: ProcessRecord, filters: DashboardFilterState): boolean {
    if (filters.countryId !== null && process.countryId !== filters.countryId) {
        return false;
    }
    if (filters.region !== null && process.regionName !== filters.region) {
        return false;
    }
    if (filters.year !== null && getProcessYear(process) !== filters.year) {
        return false;
    }
    if (
        filters.assessmentType !== null
        && process.typeOfAssessmentName !== filters.assessmentType
    ) {
        return false;
    }
    return true;
}

function qualifiesCountry(
    processes: ProcessRecord[],
    filters: DashboardFilterState,
): boolean {
    const { consideration } = filters;
    if (filters.phaseCohort === 'orientation' && processes.some((process) => (process.phase ?? 0) >= 2)) {
        return false;
    }
    if (filters.phaseCohort === 'assessment' && !processes.some((process) => (process.phase ?? 0) >= 2)) {
        return false;
    }
    if (filters.phaseCohort === 'action' && !processes.some((process) => (process.phase ?? 0) >= 5)) {
        return false;
    }
    if (
        filters.minimumCycles !== null
        && Math.max(...processes.map((process) => process.assessmentNumber)) < filters.minimumCycles
    ) {
        return false;
    }
    if (
        consideration !== null
        && !processes.some((process) => process[considerationField[consideration]] === true)
    ) {
        return false;
    }
    if (
        filters.highPriorityComponent !== null
        && !processes.some((process) => process.prioritizedComponents.some(
            (component) => component.componentTitle === filters.highPriorityComponent,
        ))
    ) {
        return false;
    }
    return true;
}

function assertFilteredState(
    state: FilteredDashboardState,
    filters: DashboardFilterState,
) {
    if (!import.meta.env?.DEV || filters.countryId === null || state.processes.length === 0) {
        return;
    }

    if (
        state.countryIds.size > 1
        || state.processes.some((process) => process.countryId !== filters.countryId)
    ) {
        throw new Error('PER dashboard filter returned mixed country IDs');
    }

    const regions = new Set(
        state.processes
            .map((process) => process.regionName)
            .filter((region): region is string => region !== null),
    );
    if (regions.size !== 1) {
        throw new Error('PER dashboard filter returned mixed regions');
    }
}

export function selectFilteredDashboard(
    processes: ProcessRecord[],
    filters: DashboardFilterState = EMPTY_FILTERS,
): FilteredDashboardState {
    const baseProcesses = processes.filter((process) => matchesBaseFilters(process, filters));
    const byCountry = new Map<number, ProcessRecord[]>();
    baseProcesses.forEach((process) => {
        if (process.countryId === null) {
            return;
        }
        const countryProcesses = byCountry.get(process.countryId) ?? [];
        countryProcesses.push(process);
        byCountry.set(process.countryId, countryProcesses);
    });

    const hasSemanticFilter = filters.phaseCohort !== null
        || filters.minimumCycles !== null
        || filters.consideration !== null
        || filters.highPriorityComponent !== null;
    const eligibleCountryIds = new Set<number>();
    byCountry.forEach((countryProcesses, countryId) => {
        if (!hasSemanticFilter || qualifiesCountry(countryProcesses, filters)) {
            eligibleCountryIds.add(countryId);
        }
    });

    const filteredProcesses = baseProcesses.filter(
        (process) => process.countryId !== null && eligibleCountryIds.has(process.countryId),
    );
    const state: FilteredDashboardState = {
        processes: filteredProcesses,
        countryIds: new Set(
            filteredProcesses
                .map((process) => process.countryId)
                .filter((countryId): countryId is number => countryId !== null),
        ),
        latestProcessByCountry: latestProcessMap(filteredProcesses),
    };
    assertFilteredState(state, filters);
    return state;
}

export function getPhaseColor(phase: number | null): string {
    return PHASE_COLORS.find((item) => item.phaseNumber === phase)?.color ?? '#CCCCCC';
}

export function assessmentTypeKey(
    value: string | null,
): 'SelfAssessment' | 'Simulation' | 'Operational' | 'PostOperational' | null {
    if (value === null) {
        return null;
    }

    const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
    if (normalized === 'selfassessment') return 'SelfAssessment';
    if (normalized === 'simulation') return 'Simulation';
    if (normalized === 'operational') return 'Operational';
    if (normalized === 'postoperational') return 'PostOperational';
    return null;
}
