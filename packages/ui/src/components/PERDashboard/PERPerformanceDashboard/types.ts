export interface ActiveFilters {
    id: number | null;
    region: string | null;
    year: number | null;
    cycle: number | null;
}

export interface Rating {
    rating: number;
    label: string;
    count?: number;
}

export interface ComponentRating {
    overall: number;
    areas: Rating[];
    components: Rating[];
}

export interface CycleData {
    cycle: number;
    data: any[]; // Replace with specific type
}

export interface SummaryData {
    total: number;
    completed: number;
    inProgress: number;
    // Add other summary fields as needed
}
