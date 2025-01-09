export interface ActiveFilters {
    id: number | null;
    region: string | null;
    assessmentType: string | null;
    year: number | null;
    phase: number | null;
    highPriorityComponent: string | null;
    perConsiderations: string | null;
    numberOfCycles: number | null;
    completedAssessment: boolean | null;
    highPriorityArea?: string | null;
}

export interface ComponentData {
    area: string;
    component: string | null;
}

export interface AssessmentItem {
    label: string;
}

export interface YearRegionItem {
    year?: string | number | null;
    label?: string;
}
