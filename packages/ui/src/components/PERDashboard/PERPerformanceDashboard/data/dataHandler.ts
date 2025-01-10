import type { ActiveFilters } from '../types';
import type { Assessment } from '../../data-fetcher/types';
import perDashboardDataRaw from '../../data-fetcher/data/per-dashboard-data.json';
import lastUpdateData from '../../data-fetcher/data/last-update.json';
import { PHASE_COLORS, AREA_COLORS } from '../../constants';

// Rating scale colors
const RATING_SCALE_COLORS = {
    "Doesn't exist": '#E0E3E7',
    "Partially exists": '#99A5B3',
    "Needs improvement": '#7D8B9D',
    "Good performing": '#4D617A',
    "High performing": '#011E41',
} as const;

const perDashboardData = perDashboardDataRaw;

// Helper function to get unique key for assessment
const getAssessmentKey = (assessment: Assessment): string => {
    return `${assessment.assessment_id}_${assessment.assessment_number}_${assessment.component_num}_${assessment.country_id}_${assessment.rating_value}_${assessment.date_of_assessment}`;
};

// Helper function to filter duplicate assessments
const filterDuplicateAssessments = (assessments: Assessment[]): Assessment[] => {
    const groups = new Map<string, Assessment[]>();
    
    assessments.forEach(assessment => {
        const key = `${assessment.assessment_id}_${assessment.assessment_number}_${assessment.component_num}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)?.push(assessment);
    });

    const filteredAssessments: Assessment[] = [];
    groups.forEach(group => {
        const sorted = group.sort((a, b) => b.rating_value - a.rating_value);
        if (sorted[0].rating_value > 0 || group.length === 1) {
            filteredAssessments.push(sorted[0]);
        }
    });

    return filteredAssessments;
};

// Helper function to apply filters
const applyFilters = (filters: ActiveFilters | null = null): Assessment[] => {
    const data = perDashboardData;
    let assessments: Assessment[] = [];
    const uniqueAssessmentsMap = new Map<string, Assessment[]>();

    // First, group all assessments by their key
    for (const componentKey in data.assessments) {
        const component = data.assessments[componentKey];
        
        component.assessments.forEach((assessment) => {
            const enrichedAssessment = {
                ...assessment,
                component_num: component.component_num,
                component_name: component.component_name,
                area_id: component.area_id,
                area_name: component.area_name,
            };
            
            const key = getAssessmentKey(enrichedAssessment);
            if (!uniqueAssessmentsMap.has(key)) {
                uniqueAssessmentsMap.set(key, []);
            }
            uniqueAssessmentsMap.get(key)?.push(enrichedAssessment);
        });
    }

    // For each group of duplicates, select the best assessment
    uniqueAssessmentsMap.forEach((duplicates, key) => {
        const sortedDuplicates = duplicates.sort((a, b) => b.rating_value - a.rating_value);
        
        if (sortedDuplicates[0].rating_value > 0 || sortedDuplicates.length === 1) {
            assessments.push(sortedDuplicates[0]);
        }
    });

    // Filter out duplicate zero ratings when better ratings exist
    assessments = filterDuplicateAssessments(assessments);

    // Apply filtering logic if filters are provided
    if (filters) {
        if (filters.region) {
            assessments = assessments.filter(
                (assessment) => assessment.region_name === filters.region
            );
        }

        if (filters.year) {
            assessments = assessments.filter(
                (assessment) =>
                    new Date(assessment.date_of_assessment).getFullYear() === filters.year
            );
        }

        if (filters.cycle) {
            assessments = assessments.filter(
                (assessment) => assessment.assessment_number === filters.cycle
            );
        }
    }

    return assessments;
};

// Helper function to get rating status
function getRatingStatus(rating: number): keyof typeof RATING_SCALE_COLORS {
    if (rating >= 4) return "High performing";
    if (rating >= 3) return "Good performing";
    if (rating >= 2) return "Needs improvement";
    if (rating >= 1) return "Partially exists";
    return "Doesn't exist";
}

// Helper function to get rounded rating
function getRoundedRating(rating: number): number {
    return Math.round(rating * 10) / 10;
}

// Helper function to get change direction
function getChangeDirection(change: number): 'up' | 'down' {
    return change >= 0 ? 'up' : 'down';
}

export function groupDataByRegion(): Array<{ name: string; count: number; totalComponents: number }> {
    let assessments = applyFilters();
    const regionComponentAverages: { [key: string]: Map<number, { total: number; count: number }> } = {};

    // First pass: identify latest assessments for each country-component combination across all regions
    const latestAssessments = new Map<string, Assessment>();

    assessments.forEach(assessment => {
        const key = `${assessment.country_id}_${assessment.component_num}`;
        const existing = latestAssessments.get(key);

        // Select the latest assessment based on assessment_number and date
        if (
            !existing ||
            assessment.assessment_number > existing.assessment_number ||
            (
                assessment.assessment_number === existing.assessment_number &&
                new Date(assessment.date_of_assessment) > new Date(existing.date_of_assessment)
            )
        ) {
            latestAssessments.set(key, assessment);
        }
    });

    // Second pass: calculate component averages by region using only the latest assessments
    latestAssessments.forEach(assessment => {
        const region = assessment.region_name;
        if (!regionComponentAverages[region]) {
            regionComponentAverages[region] = new Map();
        }

        const componentNum = assessment.component_num;
        if (!regionComponentAverages[region].has(componentNum)) {
            regionComponentAverages[region].set(componentNum, { total: 0, count: 0 });
        }

        const comp = regionComponentAverages[region].get(componentNum)!;
        comp.total += assessment.rating_value;
        comp.count += 1;
    });

    // Calculate final regional averages from component averages
    return Object.entries(regionComponentAverages).map(([region, components]) => {
        let totalComponentRating = 0;
        let componentCount = 0;

        components.forEach(comp => {
            if (comp.count > 0) {
                const componentAverage = comp.total / comp.count;
                totalComponentRating += componentAverage;
                componentCount++;
            }
        });

        return {
            name: region,
            count: componentCount > 0 ? parseFloat((totalComponentRating / componentCount).toFixed(2)) : 0,
            totalComponents: componentCount
        };
    });
}

export function getComponentRatings(filters: ActiveFilters | null = null, includeLatest: boolean = false) {
    let assessments = applyFilters(filters);

    // Group by component
    const componentGroups = new Map<number, Assessment[]>();
    assessments.forEach(assessment => {
        if (!componentGroups.has(assessment.component_num)) {
            componentGroups.set(assessment.component_num, []);
        }
        componentGroups.get(assessment.component_num)?.push(assessment);
    });

    const componentMap = new Map<number, any>();

    componentGroups.forEach((componentAssessments, componentId) => {
        // Filter out duplicate zero ratings when better ratings exist
        const filteredComponentAssessments = filterDuplicateAssessments(componentAssessments);
        const sample = filteredComponentAssessments[0];

        // Current Rating Calculation (latest assessment per country)
        const latestAssessmentsByCountry = new Map<number, Assessment>();
        filteredComponentAssessments.forEach(a => {
            const existing = latestAssessmentsByCountry.get(a.country_id);
            if (
                !existing ||
                a.assessment_number > existing.assessment_number ||
                (
                    a.assessment_number === existing.assessment_number &&
                    new Date(a.date_of_assessment) > new Date(existing.date_of_assessment)
                )
            ) {
                latestAssessmentsByCountry.set(a.country_id, a);
            }
        });

        const latestAssessments = Array.from(latestAssessmentsByCountry.values());
        const currentRating = latestAssessments.length > 0
            ? parseFloat((latestAssessments.reduce((sum, a) => sum + a.rating_value, 0) / latestAssessments.length).toFixed(2))
            : 0;

        // Cycle Ratings Calculation
        const cycles = [...new Set(filteredComponentAssessments.map(a => a.assessment_number))].sort((a, b) => a - b);
        const cycleRatings = cycles.map(cycle => {
            const cycleAssessments = filteredComponentAssessments.filter(a => a.assessment_number === cycle);
            const averageRating = cycleAssessments.length > 0
                ? parseFloat((cycleAssessments.reduce((sum, a) => sum + a.rating_value, 0) / cycleAssessments.length).toFixed(2))
                : 0;
            const roundedRating = getRoundedRating(averageRating);
            const status = getRatingStatus(roundedRating);
            return {
                cycle,
                rating: averageRating,
                color: RATING_SCALE_COLORS[status] || '#000000'
            };
        });

        // Calculate change from last two cycles
        const lastTwoCycles = cycleRatings.slice(-2);
        const change = lastTwoCycles.length > 1
            ? parseFloat((lastTwoCycles[1].rating - lastTwoCycles[0].rating).toFixed(2))
            : 0;

        componentMap.set(componentId, {
            id: componentId,
            name: sample.component_name,
            area_id: sample.area_id,
            area_name: sample.area_name,
            rating: currentRating,
            status: getRatingStatus(currentRating),
            change,
            changeDirection: change >= 0 ? 'up' : 'down',
            areaColor: AREA_COLORS[sample.area_name] || '#000000',
            cycleRatings
        });
    });

    // Calculate area ratings by aggregating component data
    const areaMap = new Map<string, any>();

    componentGroups.forEach((componentAssessments, componentId) => {
        const component = componentMap.get(componentId);
        if (!areaMap.has(component.area_name)) {
            areaMap.set(component.area_name, {
                name: component.area_name,
                rating: 0,
                status: '',
                change: 0,
                changeDirection: '',
                areaColor: component.areaColor,
                components: [component],
                cycleRatings: []
            });
        } else {
            const area = areaMap.get(component.area_name);
            area.components.push(component);
        }
    });

    areaMap.forEach((area) => {
        // Current area rating
        const currentRating = area.components.length > 0
            ? parseFloat((area.components.reduce((sum, c) => sum + c.rating, 0) / area.components.length).toFixed(2))
            : 0;

        // Cycle ratings for area
        const allCycles = [...new Set(area.components.flatMap(c => c.cycleRatings.map(r => r.cycle)))].sort((a, b) => a - b);
        const areaCycleRatings = allCycles.map(cycle => {
            let cycleTotal = 0;
            let validCount = 0;
            area.components.forEach(comp => {
                const cycleRating = comp.cycleRatings.find(r => r.cycle === cycle);
                if (cycleRating) {
                    cycleTotal += cycleRating.rating;
                    validCount++;
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
                color: RATING_SCALE_COLORS[status] || '#000000'
            };
        });

        // Change in area rating
        const lastTwoCycles = areaCycleRatings.slice(-2);
        const change = lastTwoCycles.length > 1
            ? parseFloat((lastTwoCycles[1].rating - lastTwoCycles[0].rating).toFixed(2))
            : 0;

        area.rating = currentRating;
        area.status = getRatingStatus(currentRating);
        area.change = change;
        area.changeDirection = change >= 0 ? 'up' : 'down';
        area.cycleRatings = areaCycleRatings;
    });

    // Overall ratings
    const currentOverallRating = Array.from(componentMap.values()).length > 0
        ? parseFloat((Array.from(componentMap.values()).reduce((sum, c) => sum + c.rating, 0) / Array.from(componentMap.values()).length).toFixed(2))
        : 0;

    const overallCycleRatings = [...new Set(Array.from(componentMap.values()).flatMap(c => c.cycleRatings.map(r => r.cycle)))].sort((a, b) => a - b).map(cycle => {
        let cycleTotal = 0;
        let validCount = 0;
        Array.from(componentMap.values()).forEach(comp => {
            const cycleRating = comp.cycleRatings.find(r => r.cycle === cycle);
            if (cycleRating) {
                cycleTotal += cycleRating.rating;
                validCount++;
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
            color: RATING_SCALE_COLORS[status] || '#000000'
        };
    });

    const lastTwoOverallCycles = overallCycleRatings.slice(-2);
    const overallChange = lastTwoOverallCycles.length > 1
        ? parseFloat((lastTwoOverallCycles[1].rating - lastTwoOverallCycles[0].rating).toFixed(2))
        : 0;

    return {
        overallRating: {
            rating: currentOverallRating,
            change: overallChange,
            changeDirection: overallChange >= 0 ? 'up' : 'down',
            status: getRatingStatus(currentOverallRating),
            cycleRatings: overallCycleRatings
        },
        areaData: Array.from(areaMap.values()),
        componentData: Array.from(componentMap.values())
    };
}

export function summarizeData(filters: ActiveFilters | null = null, includeLatest: boolean = false) {
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
                count: 0
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
            componentCount++;
        }
    });

    const averageRating = componentCount > 0 
        ? parseFloat((totalComponentAverage / componentCount).toFixed(2))
        : 0;

    // Calculate area averages
    const areaRatings: { [area: string]: { total: number; count: number; components?: Set<number> } } = {};
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
    for (const area in areaRatings) {
        averageRatingByArea[area] = areaRatings[area].count > 0
            ? parseFloat((areaRatings[area].total / areaRatings[area].count).toFixed(2))
            : 0;
    }

    return {
        totalComponents: componentCount,
        averageRating,
        averageRatingByArea,
    };
}

export function getCycles(filters: ActiveFilters | null = null, includeAllCycles: boolean = false) {
    // Get all assessments without cycle filter first
    const allAssessments = applyFilters({
        ...filters,
        cycle: null // Remove cycle filter temporarily
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
    allAssessments.forEach(assessment => {
        const cycle = assessment.assessment_number;
        if (!cycleData[cycle]) {
            cycleData[cycle] = {
                completed: 0,
                in_progress: 0,
                componentRatings: {},
                countries: new Set()
            };
        }
        cycleData[cycle].countries.add(assessment.country_id);
    });

    // Second pass: determine completed vs in-progress using ALL assessments
    Object.keys(cycleData).forEach(cycle => {
        const currentCycle = parseInt(cycle);
        const countriesInLaterCycles = new Set<number>();
        
        // Check if countries appear in later cycles
        Object.keys(cycleData).forEach(laterCycle => {
            if (parseInt(laterCycle) > currentCycle) {
                cycleData[parseInt(laterCycle)].countries.forEach(countryId => {
                    countriesInLaterCycles.add(countryId);
                });
            }
        });

        // Count completed (countries that appear in later cycles)
        cycleData[currentCycle].completed = Array.from(cycleData[currentCycle].countries)
            .filter(countryId => countriesInLaterCycles.has(countryId)).length;
        
        // Count in progress (countries that don't appear in later cycles)
        cycleData[currentCycle].in_progress = cycleData[currentCycle].countries.size - 
            cycleData[currentCycle].completed;
    });

    // Third pass: calculate ratings using filtered assessments
    filteredAssessments.forEach(assessment => {
        const cycle = assessment.assessment_number;
        if (cycleData[cycle]) {
            if (!cycleData[cycle].componentRatings[assessment.component_num]) {
                cycleData[cycle].componentRatings[assessment.component_num] = {
                    total: 0,
                    count: 0
                };
            }
            cycleData[cycle].componentRatings[assessment.component_num].total += assessment.rating_value;
            cycleData[cycle].componentRatings[assessment.component_num].count += 1;
        }
    });

    // Calculate cycle statistics using component averages
    const cycles = Object.entries(cycleData)
        .map(([cycleNum, data]) => {
            const cycle = parseInt(cycleNum);
            
            // Calculate average rating from component averages
            let totalComponentRating = 0;
            let componentCount = 0;
            
            Object.values(data.componentRatings).forEach(comp => {
                if (comp.count > 0) {
                    totalComponentRating += (comp.total / comp.count);
                    componentCount++;
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
                
                Object.values(previousCycle.componentRatings).forEach(comp => {
                    if (comp.count > 0) {
                        prevTotalRating += (comp.total / comp.count);
                        prevComponentCount++;
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
                ratingChange: parseFloat((averageRating - previousRating).toFixed(2))
            };
        })
        .sort((a, b) => parseInt(a.cycle.split(' ')[1]) - parseInt(b.cycle.split(' ')[1]));

    // Filter cycles at the end based on original filters
    let filteredCycles = cycles;
    if (filters?.cycle) {
        filteredCycles = cycles.filter(cycle => cycle.cycleNumber === filters.cycle);
    }

    return {
        total_cycles: filteredCycles.reduce((sum, cycle) => sum + cycle.totalNS, 0),
        cycles: filteredCycles
    };
}

export function getLastUpdateDate(): string {
    return lastUpdateData.lastUpdate;
}
