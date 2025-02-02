// Basic types
export type AssessmentType = 'Self assessment' | 'Simulation' | 'Operational' | 'Post operational';

// Base interfaces
export interface Assessment {
    assessment_id: number;
    assessment_number: number;
    country_id: number;
    country_name: string;
    region_id: number;
    region_name: string;
    date_of_assessment: string;
    rating_value: number;
    rating_title: string;
}

export interface Component {
    component_id: number;
    component_num: number;
    component_name: string;
    area_id: number;
    area_name: string;
    assessments: Assessment[];
}

export interface ComponentSummary {
    id: string;
    color: string;
    name: string;
    value?: number;
    children?: ComponentSummary[];
}

export interface PrioritizedComponent {
    areaTitle: string;
    componentTitle: string;
}

export interface AssessmentRecord {
    id: number;
    country_id: number;
    country_name: string;
    region_name: string;
    date_of_assessment: string;
    type_of_assessment: string;
    country_iso3: string;
    assessment_date: string;
    created_at: string;
    updated_at: string;
    phase: number;
    phase_display: string;
    assessment_number: number;
    type_of_assessment_name: string;
    prioritized_components: PrioritizedComponent[];
    epi_considerations: boolean;
    climate_environmental_considerations: boolean;
    urban_considerations: boolean;
    migration_considerations: boolean;
    lat: number;
    lon: number;
    latitude: number;
    longitude: number;
    color?: string;
}

export interface KPIData {
    label: string;
    value: number;
}

// Chart data interfaces
export interface ChartDataItem {
    name: string;
    SelfAssessment: number;
    Simulation: number;
    PostOperational: number;
    Operational: number;
    [key: string]: string | number;
}

export interface ChartData {
    [key: string]: ChartDataItem;
}

export interface PercentageData {
    epiPercentage: number;
    climatePercentage: number;
    urbanPercentage: number;
    migrationPercentage: number;
}

export interface TotalsData {
    totalAssessments: number;
    totalEpiConsiderations: number;
    totalClimateConsiderations: number;
    totalUrbanConsiderations: number;
    totalMigrationConsiderations: number;
}

export interface PERConsiderationsData {
    percentages: PercentageData;
    totals: TotalsData;
    data: ChartData;
}

// Filter interfaces
export interface FilterOptions {
    regions: string[];
    years: number[];
    phases: number[];
    assessmentTypes: string[];
}

export interface Filters {
    region?: string | null;
    year?: number | null;
    phase?: number | null;
    id?: number | null;
    perConsiderations?: string | null;
    completedAssessment?: boolean | null;
    highPriorityComponent?: string | null;
    assessmentType?: string | null;
    numberOfCycles?: number | null;
}

// Summary Dashboard specific types
export interface PERData {
    assessments: Component[];
}

export interface RegionRecord {
    region: string;
    count: number;
}

export interface StackedBarData {
    year: number;
    data: {
        region: string;
        count: number;
    }[];
}

export interface TreemapData {
    id: number;
    name: string;
    value: number;
    rating: number;
}

export interface ConsiderationData {
    id: number;
    title: string;
    description: string;
    rating: number;
}

// Map specific types
export interface MapAssessmentRecord extends AssessmentRecord {
    color: string;
}
