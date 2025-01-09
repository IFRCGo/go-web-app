export interface ComponentSummary {
    id: string;
    color: string;
    name: string;
    value?: number;
    children?: ComponentSummary[];
}

interface PrioritizedComponent {
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
// Chart data interfaces
export interface ChartDataItem {
    name: string;
    SelfAssessment: number;
    Simulation: number;
    PostOperational: number;
    Operational: number;
    [key: string]: string | number;
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

// Map specific types
export interface MapAssessmentRecord extends AssessmentRecord {
    color: string;
}
