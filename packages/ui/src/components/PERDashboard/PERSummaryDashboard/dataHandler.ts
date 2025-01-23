import {
    AREA_COLORS,
    PHASE_COLORS,
} from '../constants';
import {
    AssessmentRecord,
    ChartDataItem,
    ComponentSummary,
    FilterOptions,
    Filters,
    KPIData,
    PERConsiderationsData,
} from './types';

let mapData: AssessmentRecord[] = [];
let lastUpdateData: any = null;

function initializeData(data: AssessmentRecord[], updateData: any) {
    mapData = data;
    lastUpdateData = updateData;
}

function processMapData(rawData: any[]): AssessmentRecord[] {
    return rawData.map((record) => ({
        id: record.id,
        country_id: record.country_id,
        country_name: record.country_name,
        region_name: record.region_name,
        date_of_assessment: record.date_of_assessment,
        phase: record.phase,
        phase_display: record.phase_display,
        assessment_number: record.assessment_number,
        type_of_assessment_name: record.type_of_assessment_name,
        prioritized_components: record.prioritized_components || [],
        epi_considerations: record.epi_considerations,
        climate_environmental_considerations:
            record.climate_environmental_considerations,
        urban_considerations: record.urban_considerations,
        migration_considerations: record.migration_considerations,
        latitude: record.latitude,
        longitude: record.longitude,
    }));
}

function groupByAndFilter(
    data: Array<AssessmentRecord>,
    groupKey: keyof AssessmentRecord,
    compareKey: keyof AssessmentRecord,
): Array<AssessmentRecord> {
    const groupedDataMap = data.reduce(
        (acc, record) => {
            const existingRecord = acc[record[groupKey] as string];
            if (
                !existingRecord
        || (existingRecord
          && record[compareKey] !== undefined
          && existingRecord[compareKey] !== undefined
          && record[compareKey] > existingRecord[compareKey])
            ) {
                acc[record[groupKey] as string] = record;
            }
            return acc;
        },
    {} as Record<string, AssessmentRecord>,
    );

    return Object.values(groupedDataMap);
}

function assignFillColors(
    data: Array<AssessmentRecord>,
): Array<AssessmentRecord & { color: string }> {
    return data.map((record) => {
        const phaseMatch = PHASE_COLORS.find(
            (phase) => phase.phase === record.phase_display
        && phase.phaseNumber === record.phase,
        );
        return {
            ...record,
            color: phaseMatch ? phaseMatch.color : '#CCCCCC',
        };
    });
}

function getFilterOptions(): FilterOptions {
    return {
        regions: [
            ...new Set(mapData.map((record: AssessmentRecord) => record.region_name)),
        ].filter(Boolean),
        years: [
            ...new Set(
                mapData.map((record: AssessmentRecord) => {
                    const date = new Date(record.date_of_assessment);
                    return date.getFullYear();
                }),
            ),
        ].sort((a, b) => b - a),
        phases: [
            ...new Set(mapData.map((record: AssessmentRecord) => record.phase)),
        ].sort((a, b) => a - b),
        assessmentTypes: [
            ...new Set(
                mapData.map(
                    (record: AssessmentRecord) => record.type_of_assessment_name,
                ),
            ),
        ].filter(Boolean),
    };
}

function applyFilters(
    data: Array<AssessmentRecord>,
    filters: Filters | null = null,
): Array<AssessmentRecord> {
    let filteredData = [...data];

    if (!filters) {
        return filteredData;
    }

    if (filters.region) {
        filteredData = filteredData.filter(
            (record) => record.region_name === filters.region,
        );
    }

    if (filters.year) {
        const yearStr = filters.year.toString();
        filteredData = filteredData.filter(
            (record) => new Date(record.date_of_assessment).getFullYear().toString()
                === yearStr,
        );
    }

    if (filters.phase) {
        filteredData = filteredData.filter(
            (record) => record.phase === filters.phase,
        );
    }

    if (filters.id) {
        filteredData = filteredData.filter((record) => record.id === filters.id);
    }

    if (filters.perConsiderations) {
        filteredData = filteredData.filter(
            (record) => record[filters.perConsiderations as keyof AssessmentRecord],
        );
    }

    if (filters.completedAssessment) {
        filteredData = filteredData.filter((record) => record.phase >= 2);
    }

    if (filters.highPriorityComponent) {
        filteredData = filteredData.filter((record) => record.prioritized_components.some(
            (component) => component.componentTitle === filters.highPriorityComponent,
        ));
    }

    if (filters.assessmentType) {
        filteredData = filteredData.filter(
            (record) => record.type_of_assessment_name === filters.assessmentType,
        );
    }

    if (filters.numberOfCycles !== undefined && filters.numberOfCycles !== null) {
        const cyclesCount = filters.numberOfCycles;
        filteredData = filteredData.filter(
            (record) => record.assessment_number >= cyclesCount,
        );
    }

    return filteredData;
}

