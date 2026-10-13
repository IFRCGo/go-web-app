import {
    PER_ASSESSMENT_TYPE_COLORS,
    PER_ASSESSMENT_TYPE_KEYS,
    type PERAssessmentTypeKey,
} from '@ifrc-go/ui';
import { type Language } from '@ifrc-go/ui/contexts';

import {
    REGION_AFRICA,
    REGION_AMERICAS,
    REGION_ASIA,
    REGION_EUROPE,
    REGION_MENA,
} from '#utils/constants';
import {
    PER_ASSESSMENT_TYPE_OPERATIONAL,
    PER_ASSESSMENT_TYPE_POST_OPERATIONAL,
    PER_ASSESSMENT_TYPE_SELF_ASSESSMENT,
    PER_ASSESSMENT_TYPE_SIMULATION,
    PER_PHASE_ACTION,
    PER_PHASE_ASSESSMENT,
    PER_PHASE_OVERVIEW,
    PER_PHASE_PRIORITIZATION,
    PER_PHASE_WORKPLAN,
} from '#utils/domain/per';

export const REGION_ORDER = [
    'Africa',
    'Americas',
    'Asia Pacific',
    'Europe',
    'MENA',
] as const;

export type RegionName = typeof REGION_ORDER[number];

// NOTE: The server translates `region_name` to the language of the request, so a
// region can only be identified reliably by its `region_id`.
const REGION_NAME_BY_ID: Record<number, RegionName> = {
    [REGION_AFRICA]: 'Africa',
    [REGION_AMERICAS]: 'Americas',
    [REGION_ASIA]: 'Asia Pacific',
    [REGION_EUROPE]: 'Europe',
    [REGION_MENA]: 'MENA',
};

function getRegionName(regionId: number | null): RegionName | null {
    // NOTE: Africa has the id 0, so a truthiness check would drop it
    if (regionId === null) {
        return null;
    }
    return REGION_NAME_BY_ID[regionId] ?? null;
}

export const PHASE_COLORS = [
    {
        phaseNumber: PER_PHASE_OVERVIEW,
        label: 'Orientation',
        color: '#A4BEDE',
    },
    {
        phaseNumber: PER_PHASE_ASSESSMENT,
        label: 'Assessment',
        color: '#009CDD',
    },
    {
        phaseNumber: PER_PHASE_PRIORITIZATION,
        label: 'Prioritisation & analysis',
        color: '#418FDE',
    },
    {
        phaseNumber: PER_PHASE_WORKPLAN,
        label: 'Workplan',
        color: '#236192',
    },
    {
        phaseNumber: PER_PHASE_ACTION,
        label: 'Action & accountability',
        color: '#1B365D',
    },
] as const;

interface EnumOption {
    key: number;
    value: string;
}

const REGION_ID_BY_NAME: Record<RegionName, number> = {
    Africa: REGION_AFRICA,
    Americas: REGION_AMERICAS,
    'Asia Pacific': REGION_ASIA,
    Europe: REGION_EUROPE,
    MENA: REGION_MENA,
};

// NOTE: `RegionName` is only an identifier. Use this to show the region to the user.
// `options` is `api_region_name` of `useGlobalEnums()`.
// English shows the short names of the dashboard (e.g. "MENA" instead of "Middle East &
// North Africa"), the other languages show the translated names of the server.
export function getRegionLabel(
    region: RegionName,
    options: readonly EnumOption[] | undefined,
    language: Language,
): string {
    if (language === 'en') {
        return region;
    }
    const regionId = REGION_ID_BY_NAME[region];
    return options?.find((option) => option.key === regionId)?.value ?? region;
}

// NOTE: The label of `PHASE_COLORS` is only the fallback. Use this to show the phase
// to the user. `options` is `per_perphases` of `useGlobalEnums()`
export function getPhaseLabel(
    phase: typeof PHASE_COLORS[number],
    options: readonly EnumOption[] | undefined,
): string {
    return options?.find((option) => option.key === phase.phaseNumber)?.value ?? phase.label;
}

