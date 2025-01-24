import { AREA_COLORS } from './constants';
import type {
    AreaSummary,
    Assessment,
    ComponentRating,
    ComponentRatingsResult,
    Filters,
    RegionData,
} from './types';

// Rating scale colors
const RATING_SCALE_COLORS = {
    "Doesn't exist": '#E0E3E7',
    'Partially exists': '#99A5B3',
    'Needs improvement': '#7D8B9D',
    'Good performing': '#4D617A',
    'High performing': '#011E41',
} as const;

let perDashboardData: Assessment[] = [];
let lastUpdateData: any = null;

function initializeData(data: any, updateData: any) {
    // Transform the data from the API format to our internal format
    const assessments: Assessment[] = [];
    Object.entries(data.assessments).forEach(([, component]: [string, any]) => {
        component.assessments.forEach((assessment: any) => {
            assessments.push({
                ...assessment,
                component_num: component.component_num,
                component_name: component.component_name,
                area_id: component.area_id,
                area_name: component.area_name,
            });
        });
    });
    
    perDashboardData = assessments;
    lastUpdateData = updateData;
}

// Helper function to check if an assessment is newer
function isNewerAssessment(current: Assessment, existing: Assessment): boolean {
    return current.assessment_number > existing.assessment_number
    || (current.assessment_number === existing.assessment_number
      && new Date(current.date_of_assessment) > new Date(existing.date_of_assessment));
}

// Helper function to get unique key for assessment
const getAssessmentKey = (assessment: Assessment): string => (
    `${assessment.assessment_id}_${assessment.assessment_number}`
    + `_${assessment.component_num}_${assessment.country_id}`
    + `_${assessment.rating_value}_${assessment.date_of_assessment}`
);

// Helper function to filter duplicate assessments
const filterDuplicateAssessments = (assessments: Assessment[]): Assessment[] => {
    const groups = new Map<string, Assessment[]>();

    assessments.forEach((assessment) => {
        const key = [
            assessment.assessment_id,
            assessment.assessment_number,
            assessment.component_num,
        ].join('_');
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)?.push(assessment);
    });

    const filteredAssessments: Assessment[] = [];
    groups.forEach((group) => {
        const sorted = group.sort((a, b) => b.rating_value - a.rating_value);
        if (sorted[0].rating_value > 0 || group.length === 1) {
            filteredAssessments.push(sorted[0]);
        }
    });

    return filteredAssessments;
};

// Helper function to apply filters
const applyFilters = (filters: Filters | null = null): Assessment[] => {
    const assessments = filterDuplicateAssessments(perDashboardData);
    
    // Apply filtering logic if filters are provided
    if (filters) {
        let filteredAssessments = assessments;

        if (filters.region) {
            filteredAssessments = filteredAssessments.filter(
                (assessment) => assessment.region_name === filters.region,
            );
        }

        if (filters.year) {
            const targetYear = filters.year;
            filteredAssessments = filteredAssessments.filter((assessment) => {
                const assessmentYear = new Date(assessment.date_of_assessment).getFullYear();
                return assessmentYear === targetYear;
            });
        }

        if (filters.cycle) {
            filteredAssessments = filteredAssessments.filter(
                (assessment) => assessment.assessment_number === filters.cycle,
            );
        }

        return filteredAssessments;
    }

    return assessments;
};

// Helper function to get rating status
function getRatingStatus(rating: number): keyof typeof RATING_SCALE_COLORS {
    if (rating >= 4) return 'High performing';
    if (rating >= 3) return 'Good performing';
    if (rating >= 2) return 'Needs improvement';
    if (rating >= 1) return 'Partially exists';
    return "Doesn't exist";
}

// Helper function to get rounded rating
function getRoundedRating(rating: number): number {
    return Math.round(rating * 10) / 10;
}

