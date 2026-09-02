import type { PERRatingAnalysisProps } from '@ifrc-go/ui';

import {
    AREA_COLORS,
    type ComponentAssessment,
    type DashboardFilterState,
    type PerformanceComponent,
    type PerformanceCountryAssessment,
    type PerformanceData,
    REGION_ORDER,
} from '../data';

export type PerformanceFilterState = DashboardFilterState & {
    cycle: number | null;
};

type RatingStatus = PERRatingAnalysisProps['overallRating']['status'];
type RatingCycle = PERRatingAnalysisProps['overallRating']['cycleRatings'][number];

const RATING_SCALE_COLORS: Record<RatingStatus, string> = {
    "Doesn't exist": '#E0E3E7',
    'Partially exists': '#99A5B3',
    'Needs improvement': '#7D8B9D',
    'Good performing': '#4D617A',
    'High performing': '#011E41',
};

interface FlattenedComponentAssessment extends ComponentAssessment {
    componentId: number | null;
    componentNum: number | null;
    componentName: string | null;
    areaId: number | null;
    areaName: string | null;
}

interface ComponentRatingSummary {
    key: string;
    componentNum: number;
    componentName: string;
    areaName: string;
    areaId: number | null;
    rating: number;
    cycleRatings: RatingCycle[];
}

