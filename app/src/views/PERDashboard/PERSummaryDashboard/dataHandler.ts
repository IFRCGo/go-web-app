import {
    type AssessmentRecord,
    type ChartDataItem,
    type ComponentSummary,
    type FilterOptions,
    type Filters,
    type MapAssessmentRecord,
    type PercentageData,
    type PERData,
    type PrioritizedComponent,
    type TotalsData,
} from './types';

let mapData: MapAssessmentRecord[] = [];
interface LastUpdateData {
    lastUpdate: string;
}

let lastUpdateData: LastUpdateData | null = null;

function initializeData(data: MapAssessmentRecord[], updateData: LastUpdateData) {
    mapData = data;
    lastUpdateData = updateData;
}

interface RawAssessmentRecord {
    id: number;
    country_id: number;
    country_name: string;
    region_name: string;
    date_of_assessment: string;
    phase: number;
    phase_display: string;
    assessment_number: number;
    type_of_assessment_name: string;
    prioritized_components: {
        id: number;
        name: string;
        score?: number;
    }[];
    epi_considerations: {
        description?: string;
        value?: boolean | string;
    };
    climate_environmental_considerations: {
        description?: string;
        value?: boolean | string;
    };
    urban_considerations: {
        description?: string;
        value?: boolean | string;
    };
    migration_considerations: {
        description?: string;
        value?: boolean | string;
    };
    latitude: number;
    longitude: number;
}

const AREA_COLORS = {
    'Policy Strategy and Standards': '#8748b3',
    'Analysis and planning': '#ff8655',
    'Operations support': '#da283d',
    'Operational capacity': '#3478ec',
    Coordination: '#00B2A2',
} as const;

const PHASE_COLORS = [
    {
        phase: 'Orientation',
        label: 'Orientation',
        phaseNumber: 1,
        color: '#00B2A2',
    },
    {
        phase: 'Assessment',
        label: 'Assessment',
        phaseNumber: 2,
        color: '#DA283D',
    },
    {
        phase: 'Prioritisation',
        label: 'Prioritisation & analysis',
        phaseNumber: 3,
        color: '#3377EB',
    },
    {
        phase: 'Workplan',
        label: 'Workplan',
        phaseNumber: 4,
        color: '#8648B3',
    },
    {
        phase: 'Action & accountability',
        label: 'Action & accountability',
        phaseNumber: 5,
        color: '#FF8654',
    },
];

function processMapData(rawData: RawAssessmentRecord[]): AssessmentRecord[] {
    return rawData.map((record) => ({
        id: record.id,
        country_id: record.country_id,
        country_name: record.country_name,
        region_name: record.region_name,
        date_of_assessment: record.date_of_assessment,
        type_of_assessment: record.type_of_assessment_name,
        country_iso3: '', // This needs to be provided from the raw data
        assessment_date: record.date_of_assessment,
        created_at: record.date_of_assessment, // Using date_of_assessment as fallback
        updated_at: record.date_of_assessment, // Using date_of_assessment as fallback
        lat: record.latitude,
        lon: record.longitude,
        phase: record.phase,
        phase_display: record.phase_display,
        assessment_number: record.assessment_number,
        type_of_assessment_name: record.type_of_assessment_name,
        prioritized_components: record.prioritized_components.map((component) => ({
            areaTitle: component.name.split(' - ')[0],
            componentTitle: component.name.split(' - ')[1] || component.name,
        })),
        epi_considerations: record.epi_considerations?.value === true,
        climate_environmental_considerations:
            record.climate_environmental_considerations?.value === true,
        urban_considerations: record.urban_considerations?.value === true,
        migration_considerations: record.migration_considerations?.value === true,
        latitude: record.latitude,
        longitude: record.longitude,
        color: PHASE_COLORS[record.phase]?.color || '#CCCCCC', // Required by MapAssessmentRecord
    }));
}

function groupByAndFilter(
    data: Array<MapAssessmentRecord>,
    groupKey: keyof MapAssessmentRecord,
    compareKey: keyof MapAssessmentRecord,
): Array<MapAssessmentRecord> {
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
    {} as Record<string, MapAssessmentRecord>,
    );

    return Object.values(groupedDataMap);
}

function assignFillColors(
    data: Array<AssessmentRecord>,
): Array<MapAssessmentRecord> {
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
            ...new Set(mapData.map((record: MapAssessmentRecord) => record.region_name)),
        ].filter(Boolean),
        years: [
            ...new Set(
                mapData.map((record: MapAssessmentRecord) => {
                    const date = new Date(record.date_of_assessment);
                    return date.getFullYear();
                }),
            ),
        ].sort((a, b) => b - a),
        phases: [
            ...new Set(mapData.map((record: MapAssessmentRecord) => record.phase)),
        ].sort((a, b) => a - b),
        assessmentTypes: [
            ...new Set(
                mapData.map(
                    (record: MapAssessmentRecord) => record.type_of_assessment_name,
                ),
            ),
        ].filter(Boolean),
    };
}

