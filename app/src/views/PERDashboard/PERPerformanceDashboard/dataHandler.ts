import type { PERRatingAnalysisProps } from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    AREA_COLORS,
    assessmentTypeKey,
    type ComponentAssessment,
    type DashboardFilterState,
    dateTimestamp,
    type PerformanceComponent,
    type PerformanceCountryAssessment,
    type PerformanceData,
    REGION_ORDER,
    type RegionName,
} from '../data';

export type PerformanceFilterState = DashboardFilterState & {
    cycle: number | null;
};

type RatingCycle = PERRatingAnalysisProps['overallRating']['cycleRatings'][number];

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

// NOTE: A rating of 0 means "Not reviewed". Like a missing rating it is not a score,
// so it is left out of every average.
function isRated(rating: number | null): rating is number {
    return isDefined(rating) && rating > 0;
}

function getRatedValues(assessments: Pick<ComponentAssessment, 'ratingValue'>[]): number[] {
    return assessments
        .map((assessment) => assessment.ratingValue)
        .filter(isRated);
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

function getYear(value: string): number | null {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : new Date(timestamp).getUTCFullYear();
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
        && assessmentTypeKey(item.typeOfAssessment) !== filters.assessmentType
    ) {
        return false;
    }
    if (includeCycle && filters.cycle !== null && item.assessmentNumber !== filters.cycle) {
        return false;
    }
    return true;
}

function allCountryAssessments(data: PerformanceData): PerformanceCountryAssessment[] {
    return Object.values(data.countryAssessments).flat();
}

// NOTE: Without values there is no rating, which is not the same as a rating of 0
function average(values: number[]): number | undefined {
    if (values.length === 0) {
        return undefined;
    }
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
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

function averageCycleRatings(cycleRatings: RatingCycle[]): RatingCycle[] {
    const cycles = Array.from(new Set(cycleRatings.map((item) => item.cycle)))
        .sort((left, right) => Number(left) - Number(right));
    return cycles.flatMap((cycle) => {
        const rating = average(
            cycleRatings
                .filter((item) => item.cycle === cycle)
                .map((item) => item.rating),
        );
        return isDefined(rating) ? [{ cycle, rating }] : [];
    });
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

    // NOTE: An NS is represented by its latest assessment. When that assessment did not
    // rate the component, the NS is left out instead of falling back to an older rating.
    const rating = average(getRatedValues(Array.from(latestByCountry(assessments).values())));
    if (isNotDefined(rating)) {
        return undefined;
    }

    return {
        key: String(componentKey(sample)),
        componentNum: sample.componentNum ?? sample.componentId ?? 0,
        componentName: sample.componentName,
        areaName: sample.areaName,
        areaId: sample.areaId,
        rating,
        cycleRatings: averageCycleRatings(
            assessments.flatMap(({ assessmentNumber, ratingValue }) => (
                isRated(ratingValue)
                    ? [{ cycle: String(assessmentNumber), rating: ratingValue }]
                    : []
            )),
        ),
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
    const areas = Array.from(byArea.entries()).flatMap(([name, areaComponents]) => {
        const rating = average(areaComponents.map((component) => component.rating));
        if (isNotDefined(rating)) {
            return [];
        }
        return [withChange({
            type: 'area' as const,
            name,
            rating,
            cycleRatings: averageCycleRatings(
                areaComponents.flatMap((component) => component.cycleRatings),
            ),
            areaColor: AREA_COLORS[name] ?? '#000000',
        })];
    });

    const overall = withChange({
        // NOTE: 0 when no component is rated, which PERRatingAnalysis shows as "-"
        rating: average(components.map((component) => component.rating)) ?? 0,
        cycleRatings: averageCycleRatings(
            components.flatMap((component) => component.cycleRatings),
        ),
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
    totalAssessments: number;
} {
    const totalAssessments = new Set(
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
        totalAssessments,
    };
}

// NOTE: null when no assessment of the cycle is rated, so it is not drawn as a rating of 0
function getCycleRating(
    assessments: FlattenedComponentAssessment[],
    cycle: number,
): number | null {
    const byAssessment = new Map<string, number[]>();
    assessments.forEach((assessment) => {
        if (assessment.assessmentNumber !== cycle || !isRated(assessment.ratingValue)) {
            return;
        }
        const key = assessment.assessmentId === null
            ? [
                assessment.countryId,
                assessment.assessmentNumber,
                assessment.dateOfAssessment,
            ].join(':')
            : String(assessment.assessmentId);
        const values = byAssessment.get(key) ?? [];
        values.push(assessment.ratingValue);
        byAssessment.set(key, values);
    });
    return average(
        Array.from(byAssessment.values()).map(average).filter(isDefined),
    ) ?? null;
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
        rating: number | null;
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
    const componentAssessments = flattenComponentAssessments(data)
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
        };
    });
    const allCycleDataWithChanges = allCycleData.map((cycle, index) => {
        const previousRating = allCycleData[index - 1]?.rating;
        return {
            ...cycle,
            ratingChange: isDefined(previousRating) && isDefined(cycle.rating)
                ? Number((cycle.rating - previousRating).toFixed(2))
                : 0,
        };
    });
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
): Array<{ name: RegionName; count: number }> {
    const filtersWithoutRegion = { ...filters, region: null, cycle: null };
    return REGION_ORDER.map((region) => ({
        name: region,
        count: getPerformanceRatings(
            data,
            { ...filtersWithoutRegion, region },
        ).overallRating.rating,
    }));
}