export type AssessmentTypeKey = PERAssessmentTypeKey;

export const ASSESSMENT_TYPE_COLORS = PER_ASSESSMENT_TYPE_COLORS;

const ASSESSMENT_TYPE_KEY_BY_ID: Record<number, AssessmentTypeKey> = {
    [PER_ASSESSMENT_TYPE_SELF_ASSESSMENT]: 'SelfAssessment',
    [PER_ASSESSMENT_TYPE_SIMULATION]: 'Simulation',
    [PER_ASSESSMENT_TYPE_OPERATIONAL]: 'Operational',
    [PER_ASSESSMENT_TYPE_POST_OPERATIONAL]: 'PostOperational',
};

// NOTE: The assessment type is identified by its id. Its name is translated by the server
// (and cached by language), so it must never be used to tell the types apart.
export function assessmentTypeKey(typeOfAssessment: number | null): AssessmentTypeKey | null {
    if (typeOfAssessment === null) {
        return null;
    }
    return ASSESSMENT_TYPE_KEY_BY_ID[typeOfAssessment] ?? null;
}

export function isAssessmentTypeKey(value: string): value is AssessmentTypeKey {
    return PER_ASSESSMENT_TYPE_KEYS.some((key) => key === value);
}

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

export interface ProcessRecord {
    processId: number;
    countryId: number | null;
    countryName: string | null;
    nationalSocietyName: string | null;
    countryIso3: string | null;
    regionId: number | null;
    regionName: RegionName | null;
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
}

interface MapDataResponse {
    processes: ProcessRecord[];
}

export interface ComponentAssessment {
    assessmentId: number | null;
    assessmentNumber: number;
    countryId: number | null;
    countryName: string | null;
    countryIso3: string | null;
    regionId: number | null;
    regionName: RegionName | null;
    typeOfAssessment: number | null;
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
    regionName: RegionName | null;
    typeOfAssessment: number | null;
    typeOfAssessmentName: string | null;
    phase: number | null;
    phaseDisplay: string | null;
    updatedAt: string | null;
}

export interface PerformanceData {
    assessments: PerformanceComponent[];
    countryAssessments: Record<string, PerformanceCountryAssessment[]>;
}