function applyFilters(
    data: Array<MapAssessmentRecord>,
    filters: Filters | null = null,
): Array<MapAssessmentRecord> {
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
            (record) => record[filters.perConsiderations as keyof MapAssessmentRecord],
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
): Array<MapAssessmentRecord> {
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
): Array<MapAssessmentRecord> {
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
): Array<{ year: string; values: Record<string, number>; label: string }> {
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
            label: year,
        }))
        .sort((a, b) => a.year.localeCompare(b.year));
}

function getComponentSummaryForTreemap(
    filters: Filters | null,
): ComponentSummary {
    const filteredData = applyFilters(mapData, filters);

    const componentFrequency: Record<string, {
        name: string;
        id: string;
        color: string;
        children: Array<{ name: string; value: number; id: string; color: string }>;
    }> = {};

    // Process each record's prioritized components
    filteredData.forEach((record) => {
        record.prioritized_components.forEach((component) => {
            const { areaTitle, componentTitle } = component;

            // Initialize area if not exists
            if (!componentFrequency[areaTitle]) {
                componentFrequency[areaTitle] = {
                    name: areaTitle,
                    id: areaTitle,
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
                    id: `${areaTitle}-${componentTitle}`,
                    value: 1,
                    color: AREA_COLORS[areaTitle as keyof typeof AREA_COLORS] || '#CCCCCC',
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
        id: 'root',
        color: '#CCCCCC',
        children: Object.values(componentFrequency)
            .filter((area) => area.children.length > 0)
            .sort((a, b) => b.children.reduce((sum, child) => sum + child.value, 0)
                - a.children.reduce((sum, child) => sum + child.value, 0)),
    };
}

function getPERConsiderations(
    filters: Filters | null,
): {
    data: ChartDataItem[][];
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
} {
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

    // Define regions
    const regions: Array<string> = [
        'Africa',
        'Americas',
        'Europe',
        'Asia Pacific',
        'MENA',
    ];

    // Initialize summary data structures
    const considerations: Record<
        string,
        Record<string, ChartDataItem>
    > = {
        epi_considerations: {},
        climate_environmental_considerations: {},
        urban_considerations: {},
        migration_considerations: {},
    };

    // Initialize counts per region and assessment type for each consideration
    regions.forEach((region) => {
        considerations.epi_considerations[region] = {
            name: region,
            SelfAssessment: 0,
            Simulation: 0,
            PostOperational: 0,
            Operational: 0,
        } as ChartDataItem;

        considerations.climate_environmental_considerations[region] = {
            name: region,
            SelfAssessment: 0,
            Simulation: 0,
            PostOperational: 0,
            Operational: 0,
        } as ChartDataItem;

        considerations.urban_considerations[region] = {
            name: region,
            SelfAssessment: 0,
            Simulation: 0,
            PostOperational: 0,
            Operational: 0,
        } as ChartDataItem;

        considerations.migration_considerations[region] = {
            name: region,
            SelfAssessment: 0,
            Simulation: 0,
            PostOperational: 0,
            Operational: 0,
        } as ChartDataItem;
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
            considerations.epi_considerations[regionName][
                assessmentType as
                    'SelfAssessment' |
                    'Simulation' |
                    'PostOperational' |
                    'Operational'
            ] += 1;
            totalEpiConsiderations += 1;
        }

        // Climate Environmental Considerations
        if (record.climate_environmental_considerations) {
            const normalizedAssessmentType = assessmentTypeMapping[
                record.type_of_assessment_name
            ] as
                'SelfAssessment' |
                'Simulation' |
                'PostOperational' |
                'Operational';
            considerations.climate_environmental_considerations[regionName][
                normalizedAssessmentType
            ] += 1;
            totalClimateConsiderations += 1;
        }

        // Urban Considerations
        if (record.urban_considerations) {
            const normalizedAssessmentType = assessmentTypeMapping[
                record.type_of_assessment_name
            ] as
                'SelfAssessment' |
                'Simulation' |
                'PostOperational' |
                'Operational';
            considerations.urban_considerations[regionName][
                normalizedAssessmentType
            ] += 1;
            totalUrbanConsiderations += 1;
        }

        // Migration Considerations
        if (record.migration_considerations) {
            considerations.migration_considerations[regionName][
                assessmentType as
                    'SelfAssessment' |
                    'Simulation' |
                    'PostOperational' |
                    'Operational'
            ] += 1;
            totalMigrationConsiderations += 1;
        }
    });

    // Convert the considerations data into arrays
    const epiConsiderationsArray: ChartDataItem[] = regions.map(
        (region) => considerations.epi_considerations[region],
    );

    const climateConsiderationsArray: ChartDataItem[] = regions.map(
        (region) => considerations.climate_environmental_considerations[region],
    );

    const urbanConsiderationsArray: ChartDataItem[] = regions.map(
        (region) => considerations.urban_considerations[region],
    );

    const migrationConsiderationsArray: ChartDataItem[] = regions.map(
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
): Array<{ key: string; value: number; color?: string; description: string }> {
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

export {
    getComponentSummaryForTreemap,
    getFilteredMapData,
    getKPIData,
    getLastUpdateDate,
    getPERConsiderations,
    getRecordsByAssessmentType,
    getRecordsByRegion,
    getStackedBarDataByYearAndRegion,
    initializeData,
};