function dateTimestamp(value: string | null): number {
    if (value === null) {
        return Number.NEGATIVE_INFINITY;
    }
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function compareAssessmentRecency(
    left: ComponentAssessment,
    right: ComponentAssessment,
): number {
    return left.assessmentNumber - right.assessmentNumber
        || dateTimestamp(left.dateOfAssessment) - dateTimestamp(right.dateOfAssessment)
        || (left.assessmentId ?? -1) - (right.assessmentId ?? -1);
}

function componentKey(component: {
    componentId: number | null;
    componentNum: number | null;
}): number {
    // Components 14–28 are subcomponents of parent component 14. The
    // dashboard reports the 37 PER component buckets, so component_num is the
    // reporting identity rather than the database row ID.
    return component.componentNum ?? component.componentId ?? -1;
}

function ratingOrZero(assessment: Pick<ComponentAssessment, 'ratingValue'>): number {
    return assessment.ratingValue ?? 0;
}

function flattenComponentAssessments(data: PerformanceData): FlattenedComponentAssessment[] {
    return data.assessments.flatMap((component: PerformanceComponent) => (
        component.assessments.map((assessment) => ({
            ...assessment,
            componentId: component.componentId,
            componentNum: component.componentNum,
            componentName: component.componentName,
            areaId: component.areaId,
            areaName: component.areaName,
        }))
    ));
}

function deduplicateComponentAssessments(
    assessments: FlattenedComponentAssessment[],
): FlattenedComponentAssessment[] {
    const deduplicated = new Map<string, FlattenedComponentAssessment>();
    assessments.forEach((assessment) => {
        const assessmentKey = assessment.assessmentId === null
            ? [
                assessment.countryId,
                assessment.assessmentNumber,
                assessment.dateOfAssessment,
            ].join(':')
            : String(assessment.assessmentId);
        const key = `${componentKey(assessment)}:${assessmentKey}`;
        const current = deduplicated.get(key);
        if (
            !current
            || (current.ratingValue === null && assessment.ratingValue !== null)
            || (
                current.ratingValue !== null
                && assessment.ratingValue !== null
                && assessment.ratingValue > current.ratingValue
            )
        ) {
            deduplicated.set(key, assessment);
        }
    });
    return Array.from(deduplicated.values());
}

function matchesFilter(
    item: ComponentAssessment | PerformanceCountryAssessment,
    filters: PerformanceFilterState,
    includeCycle: boolean,
): boolean {
    if (filters.countryId !== null && item.countryId !== filters.countryId) {
        return false;
    }
    if (filters.region !== null && item.regionName !== filters.region) {
        return false;
    }
    if (
        filters.year !== null
        && (
            item.dateOfAssessment === null
            || getYear(item.dateOfAssessment) !== filters.year
        )
    ) {
        return false;
    }
    if (
        filters.assessmentType !== null
        && item.typeOfAssessmentName !== filters.assessmentType
    ) {
        return false;
    }
    if (includeCycle && filters.cycle !== null && item.assessmentNumber !== filters.cycle) {
        return false;
    }
    return true;
}

function getYear(value: string): number | null {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : new Date(timestamp).getUTCFullYear();
}

function allCountryAssessments(data: PerformanceData): PerformanceCountryAssessment[] {
    return Object.values(data.countryAssessments).flat();
}

function getRatingStatus(rating: number): RatingStatus {
    if (rating >= 4) return 'High performing';
    if (rating >= 3) return 'Good performing';
    if (rating >= 2) return 'Needs improvement';
    if (rating >= 1) return 'Partially exists';
    return "Doesn't exist";
}

function average(values: number[]): number {
    return values.length > 0
        ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
        : 0;
}

function latestByCountry(
    assessments: FlattenedComponentAssessment[],
): Map<number, FlattenedComponentAssessment> {
    const latest = new Map<number, FlattenedComponentAssessment>();
    assessments.forEach((assessment) => {
        if (assessment.countryId === null) {
            return;
        }
        const current = latest.get(assessment.countryId);
        if (!current || compareAssessmentRecency(assessment, current) > 0) {
            latest.set(assessment.countryId, assessment);
        }
    });
    return latest;
}

function cycleRating(
    assessments: FlattenedComponentAssessment[],
    cycle: number,
): number {
    return average(
        assessments
            .filter((assessment) => assessment.assessmentNumber === cycle)
            .map(ratingOrZero),
    );
}

function buildComponentRating(
    assessments: FlattenedComponentAssessment[],
): ComponentRatingSummary | undefined {
    const sample = assessments.find(
        (assessment) => assessment.componentName !== null && assessment.areaName !== null,
    );
    if (!sample || sample.componentName === null || sample.areaName === null) {
        return undefined;
    }

    const latest = latestByCountry(assessments);
    const cycles = Array.from(new Set(
        assessments.map((assessment) => assessment.assessmentNumber),
    )).sort((left, right) => left - right);
    return {
        key: String(componentKey(sample)),
        componentNum: sample.componentNum ?? sample.componentId ?? 0,
        componentName: sample.componentName,
        areaName: sample.areaName,
        areaId: sample.areaId,
        rating: average(
            Array.from(latest.values())
                .map(ratingOrZero),
        ),
        cycleRatings: cycles.map((cycle) => {
            const rating = cycleRating(assessments, cycle);
            return {
                cycle: String(cycle),
                rating,
                color: RATING_SCALE_COLORS[getRatingStatus(rating)],
            };
        }),
    };
}

function changeFor(cycles: RatingCycle[]): number {
    if (cycles.length < 2) {
        return 0;
    }
    const previous = cycles[cycles.length - 2]?.rating ?? 0;
    const current = cycles[cycles.length - 1]?.rating ?? 0;
    return Number((current - previous).toFixed(2));
}

function withChange<T extends { cycleRatings: RatingCycle[] }>(value: T) {
    const change = changeFor(value.cycleRatings);
    return {
        ...value,
        change,
        changeDirection: change >= 0 ? 'up' as const : 'down' as const,
    };
}

export function getPerformanceRatings(
    data: PerformanceData,
    filters: PerformanceFilterState,
): PERRatingAnalysisProps {
    const filtered = deduplicateComponentAssessments(flattenComponentAssessments(data))
        .filter((assessment) => matchesFilter(assessment, filters, true));
    const byComponent = new Map<number, FlattenedComponentAssessment[]>();
    filtered.forEach((assessment) => {
        const key = componentKey(assessment);
        const values = byComponent.get(key) ?? [];
        values.push(assessment);
        byComponent.set(key, values);
    });
    const components = Array.from(byComponent.values())
        .map(buildComponentRating)
        .filter((component): component is ComponentRatingSummary => component !== undefined)
        .sort((left, right) => left.componentNum - right.componentNum);

    const byArea = new Map<string, ComponentRatingSummary[]>();
    components.forEach((component) => {
        const values = byArea.get(component.areaName) ?? [];
        values.push(component);
        byArea.set(component.areaName, values);
    });
    const areas = Array.from(byArea.entries()).map(([name, areaComponents]) => {
        const cycles = Array.from(new Set(
            areaComponents.flatMap((component) => (
                component.cycleRatings.map((cycle) => cycle.cycle)
            )),
        )).sort((left, right) => Number(left) - Number(right));
        const cycleRatings = cycles.map((cycle) => {
            const values = areaComponents
                .flatMap((component) => component.cycleRatings)
                .filter((item) => item.cycle === cycle)
                .map((item) => item.rating);
            const rating = average(values);
            return {
                cycle,
                rating,
                color: RATING_SCALE_COLORS[getRatingStatus(rating)],
            };
        });
        return withChange({
            type: 'area' as const,
            name,
            rating: average(areaComponents.map((component) => component.rating)),
            status: getRatingStatus(average(areaComponents.map((component) => component.rating))),
            cycleRatings,
            areaColor: AREA_COLORS[name] ?? '#000000',
        });
    });

    const overallCycles = Array.from(new Set(
        components.flatMap((component) => component.cycleRatings.map((cycle) => cycle.cycle)),
    )).sort((left, right) => Number(left) - Number(right));
    const overallCycleRatings = overallCycles.map((cycle) => {
        const values = components
            .flatMap((component) => component.cycleRatings)
            .filter((item) => item.cycle === cycle)
            .map((item) => item.rating);
        const rating = average(values);
        return {
            cycle,
            rating,
            color: RATING_SCALE_COLORS[getRatingStatus(rating)],
        };
    });
    const overallRating = average(components.map((component) => component.rating));
    const overall = withChange({
        rating: overallRating,
        status: getRatingStatus(overallRating),
        cycleRatings: overallCycleRatings,
        color: RATING_SCALE_COLORS[getRatingStatus(overallRating)],
    });

    return {
        overallRating: overall,
        areaData: areas,
        componentData: components.map((component) => withChange({
            type: 'component' as const,
            key: component.key,
            id: component.componentNum,
            name: component.componentName,
            rating: component.rating,
            status: getRatingStatus(component.rating),
            cycleRatings: component.cycleRatings,
            areaColor: AREA_COLORS[component.areaName] ?? '#000000',
        })),
    };
}

export function getPerformanceSummary(
    data: PerformanceData,
    filters: PerformanceFilterState,
): {
    averageRating: number;
    assessmentsWithComponentResponses: number;
} {
    const assessmentsWithComponentResponses = new Set(
        flattenComponentAssessments(data)
            .filter((assessment) => matchesFilter(assessment, filters, true))
            .map((assessment) => (
                assessment.assessmentId === null
                    ? [
                        assessment.countryId,
                        assessment.assessmentNumber,
                        assessment.dateOfAssessment,
                    ].join(':')
                    : String(assessment.assessmentId)
            )),
    ).size;
    return {
        averageRating: getPerformanceRatings(data, filters).overallRating.rating,
        assessmentsWithComponentResponses,
    };
}

function getCycleRating(
    assessments: FlattenedComponentAssessment[],
    cycle: number,
): number {
    const byComponent = new Map<number, FlattenedComponentAssessment[]>();
    assessments.forEach((assessment) => {
        if (assessment.assessmentNumber !== cycle) {
            return;
        }
        const key = componentKey(assessment);
        const values = byComponent.get(key) ?? [];
        values.push(assessment);
        byComponent.set(key, values);
    });
    return average(
        Array.from(byComponent.values())
            .map((values) => average(values.map(ratingOrZero))),
    );
}

export function getPerformanceCycles(
    data: PerformanceData,
    filters: PerformanceFilterState,
): {
    total_cycles: number;
    cycles: Array<{
        cycle: string;
        cycleNumber: number;
        completed: number;
        inProgress: number;
        rating: number;
        totalNS: number;
        ratingChange: number;
    }>;
} {
    const entries = allCountryAssessments(data)
        .filter((entry) => matchesFilter(entry, filters, false));
    const countriesByCycle = new Map<number, Set<number>>();
    entries.forEach((entry) => {
        if (entry.countryId === null) {
            return;
        }
        const countries = countriesByCycle.get(entry.assessmentNumber) ?? new Set<number>();
        countries.add(entry.countryId);
        countriesByCycle.set(entry.assessmentNumber, countries);
    });
    const componentAssessments = deduplicateComponentAssessments(flattenComponentAssessments(data))
        .filter((assessment) => matchesFilter(assessment, filters, false));
    const cycles = Array.from(new Set([
        ...countriesByCycle.keys(),
        ...componentAssessments.map((assessment) => assessment.assessmentNumber),
    ])).sort((left, right) => left - right);
    const allCycleData = cycles.map((cycle, index) => {
        const countries = countriesByCycle.get(cycle) ?? new Set<number>();
        const laterCountries = new Set<number>();
        cycles.slice(index + 1).forEach((laterCycle) => {
            countriesByCycle.get(laterCycle)?.forEach((countryId) => laterCountries.add(countryId));
        });
        const completed = Array.from(countries)
            .filter((countryId) => laterCountries.has(countryId))
            .length;
        return {
            cycle: `Cycle ${cycle}`,
            cycleNumber: cycle,
            completed,
            inProgress: countries.size - completed,
            rating: getCycleRating(componentAssessments, cycle),
            totalNS: countries.size,
            ratingChange: 0,
        };
    });
    const allCycleDataWithChanges = allCycleData.map((cycle, index) => ({
        ...cycle,
        ratingChange: index > 0
            ? Number((cycle.rating - (allCycleData[index - 1]?.rating ?? 0)).toFixed(2))
            : 0,
    }));
    const filteredCycles = filters.cycle === null
        ? allCycleDataWithChanges
        : allCycleDataWithChanges.filter((cycle) => cycle.cycleNumber === filters.cycle);
    return {
        total_cycles: filteredCycles.reduce((sum, cycle) => sum + cycle.totalNS, 0),
        cycles: filteredCycles,
    };
}

export function getPerformanceRegionData(
    data: PerformanceData,
    filters: PerformanceFilterState,
): Array<{ name: string; count: number }> {
    const filtersWithoutRegion = { ...filters, region: null, cycle: null };
    return REGION_ORDER.map((region) => ({
        name: region,
        count: getPerformanceRatings(
            data,
            { ...filtersWithoutRegion, region },
        ).overallRating.rating,
    }));
}