function groupDataByRegion(): RegionData[] {
    const assessments = applyFilters();
    const regionComponentAverages: Record<
        string,
        Map<number, { total: number; count: number }>
    > = {};

    // First pass: identify latest assessments for each country-component combination
    const latestAssessments = new Map<string, Assessment>();

    assessments.forEach((assessment) => {
        const key = `${assessment.country_id}_${assessment.component_num}`;
        const existing = latestAssessments.get(key);

        if (!existing || isNewerAssessment(assessment, existing)) {
            latestAssessments.set(key, assessment);
        }
    });

    // Second pass: calculate component averages by region
    latestAssessments.forEach((assessment) => {
        const region = assessment.region_name;
        if (!regionComponentAverages[region]) {
            regionComponentAverages[region] = new Map();
        }

        const componentNum = assessment.component_num;
        const componentData = regionComponentAverages[region].get(componentNum)
      ?? { total: 0, count: 0 };

        componentData.total += assessment.rating_value;
        componentData.count += 1;
        regionComponentAverages[region].set(componentNum, componentData);
    });

    // Calculate final regional averages
    return Object.entries(regionComponentAverages).map(([region, components]) => {
        let totalComponentRating = 0;
        let componentCount = 0;

        components.forEach((comp) => {
            if (comp.count > 0) {
                totalComponentRating += comp.total / comp.count;
                componentCount += 1;
            }
        });

        return {
            name: region,
            count: componentCount > 0
                ? getRoundedRating(totalComponentRating / componentCount)
                : 0,
            totalComponents: componentCount,
        };
    });
}

