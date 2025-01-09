export interface AssessmentRecord {
    id: number;
    phase: number;
    phase_display: string;
    region: string;
    assessment_type: string;
    year: number;
    cycle: number;
    completed: boolean;
    high_priority_component?: string;
    per_considerations?: string;
    number_of_cycles?: number;
    high_priority_area?: string;
    [key: string]: any;
}

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

export interface PERConsiderationsData {
    considerations: string[];
    data: {
        [key: string]: {
            count: number;
            percentage: number;
        };
    };
}