function processFilteredMapData(
    filters: Filters | null = null,
): Array<AssessmentRecord> {
    const filteredData = applyFilters(mapData, filters);
    const groupedData = groupByAndFilter(
        filteredData,
        'country_id',
        'assessment_number',
    );
    return assignFillColors(groupedData);
}

function getFilteredMapData(
    filters: Filters | null = null,
): Array<AssessmentRecord> {
    return processFilteredMapData(filters);
}

function getRecordsByRegion(
    filters: Filters | null = null,
): Array<{ name: string; count: number }> {
    const regionNames = ['Africa', 'Americas', 'Asia Pacific', 'Europe', 'MENA'];
    const filters2 = { ...filters };
    filters2.region = null;

    const filteredData = applyFilters(mapData, filters2);
    const regionCounts = regionNames.reduce(
        (acc, region) => {
            acc[region] = { name: region, count: 0 };
            return acc;
        },
    {} as Record<string, { name: string; count: number }>,
    );

    filteredData.forEach((record) => {
        const regionName = record.region_name || 'Unknown';
        if (regionCounts[regionName]) {
            regionCounts[regionName].count += 1;
        }
    });

    return Object.values(regionCounts);
}

function getRecordsByAssessmentType(
    filters: Filters | null,
): Array<{ label: string; count: number }> {
    const filteredData = applyFilters(mapData, filters);

    // Initialize all assessment types with 0
    const assessmentTypeCounts: Record<string, number> = {
        'Self assessment': 0,
        Simulation: 0,
        Operational: 0,
        'Post operational': 0,
    };

    // Count only if we match the filter
    filteredData.forEach((record) => {
        const assessmentType = record.type_of_assessment_name;
        if (assessmentType && assessmentType in assessmentTypeCounts) {
            assessmentTypeCounts[assessmentType] += 1;
        }
    });

    // Always return all assessment types, even if count is 0
    return [
        { label: 'Self assessment', count: assessmentTypeCounts['Self assessment'] },
        { label: 'Simulation', count: assessmentTypeCounts.Simulation },
        { label: 'Operational', count: assessmentTypeCounts.Operational },
        { label: 'Post operational', count: assessmentTypeCounts['Post operational'] },
    ];
}

function getStackedBarDataByYearAndRegion(
    filters: Filters | null,
): Array<{ year: string; values: Record<string, number> }> {
    const regionNames = ['Africa', 'Americas', 'Asia Pacific', 'Europe', 'MENA'];
    const filteredData = applyFilters(mapData, filters);

    // Get all possible years from the data
    const allYears = [
        ...new Set(
            mapData.map((record) => new Date(record.date_of_assessment).getFullYear().toString()),
        ),
    ].sort();

    // Initialize yearRegionCounts with all years and regions set to 0
    const yearRegionCounts: Record<string, Record<string, number>> = {};
    allYears.forEach((year) => {
        yearRegionCounts[year] = regionNames.reduce(
            (acc, region) => {
                acc[region] = 0;
                return acc;
            },
      {} as Record<string, number>,
        );
    });

    // Count records for each year and region
    filteredData.forEach((record) => {
        const year = new Date(record.date_of_assessment).getFullYear().toString();
        const region = record.region_name;
        if (year && region && yearRegionCounts[year] && regionNames.includes(region)) {
            yearRegionCounts[year][region] += 1;
        }
    });

    // Convert to array format
    return Object.entries(yearRegionCounts)
        .map(([year, values]) => ({
            year,
            values,
        }))
        .sort((a, b) => a.year.localeCompare(b.year));
}