function getComponentRatings(
    filters: Filters | null = null,
): ComponentRatingsResult {
    const assessments = applyFilters(filters);
    const componentGroups = new Map<number, Assessment[]>();
    assessments.forEach((assessment) => {
        if (!componentGroups.has(assessment.component_num)) {
            componentGroups.set(assessment.component_num, []);
        }
        componentGroups.get(assessment.component_num)?.push(assessment);
    });

    const componentMap = new Map<number, ComponentRating>();

    componentGroups.forEach((componentAssessments, componentId) => {
    // Filter out duplicate zero ratings when better ratings exist
        const filteredComponentAssessments = filterDuplicateAssessments(componentAssessments);
        const sample = filteredComponentAssessments[0];

        // Skip if no sample or if component name is missing
        if (!sample || !sample.component_name || !sample.area_name) {
            return;
        }

        // Current Rating Calculation (latest assessment per country)
        const latestAssessmentsByCountry = new Map<number, Assessment>();
        filteredComponentAssessments.forEach((a) => {
            const existing = latestAssessmentsByCountry.get(a.country_id);

            if (
                !existing
        || a.assessment_number > existing.assessment_number
        || (
            a.assessment_number === existing.assessment_number
          && new Date(a.date_of_assessment) > new Date(existing.date_of_assessment)
        )
            ) {
                latestAssessmentsByCountry.set(a.country_id, a);
            }
        });

        const latestAssessments = Array.from(latestAssessmentsByCountry.values());
        const sum = latestAssessments.reduce((s, a) => s + a.rating_value, 0);
        const average = sum / latestAssessments.length;
        const currentRating = latestAssessments.length > 0
            ? parseFloat(average.toFixed(2))
            : 0;

        // Cycle Ratings Calculation
        const cycles = [...new Set(
            filteredComponentAssessments.map((a) => a.assessment_number),
        )].sort((a, b) => a - b);
        const cycleRatings = cycles.map((cycle) => {
            const cycleAssessments = filteredComponentAssessments
                .filter((a) => a.assessment_number === cycle);
            const averageRating = cycleAssessments.length > 0
                ? parseFloat(
                    (
                        cycleAssessments.reduce(
                            (sm, a) => sm + a.rating_value,
                            0,
                        ) / cycleAssessments.length
                    ).toFixed(2),
                )
                : 0;
            const roundedRating = getRoundedRating(averageRating);
            const status = getRatingStatus(roundedRating);
            return {
                cycle,
                rating: averageRating,
                rating_display: roundedRating.toString(),
                rating_color: RATING_SCALE_COLORS[status] || '#000000',
            };
        });

        componentMap.set(componentId, {
            component_num: componentId,
            component_name: sample.component_name,
            area_id: sample.area_id,
            area_name: sample.area_name,
            cycleRatings,
            total: currentRating,
            count: latestAssessments.length,
        });
    });

    // Calculate area ratings by aggregating component data
    const areaMap = new Map<string, AreaSummary>();

    componentGroups.forEach((componentAssessments, componentId) => {
        const component = componentMap.get(componentId);
        // Skip if component is missing or has no area name
        if (!component || !component.area_name) {
            return;
        }
        if (!areaMap.has(component.area_name)) {
            areaMap.set(component.area_name, {
                name: component.area_name,
                rating: 0,
                status: '',
                change: 0,
                changeDirection: '',
                cycleRatings: [],
                components: [component],
                areaColor: AREA_COLORS[component.area_name] || '#000000',
            });
        } else {
            const area = areaMap.get(component.area_name);
            if (area) {
                area.components.push(component);
            }
        }
    });

    const areas = Array.from(areaMap.values())
        .filter((area) => area.name && area.components.length > 0)
        .map((area) => {
        // Current area rating
            const componentSum = area.components.reduce((sum, c) => sum + c.total, 0);
            const currentRating = area.components.length > 0
                ? parseFloat((componentSum / area.components.length).toFixed(2))
                : 0;

            // Cycle ratings for area
            const allCycles = [...new Set(
                area.components.flatMap((c) => c.cycleRatings.map((r) => r.cycle)),
            )].sort((a, b) => a - b);
            const areaCycleRatings = allCycles.map((cycle) => {
                let cycleTotal = 0;
                let validCount = 0;
                area.components.forEach((comp) => {
                    const cycleRating = comp.cycleRatings.find((r) => r.cycle === cycle);
                    if (cycleRating) {
                        cycleTotal += cycleRating.rating;
                        validCount += 1;
                    }
                });
                const cycleAverage = validCount > 0
                    ? parseFloat((cycleTotal / validCount).toFixed(2))
                    : 0;
                const roundedRating = getRoundedRating(cycleAverage);
                const status = getRatingStatus(roundedRating);
                return {
                    cycle,
                    rating: cycleAverage,
                    rating_display: roundedRating.toString(),
                    rating_color: RATING_SCALE_COLORS[status] || '#000000',
                };
            });

            return {
                ...area,
                rating: currentRating,
                status: getRatingStatus(currentRating),
                cycleRatings: areaCycleRatings,
            };
        });

    // Overall ratings
    const componentValues = Array.from(componentMap.values());
    const componentTotal = componentValues.reduce((sum, c) => sum + c.total, 0);
    const currentOverallRating = componentValues.length > 0
        ? parseFloat((componentTotal / componentValues.length).toFixed(2))
        : 0;

    const allComponentCycles = [...new Set(
        componentValues.flatMap((c) => c.cycleRatings.map((r) => r.cycle)),
    )].sort((a, b) => a - b);

    const overallCycleRatings = allComponentCycles.map((cycle) => {
        let cycleTotal = 0;
        let validCount = 0;
        componentValues.forEach((comp) => {
            const cycleRating = comp.cycleRatings.find((r) => r.cycle === cycle);
            if (cycleRating) {
                cycleTotal += cycleRating.rating;
                validCount += 1;
            }
        });
        const cycleAverage = validCount > 0
            ? parseFloat((cycleTotal / validCount).toFixed(2))
            : 0;
        const roundedRating = getRoundedRating(cycleAverage);
        const status = getRatingStatus(roundedRating);
        return {
            cycle,
            rating: cycleAverage,
            rating_display: roundedRating.toString(),
            rating_color: RATING_SCALE_COLORS[status] || '#000000',
        };
    });

    // Calculate last two cycles change
    const lastTwoOverallCycles = overallCycleRatings.slice(-2);
    const overallChange = lastTwoOverallCycles.length > 1
        ? parseFloat((lastTwoOverallCycles[1].rating - lastTwoOverallCycles[0].rating).toFixed(2))
        : 0;

    return {
        overallRating: {
            rating: currentOverallRating,
            status: getRatingStatus(currentOverallRating),
            change: overallChange,
            changeDirection: overallChange >= 0 ? 'up' : 'down',
            cycleRatings: overallCycleRatings.map((cycle) => ({
                ...cycle,
                color: RATING_SCALE_COLORS[getRatingStatus(cycle.rating)] || '#000000',
            })),
            color: RATING_SCALE_COLORS[getRatingStatus(currentOverallRating)] || '#000000',
        },
        areaData: areas.map((area) => {
            const lastTwoCycles = area.cycleRatings.slice(-2);
            const change = lastTwoCycles.length > 1
                ? parseFloat((lastTwoCycles[1].rating - lastTwoCycles[0].rating).toFixed(2))
                : 0;
            return {
                ...area,
                change,
                changeDirection: change >= 0 ? 'up' : 'down',
                cycleRatings: area.cycleRatings.map((cycle) => ({
                    ...cycle,
                    color: RATING_SCALE_COLORS[getRatingStatus(cycle.rating)] || '#000000',
                })),
            };
        }),
        componentData: Array.from(componentMap.values()).map((comp) => {
            const lastTwoCycles = comp.cycleRatings.slice(-2);
            const change = lastTwoCycles.length > 1
                ? parseFloat((lastTwoCycles[1].rating - lastTwoCycles[0].rating).toFixed(2))
                : 0;
            return {
                id: comp.component_num,
                name: comp.component_name,
                rating: comp.total,
                status: getRatingStatus(comp.total),
                change,
                changeDirection: change >= 0 ? 'up' : 'down',
                cycleRatings: comp.cycleRatings.map((cycle) => ({
                    ...cycle,
                    color: RATING_SCALE_COLORS[getRatingStatus(cycle.rating)] || '#000000',
                })),
                areaColor: AREA_COLORS[comp.area_name] || '#000000',
                type: 'component' as const,
            };
        }),
    };
}