export interface DashboardFilterState {
    countryId: number | null;
    region: RegionName | null;
    year: number | null;
    assessmentType: AssessmentTypeKey | null;
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

// NOTE: go-api sends snake_case keys (see `per/dashboard_data.py` in go-api). The only
// exception is the items of `prioritized_components`, which are camelCase.
function normalizePrioritizedComponent(value: unknown): PrioritizedComponent {
    const item = rawRecord(value);
    return {
        componentId: asNumber(item.componentId),
        componentTitle: asString(item.componentTitle),
        areaTitle: asString(item.areaTitle),
        description: asString(item.description),
    };
}

function normalizeProcessRecord(value: unknown): ProcessRecord | undefined {
    const item = rawRecord(value);
    const processId = asNumber(item.id);

    if (processId === null) {
        return undefined;
    }

    const regionId = asNumber(item.region_id);

    return {
        processId,
        countryId: asNumber(item.country_id),
        countryName: asString(item.country_name),
        nationalSocietyName: asString(item.national_society_name),
        countryIso3: asString(item.country_iso3),
        regionId,
        regionName: getRegionName(regionId),
        latitude: asNumber(item.latitude),
        longitude: asNumber(item.longitude),
        assessmentNumber: asNumber(item.assessment_number) ?? 0,
        dateOfAssessment: asString(item.date_of_assessment),
        createdAt: asString(item.created_at),
        updatedAt: asString(item.updated_at),
        phase: asNumber(item.phase),
        phaseDisplay: asString(item.phase_display),
        typeOfAssessment: asNumber(item.type_of_assessment),
        typeOfAssessmentName: asString(item.type_of_assessment_name),
        assessmentMethod: asString(item.assessment_method),
        prioritizedComponents: asArray(item.prioritized_components)
            .map(normalizePrioritizedComponent),
        epiConsiderations: asBooleanOrNull(item.epi_considerations),
        climateEnvironmentalConsiderations: asBooleanOrNull(
            item.climate_environmental_considerations,
        ),
        urbanConsiderations: asBooleanOrNull(item.urban_considerations),
        migrationConsiderations: asBooleanOrNull(item.migration_considerations),
    };
}

export function dateTimestamp(value: string | null): number {
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

export function groupByCountry(processes: ProcessRecord[]): Map<number, ProcessRecord[]> {
    const byCountry = new Map<number, ProcessRecord[]>();
    processes.forEach((process) => {
        if (process.countryId === null) {
            return;
        }
        const countryProcesses = byCountry.get(process.countryId) ?? [];
        countryProcesses.push(process);
        byCountry.set(process.countryId, countryProcesses);
    });
    return byCountry;
}

export function latestProcess(processes: ProcessRecord[]): ProcessRecord | undefined {
    return processes.reduce<ProcessRecord | undefined>(
        (latest, process) => (
            !latest || compareProcessRecency(process, latest) > 0 ? process : latest
        ),
        undefined,
    );
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
    return {
        processes: asArray(item.processes)
            .map(normalizeProcessRecord)
            .filter((process): process is ProcessRecord => process !== undefined),
    };
}

function normalizeComponentAssessment(value: unknown): ComponentAssessment {
    const item = rawRecord(value);
    const regionId = asNumber(item.region_id);
    return {
        assessmentId: asNumber(item.assessment_id),
        assessmentNumber: asNumber(item.assessment_number) ?? 0,
        countryId: asNumber(item.country_id),
        countryName: asString(item.country_name),
        countryIso3: asString(item.country_iso3),
        regionId,
        regionName: getRegionName(regionId),
        typeOfAssessment: asNumber(item.type_of_assessment),
        typeOfAssessmentName: asString(item.type_of_assessment_name),
        dateOfAssessment: asString(item.date_of_assessment),
        ratingValue: asNumber(item.rating_value),
        ratingTitle: asString(item.rating_title),
    };
}

function normalizePerformanceComponent(value: unknown): PerformanceComponent | undefined {
    const item = rawRecord(value);
    const componentId = asNumber(item.component_id);
    const componentNum = asNumber(item.component_num);
    if (componentId === null && componentNum === null) {
        return undefined;
    }

    return {
        componentId,
        componentNum,
        componentName: asString(item.component_name),
        areaId: asNumber(item.area_id),
        areaName: asString(item.area_name),
        assessments: asArray(item.assessments).map(normalizeComponentAssessment),
    };
}

function normalizeCountryAssessment(value: unknown): PerformanceCountryAssessment {
    const item = rawRecord(value);
    const regionId = asNumber(item.region_id);
    return {
        assessmentId: asNumber(item.assessment_id),
        assessmentNumber: asNumber(item.assessment_number) ?? 0,
        dateOfAssessment: asString(item.date_of_assessment),
        countryId: asNumber(item.country_id),
        countryName: asString(item.country_name),
        countryIso3: asString(item.country_iso3),
        regionId,
        regionName: getRegionName(regionId),
        typeOfAssessment: asNumber(item.type_of_assessment),
        typeOfAssessmentName: asString(item.type_of_assessment_name),
        phase: asNumber(item.phase),
        phaseDisplay: asString(item.phase_display),
        updatedAt: asString(item.updated_at),
    };
}

// NOTE: `countryAssessments` is camelCase in the server response, unlike the other keys
export function normalizePerformanceData(value: unknown): PerformanceData {
    const item = rawRecord(value);
    const assessments = asArray(item.assessments)
        .map(normalizePerformanceComponent)
        .filter((component): component is PerformanceComponent => component !== undefined);
    const countryAssessments = Object.fromEntries(
        Object.entries(rawRecord(item.countryAssessments)).map(([countryName, entries]) => [
            countryName,
            asArray(entries).map(normalizeCountryAssessment),
        ]),
    );

    return {
        assessments,
        countryAssessments,
    };
}

// NOTE: go-api has no "last updated" date for the PER data, the closest is the
// `updated_at` of the PER Overviews, which moves when an Overview is saved (e.g. on a
// phase change) but not when only an assessment is edited.
export function getLatestUpdate(updatedAts: Array<string | null>): string | undefined {
    return updatedAts.reduce<string | undefined>(
        (latest, updatedAt) => (
            updatedAt !== null && dateTimestamp(updatedAt) > dateTimestamp(latest ?? null)
                ? updatedAt
                : latest
        ),
        undefined,
    );
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
        && assessmentTypeKey(process.typeOfAssessment) !== filters.assessmentType
    ) {
        return false;
    }
    return true;
}

// NOTE: Orientation-only processes (phase 1) are numbered like any other process but
// have no assessment, so they must not count as a completed PER cycle.
function getCompletedCycleCount(processes: ProcessRecord[]): number {
    return Math.max(
        0,
        ...processes
            .filter((process) => (process.phase ?? 0) >= PER_PHASE_ASSESSMENT)
            .map((process) => process.assessmentNumber),
    );
}

function getMatchingCountryProcesses(
    processes: ProcessRecord[],
    filters: DashboardFilterState,
): ProcessRecord[] {
    const { consideration } = filters;
    if (
        filters.phaseCohort === 'orientation'
        && processes.some((process) => (process.phase ?? 0) >= PER_PHASE_ASSESSMENT)
    ) {
        return [];
    }
    if (
        filters.minimumCycles !== null
        && getCompletedCycleCount(processes) < filters.minimumCycles
    ) {
        return [];
    }

    let matchingProcesses = filters.highPriorityComponent === null
        ? processes
        : Array.from(latestProcessMap(processes).values()).filter((process) => (
            process.prioritizedComponents.some(
                (component) => component.componentTitle === filters.highPriorityComponent,
            )
        ));
    if (filters.phaseCohort === 'assessment') {
        matchingProcesses = matchingProcesses.filter(
            (process) => (process.phase ?? 0) >= PER_PHASE_ASSESSMENT,
        );
    } else if (filters.phaseCohort === 'action') {
        matchingProcesses = matchingProcesses.filter(
            (process) => (process.phase ?? 0) >= PER_PHASE_ACTION,
        );
    }
    if (consideration !== null) {
        matchingProcesses = matchingProcesses.filter(
            (process) => process[considerationField[consideration]] === true,
        );
    }
    return matchingProcesses;
}

export function selectFilteredDashboard(
    processes: ProcessRecord[],
    filters: DashboardFilterState = EMPTY_FILTERS,
): FilteredDashboardState {
    const baseProcesses = processes.filter((process) => matchesBaseFilters(process, filters));

    const eligibleCountryIds = new Set<number>();
    groupByCountry(baseProcesses).forEach((countryProcesses, countryId) => {
        const matchingProcesses = getMatchingCountryProcesses(countryProcesses, filters);
        if (matchingProcesses.length === 0) {
            return;
        }
        eligibleCountryIds.add(countryId);
    });

    const filteredProcesses = baseProcesses.filter(
        (process) => process.countryId !== null && eligibleCountryIds.has(process.countryId),
    );
    return {
        processes: filteredProcesses,
        countryIds: new Set(
            filteredProcesses
                .map((process) => process.countryId)
                .filter((countryId): countryId is number => countryId !== null),
        ),
        latestProcessByCountry: latestProcessMap(filteredProcesses),
    };
}

export function getPhaseColor(phase: number | null): string {
    return PHASE_COLORS.find((item) => item.phaseNumber === phase)?.color ?? '#CCCCCC';
}