function getComponentSummaryForTreemap(
    filters: Filters | null,
): ComponentSummary {
    const filteredData = applyFilters(mapData, filters);

    const componentFrequency: Record<string, {
    name: string;
    color: string;
    children: Array<{ name: string; value: number }>;
  }> = {};

    // Process each record's prioritized components
    filteredData.forEach((record) => {
        record.prioritized_components.forEach((component) => {
            const { areaTitle, componentTitle } = component;

            // Initialize area if not exists
            if (!componentFrequency[areaTitle]) {
                componentFrequency[areaTitle] = {
                    name: areaTitle,
                    color: AREA_COLORS[areaTitle as keyof typeof AREA_COLORS] || '#CCCCCC',
                    children: [],
                };
            }

            // Find or create component in children array
            const existingComponent = componentFrequency[areaTitle].children.find(
                (child) => child.name === componentTitle,
            );

            if (existingComponent) {
                existingComponent.value += 1;
            } else {
                componentFrequency[areaTitle].children.push({
                    name: componentTitle,
                    value: 1,
                });
            }
        });
    });

    // Sort children by value in descending order
    Object.values(componentFrequency).forEach((area) => {
        area.children.sort((a, b) => b.value - a.value);
    });

    return {
        name: 'Root',
        children: Object.values(componentFrequency)
            .filter((area) => area.children.length > 0)
            .sort((a, b) => b.children.reduce((sum, child) => sum + child.value, 0)
        - a.children.reduce((sum, child) => sum + child.value, 0)),
    };
}

function getPERConsiderations(
    filters: Filters | null,
): PERConsiderationsData {
    const filteredData = applyFilters(mapData, filters);

    // Define assessment types and normalize names for consistency
    const assessmentTypeMapping: Record<string, string> = {
        'Self assessment': 'SelfAssessment',
        SelfAssessment: 'SelfAssessment',
        Simulation: 'Simulation',
        'Post operational': 'PostOperational',
        PostOperational: 'PostOperational',
        Operational: 'Operational',
    };

    const assessmentTypes: Array<string> = [
        'SelfAssessment',
        'Simulation',
        'PostOperational',
        'Operational',
    ];

    // Define regions
    const regions: Array<string> = [
        'Africa',
        'Americas',
        'Europe',
        'Asia Pacific',
        'MENA',
    ];

    // Initialize summary data structures
    const considerations: Record<string, Record<string, ChartDataItem>> = {
        epi_considerations: {},
        climate_environmental_considerations: {},
        urban_considerations: {},
        migration_considerations: {},
    };

    // Initialize counts per region and assessment type for each consideration
    regions.forEach((region) => {
        considerations.epi_considerations[region] = { name: region };
        considerations.climate_environmental_considerations[region] = {
            name: region,
        };
        considerations.urban_considerations[region] = { name: region };
        considerations.migration_considerations[region] = { name: region };

        assessmentTypes.forEach((type) => {
            considerations.epi_considerations[region][type] = 0;
            considerations.climate_environmental_considerations[region][type] = 0;
            considerations.urban_considerations[region][type] = 0;
            considerations.migration_considerations[region][type] = 0;
        });
    });

    // Initialize total counts
    let totalAssessments = 0;
    let totalEpiConsiderations = 0;
    let totalClimateConsiderations = 0;
    let totalUrbanConsiderations = 0;
    let totalMigrationConsiderations = 0;

    // Process the filtered data
    filteredData.forEach((record) => {
        const regionName = record.region_name;
        const assessmentType = assessmentTypeMapping[record.type_of_assessment_name];

        if (!assessmentType || !regions.includes(regionName)) {
            return; // Skip if assessment type or region is not recognized
        }

        totalAssessments += 1;

        // EPI Considerations
        if (record.epi_considerations) {
            considerations.epi_considerations[regionName][assessmentType] += 1;
            totalEpiConsiderations += 1;
        }

        // Climate Environmental Considerations
        if (record.climate_environmental_considerations) {
            considerations.climate_environmental_considerations[regionName][assessmentType] += 1;
            totalClimateConsiderations += 1;
        }

        // Urban Considerations
        if (record.urban_considerations) {
            considerations.urban_considerations[regionName][assessmentType] += 1;
            totalUrbanConsiderations += 1;
        }

        // Migration Considerations
        if (record.migration_considerations) {
            considerations.migration_considerations[regionName][assessmentType] += 1;
            totalMigrationConsiderations += 1;
        }
    });

    // Convert the considerations data into arrays
    const epiConsiderationsArray = regions.map(
        (region) => considerations.epi_considerations[region],
    );

    const climateConsiderationsArray = regions.map(
        (region) => considerations.climate_environmental_considerations[region],
    );

    const urbanConsiderationsArray = regions.map(
        (region) => considerations.urban_considerations[region],
    );

    const migrationConsiderationsArray = regions.map(
        (region) => considerations.migration_considerations[region],
    );

    // Calculate percentages
    const epiPercentage = totalAssessments > 0
        ? (totalEpiConsiderations / totalAssessments) * 100
        : 0;

    const climatePercentage = totalAssessments > 0
        ? (totalClimateConsiderations / totalAssessments) * 100
        : 0;

    const urbanPercentage = totalAssessments > 0
        ? (totalUrbanConsiderations / totalAssessments) * 100
        : 0;

    const migrationPercentage = totalAssessments > 0
        ? (totalMigrationConsiderations / totalAssessments) * 100
        : 0;

    // Return the summarized data
    return {
        data: [
            epiConsiderationsArray,
            climateConsiderationsArray,
            urbanConsiderationsArray,
            migrationConsiderationsArray,
        ],
        totals: {
            totalAssessments,
            totalEpiConsiderations,
            totalClimateConsiderations,
            totalUrbanConsiderations,
            totalMigrationConsiderations,
        },
        percentages: {
            epiPercentage: Math.floor(epiPercentage),
            climatePercentage: Math.floor(climatePercentage),
            urbanPercentage: Math.floor(urbanPercentage),
            migrationPercentage: Math.floor(migrationPercentage),
        },
    };
}