function summarizeData(filters: Filters | null = null, includeLatest: boolean = false) {
    let assessments = applyFilters(filters);

    if (includeLatest) {
        const latestAssessmentsMap = new Map<string, Assessment>();
        assessments.forEach((assessment) => {
            const key = `${assessment.component_num}_${assessment.country_id}`;
            const existing = latestAssessmentsMap.get(key);

            if (!existing || assessment.assessment_number > existing.assessment_number) {
                latestAssessmentsMap.set(key, assessment);
            }
        });
        assessments = Array.from(latestAssessmentsMap.values());
    }

    // Calculate component averages
    const componentAverages = new Map<number, { total: number; count: number }>();
    assessments.forEach((assessment) => {
        if (!componentAverages.has(assessment.component_num)) {
            componentAverages.set(assessment.component_num, {
                total: 0,
                count: 0,
            });
        }
        const comp = componentAverages.get(assessment.component_num)!;
        comp.total += assessment.rating_value;
        comp.count += 1;
    });

    // Calculate total average
    let totalComponentAverage = 0;
    let componentCount = 0;
    componentAverages.forEach((comp) => {
        if (comp.count > 0) {
            totalComponentAverage += (comp.total / comp.count);
            componentCount += 1;
        }
    });

    const averageRating = componentCount > 0
        ? parseFloat((totalComponentAverage / componentCount).toFixed(2))
        : 0;

    type AreaRatingStats = {
        total: number;
        count: number;
        components?: Set<number>;
    };

    // Calculate area averages
    const areaRatings: Record<string, AreaRatingStats> = {};
    assessments.forEach((assessment) => {
        const area = assessment.area_name;
        if (!areaRatings[area]) {
            areaRatings[area] = { total: 0, count: 0, components: new Set() };
        }

        const compAvg = componentAverages.get(assessment.component_num)!;
        if (!areaRatings[area].components!.has(assessment.component_num)) {
            areaRatings[area].total += (compAvg.total / compAvg.count);
            areaRatings[area].count += 1;
      areaRatings[area].components!.add(assessment.component_num);
        }
    });

    const averageRatingByArea: { [area: string]: number } = {};
    Object.keys(areaRatings).forEach((area) => {
        averageRatingByArea[area] = areaRatings[area].count > 0
            ? parseFloat((areaRatings[area].total / areaRatings[area].count).toFixed(2))
            : 0;
    });

    return {
        totalComponents: componentCount,
        averageRating,
        averageRatingByArea,
    };
}

