import { type Language } from '@ifrc-go/ui/contexts';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

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
import { type GoApiResponse } from '#utils/restRequest';

import {
    PER_ASSESSMENT_TYPE_COLORS,
    PER_ASSESSMENT_TYPE_KEYS,
    type PERAssessmentTypeKey,
} from './assessmentPalette';

export const REGION_ORDER = [
    'Africa',
    'Americas',
    'Asia Pacific',
    'Europe',
    'MENA',
] as const;

export type RegionName = typeof REGION_ORDER[number];

// NOTE: The server only sends the `region_id`. These names identify the regions in the
// dashboard; use `getRegionLabel` to show them to the user.
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

export interface EnumOption {
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

export function getProcessPhaseLabel(
    phaseNumber: number | null,
    options: readonly EnumOption[] | undefined,
): string | null {
    const phase = PHASE_COLORS.find((item) => item.phaseNumber === phaseNumber);
    return isDefined(phase) ? getPhaseLabel(phase, options) : null;
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

export type ConsiderationKey = 'epi' | 'climate' | 'urban' | 'migration';
export type PhaseCohort = 'orientation' | 'assessment' | 'action';

export interface PrioritizedComponent {
    componentId: number | null;
    componentTitle: string | null;
    areaTitle: string | null;
    areaNum: number | null;
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
    typeOfAssessment: number | null;
    assessmentMethod: string | null;
    prioritizedComponents: PrioritizedComponent[];
    epiConsiderations: boolean | null;
    climateEnvironmentalConsiderations: boolean | null;
    urbanConsiderations: boolean | null;
    migrationConsiderations: boolean | null;
}

interface MapData {
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
    dateOfAssessment: string | null;
    ratingValue: number | null;
    ratingTitle: string | null;
}

export interface PerformanceComponent {
    componentId: number;
    componentNum: number;
    componentLetter: string | null;
    isParent: boolean;
    componentName: string | null;
    areaId: number | null;
    areaNum: number | null;
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
    phase: number | null;
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

type MapDataResponse = GoApiResponse<'/api/v2/per-map-data'>;
type MapDataProcess = MapDataResponse['processes'][number];
type MapDataPrioritizedComponent = MapDataProcess['prioritized_components'][number];
type DashboardDataResponse = GoApiResponse<'/api/v2/per-dashboard-data'>;
type DashboardDataComponent = DashboardDataResponse['assessments'][number];
type DashboardDataComponentAssessment = DashboardDataComponent['assessments'][number];
type DashboardDataCountryAssessment = DashboardDataResponse['countryAssessments'][string][number];

// NOTE: The server sends an empty string when there is no value
function emptyToNull(value: string | null): string | null {
    return isTruthyString(value) ? value : null;
}

// NOTE: go-api sends snake_case keys (see `per/dashboard_data.py` in go-api), except for
// the items of `prioritized_components` and the `countryAssessments` key, which are camelCase.
function normalizePrioritizedComponent(item: MapDataPrioritizedComponent): PrioritizedComponent {
    return {
        componentId: item.componentId,
        componentTitle: item.componentTitle,
        areaTitle: item.areaTitle,
        areaNum: item.areaNum,
        description: item.description,
    };
}

function normalizeProcessRecord(item: MapDataProcess): ProcessRecord {
    return {
        processId: item.id,
        countryId: item.country_id,
        countryName: item.country_name,
        nationalSocietyName: emptyToNull(item.national_society_name),
        countryIso3: item.country_iso3,
        regionId: item.region_id,
        regionName: getRegionName(item.region_id),
        latitude: item.latitude,
        longitude: item.longitude,
        assessmentNumber: item.assessment_number,
        dateOfAssessment: item.date_of_assessment,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        phase: item.phase,
        typeOfAssessment: item.type_of_assessment,
        assessmentMethod: item.assessment_method,
        prioritizedComponents: item.prioritized_components.map(normalizePrioritizedComponent),
        epiConsiderations: item.epi_considerations,
        climateEnvironmentalConsiderations: item.climate_environmental_considerations,
        urbanConsiderations: item.urban_considerations,
        migrationConsiderations: item.migration_considerations,
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

export function normalizeMapData(response: MapDataResponse | undefined): MapData {
    return {
        processes: (response?.processes ?? []).map(normalizeProcessRecord),
    };
}

function normalizeComponentAssessment(
    item: DashboardDataComponentAssessment,
): ComponentAssessment {
    return {
        assessmentId: item.assessment_id,
        assessmentNumber: item.assessment_number ?? 0,
        countryId: item.country_id,
        countryName: item.country_name,
        countryIso3: item.country_iso3,
        regionId: item.region_id,
        regionName: getRegionName(item.region_id),
        typeOfAssessment: item.type_of_assessment,
        dateOfAssessment: item.date_of_assessment,
        ratingValue: item.rating_value,
        ratingTitle: item.rating_title,
    };
}

function normalizePerformanceComponent(item: DashboardDataComponent): PerformanceComponent {
    return {
        componentId: item.component_id,
        componentNum: item.component_num,
        componentLetter: emptyToNull(item.component_letter),
        isParent: item.is_parent,
        componentName: item.component_name,
        areaId: item.area_id,
        areaNum: item.area_num,
        areaName: item.area_name,
        assessments: item.assessments.map(normalizeComponentAssessment),
    };
}

function normalizeCountryAssessment(
    item: DashboardDataCountryAssessment,
): PerformanceCountryAssessment {
    return {
        assessmentId: item.assessment_id,
        assessmentNumber: item.assessment_number,
        dateOfAssessment: item.date_of_assessment,
        countryId: item.country_id,
        countryName: item.country_name,
        countryIso3: item.country_iso3,
        regionId: item.region_id,
        regionName: getRegionName(item.region_id),
        typeOfAssessment: item.type_of_assessment,
        phase: item.phase,
        updatedAt: item.updated_at,
    };
}

export function normalizePerformanceData(
    response: DashboardDataResponse | undefined,
): PerformanceData {
    return {
        assessments: (response?.assessments ?? []).map(normalizePerformanceComponent),
        countryAssessments: Object.fromEntries(
            Object.entries(response?.countryAssessments ?? {}).map(([countryName, entries]) => [
                countryName,
                entries.map(normalizeCountryAssessment),
            ]),
        ),
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
// have no assessment, so they must not count as a PER cycle.
export function hasReachedAssessment(process: { phase: number | null }): boolean {
    return (process.phase ?? 0) >= PER_PHASE_ASSESSMENT;
}

export function getCompletedCycleCount(processes: ProcessRecord[]): number {
    return Math.max(
        0,
        ...processes
            .filter(hasReachedAssessment)
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
        && processes.some(hasReachedAssessment)
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
        matchingProcesses = matchingProcesses.filter(hasReachedAssessment);
    } else if (filters.phaseCohort === 'action') {
        matchingProcesses = matchingProcesses.filter(
            (process) => (process.phase ?? 0) >= PER_PHASE_ACTION,
        );
    }
    if (consideration !== null) {
        // NOTE: A consideration ticked during Orientation is still an intention,
        // so it only counts once the process reached Assessment (as in the gauges)
        matchingProcesses = matchingProcesses.filter(
            (process) => hasReachedAssessment(process)
                && process[considerationField[consideration]] === true,
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
