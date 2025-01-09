import { type PERRatingAnalysisProps } from '@ifrc-go/ui';

// Base interfaces
export interface Assessment {
    component_num: number;
    component_name: string;
    area_id: number;
    area_name: string;

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
    prioritized_components: {
        areaTitle: string;
        componentTitle: string;
    }[];
    epi_considerations: boolean;
    climate_environmental_considerations: boolean;
    urban_considerations: boolean;
    migration_considerations: boolean;
}

export interface Filters {
    region?: string | null;
    year?: number | null;
    phase?: number | null;
    cycle?: number | null;
    id?: number | null;
    perConsiderations?: string | null;
    completedAssessment?: boolean | null;
    highPriorityComponent?: string | null;
    assessmentType?: string | null;
    numberOfCycles?: number | null;
}

interface CycleRating {
    cycle: number;
    rating: number;
    rating_display: string;
    rating_color: string;
}

export interface AreaSummary {
    name: string;
    rating: number;
    status: string;
    change: number;
    changeDirection: string;
    cycleRatings: CycleRating[];
    components: ComponentRating[];
    areaColor: string;
}

export interface ComponentRating {
    component_num: number,
    component_name: string,
    area_id: number,
    area_name: string,
    cycleRatings: CycleRating[],
    total: number,
    count: number,
}

export interface ComponentRatingsResult {
    overallRating: PERRatingAnalysisProps['overallRating'],
    areaData: PERRatingAnalysisProps['areaData'],
    componentData: PERRatingAnalysisProps['componentData'],
}

export interface RegionData {
    name: string;
    count: number;
    totalComponents: number;
}