function getCycles(filters: Filters | null = null) {
    // Get all assessments without cycle filter first
    const allAssessments = applyFilters({
        ...filters,
        cycle: null, // Remove cycle filter temporarily
    });

    // Then get filtered assessments for rating calculations
    const filteredAssessments = applyFilters(filters);

    // Group assessments by cycle first
    const cycleData: {
    [cycle: number]: {
      completed: number;
      in_progress: number;
      componentRatings: { [componentId: number]: { total: number; count: number } };
      countries: Set<number>;
    };
  } = {};

    // First pass: organize data using ALL assessments (unfiltered)
    allAssessments.forEach((assessment) => {
        const cycle = assessment.assessment_number;
        if (!cycleData[cycle]) {
            cycleData[cycle] = {
                completed: 0,
                in_progress: 0,
                componentRatings: {},
                countries: new Set(),
            };
        }
        cycleData[cycle].countries.add(assessment.country_id);
    });

    // Second pass: determine completed vs in-progress using ALL assessments
    Object.keys(cycleData).forEach((cycle) => {
        const currentCycle = parseInt(cycle, 10);
        const countriesInLaterCycles = new Set<number>();

        // Check if countries appear in later cycles
        Object.keys(cycleData).forEach((laterCycle) => {
            if (parseInt(laterCycle, 10) > currentCycle) {
                cycleData[parseInt(laterCycle, 10)].countries.forEach((countryId) => {
                    countriesInLaterCycles.add(countryId);
                });
            }
        });

        // Count completed (countries that appear in later cycles)
        cycleData[currentCycle].completed = Array.from(cycleData[currentCycle].countries)
            .filter((countryId) => countriesInLaterCycles.has(countryId)).length;

        // Count in progress (countries that don't appear in later cycles)
        cycleData[currentCycle].in_progress = cycleData[currentCycle].countries.size
      - cycleData[currentCycle].completed;
    });

    // Third pass: calculate ratings using filtered assessments
    filteredAssessments.forEach((assessment) => {
        const cycle = assessment.assessment_number;
        if (cycleData[cycle]) {
            if (!cycleData[cycle].componentRatings[assessment.component_num]) {
                cycleData[cycle].componentRatings[assessment.component_num] = {
                    total: 0,
                    count: 0,
                };
            }
            const currentComponent = cycleData[cycle].componentRatings[assessment.component_num];
            currentComponent.total += assessment.rating_value;
            currentComponent.count += 1;
        }
    });

    // Calculate cycle statistics using component averages
    const cycles = Object.entries(cycleData).map(([cycleNum, data]) => {
        const cycle = parseInt(cycleNum, 10);

        // Calculate average rating from component averages
        let totalComponentRating = 0;
        let componentCount = 0;

        Object.values(data.componentRatings).forEach((comp) => {
            if (comp.count > 0) {
                totalComponentRating += (comp.total / comp.count);
                componentCount += 1;
            }
        });

        const averageRating = componentCount > 0
            ? parseFloat((totalComponentRating / componentCount).toFixed(2))
            : 0;

        // Calculate previous cycle rating
        const previousCycle = cycleData[cycle - 1];
        let previousRating = 0;

        if (previousCycle) {
            let prevTotalRating = 0;
            let prevComponentCount = 0;

            Object.values(previousCycle.componentRatings).forEach((comp) => {
                if (comp.count > 0) {
                    prevTotalRating += (comp.total / comp.count);
                    prevComponentCount += 1;
                }
            });

            previousRating = prevComponentCount > 0
                ? prevTotalRating / prevComponentCount
                : 0;
        }

        return {
            cycle: `Cycle ${cycle}`,
            cycleNumber: cycle,
            completed: data.completed,
            inProgress: data.in_progress,
            rating: averageRating,
            totalNS: data.countries.size,
            ratingChange: parseFloat((averageRating - previousRating).toFixed(2)),
        };
    })
        .sort((a, b) => parseInt(a.cycle.split(' ')[1], 10) - parseInt(b.cycle.split(' ')[1], 10));

    // Filter cycles at the end based on original filters
    let filteredCycles = cycles;
    if (filters?.cycle) {
        filteredCycles = cycles.filter((cycle) => cycle.cycleNumber === filters.cycle);
    }

    return {
        total_cycles: filteredCycles.reduce((sum, cycle) => sum + cycle.totalNS, 0),
        cycles: filteredCycles,
    };
}

function getLastUpdateDate(): string {
    return lastUpdateData?.lastUpdate ?? 'N/A';
}

// Export all types and functions at the end of the file
export type {
    Assessment,
    AreaSummary,
    ComponentRating,
    ComponentRatingsResult,
    Filters,
    RegionData,
};

export {
    applyFilters,
    getRatingStatus,
    getRoundedRating,
    groupDataByRegion,
    getComponentRatings,
    summarizeData,
    getCycles,
    getLastUpdateDate,
    initializeData,
    RATING_SCALE_COLORS,
};
