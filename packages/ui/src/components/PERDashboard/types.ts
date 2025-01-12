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

export interface PrioritizedComponent {
    areaTitle: string;
    componentTitle: string;
}

// Record interfaces
export interface AssessmentRecord {
    id: number;
    country_id: number;
    country_name: string;
    region_name: string;
    date_of_assessment: string;
    phase: number;
    phase_display: string;
    assessment_number: number;
    type_of_assessment_name: string;
    prioritized_components: PrioritizedComponent[];
    epi_considerations: boolean;
    climate_environmental_considerations: boolean;
    urban_considerations: boolean;
    migration_considerations: boolean;
}

// Data interfaces
export interface KPIData {
    label: string;
    value: number;
    total?: number;
    percentage?: number;
}

export interface ComponentSummary {
    name: string;
    value: number;
    children?: ComponentSummary[];
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

// Chart data interfaces
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

export interface ChartDataItem {
    name: string;
    SelfAssessment: number;
    Simulation: number;
    PostOperational: number;
    Operational: number;
}

export type ChartData = ChartDataItem[];

export interface PERConsiderationsData {
    percentages: PercentageData;
    totals: TotalsData;
    data: ChartData;
}

export interface RegionData {
    name: string;
    count: number;
    totalComponents: number;
}

export interface AreaSummary {
    name: string;
    rating: number;
    status: string;
    change: number;
    changeDirection: string;
    cycleRatings: Assessment[];
    components: Component[];
    areaColor: string;
}

export interface CycleRating {
    cycle: number;
    rating: number;
    rating_display: string;
    rating_color: string;
    color?: string;
}

export interface OverallRating {
    rating: number;
    status: string;
    change: number;
    changeDirection: 'up' | 'down';
    cycleRatings: CycleRating[];
    color: string;
}

export interface ComponentRating {
    id: number;
    name: string;
    rating: number;
    status: string;
    change: number;
    changeDirection: 'up' | 'down';
    cycleRatings: CycleRating[];
    areaColor: string;
    type: 'component';
}

export interface AreaRating {
    name: string;
    rating: number;
    status: string;
    change: number;
    changeDirection: 'up' | 'down';
    cycleRatings: CycleRating[];
    components: ComponentRating[];
    areaColor: string;
}

export interface ComponentRatingsResult {
    overallRating: OverallRating;
    areaData: AreaRating[];
    componentData: ComponentRating[];
}