function getKPIData(
    filters: Filters | null = null,
): Array<KPIData> {
    // Apply all filters
    const data = applyFilters(mapData, filters);

    const totalEngaged = data.length;
    let orientation = 0;
    let assessment = 0;
    let action = 0;
    let completed = 0;

    data.forEach((record) => {
        if (record.phase === 1) {
            orientation += 1;
        }
        if (record.phase >= 2) {
            assessment += 1;
        }
        if (record.phase === 5) {
            action += 1;
        }
        if (record.assessment_number >= 2) {
            completed += 1;
        }
    });

    return [
        {
            key: 'total-engaged',
            value: totalEngaged,
            description: 'Total number of NS engaged in PER process',
        },
        {
            key: 'orientation',
            value: orientation,
            color: '#00B2A2',
            description: 'Number of NS currently in initial Orientation phase',
        },
        {
            key: 'assessment',
            value: assessment,
            color: '#DA283D',
            description: 'Number of NS who completed or are in assessment phase',
        },
        {
            key: 'action',
            value: action,
            color: '#FF8654',
            description: 'Number of NS at Action & Accountability phase',
        },
        {
            key: 'completed',
            value: completed,
            description: 'Number of NS completed 2+ cycles of PER process',
        },
    ];
}

const allProcessedData = {
    mapData: processFilteredMapData(),
    recordsByRegion: getRecordsByRegion(),
    filterOptions: getFilterOptions(),
    recordsByAssessmentType: getRecordsByAssessmentType(null),
};

function getLastUpdateDate(): string {
    return lastUpdateData?.lastUpdate ?? 'N/A';
}

// Export types
export type {
    AssessmentRecord,
    ChartDataItem,
    ComponentSummary,
    FilterOptions,
    Filters,
    KPIData,
    PERConsiderationsData,
};

// Export functions
export {
    applyFilters,
    assignFillColors,
    getComponentSummaryForTreemap,
    getFilteredMapData,
    getFilterOptions,
    getKPIData,
    getLastUpdateDate,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
    groupByAndFilter,
    initializeData,
    processMapData,
};

export default allProcessedData;
