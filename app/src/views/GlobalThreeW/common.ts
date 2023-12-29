export interface NSOngoingProjectStat {
    id: number;
    iso3: string;
    ongoing_projects: number;
    target_total: number;
    society_name: string;
    name: string;
    operation_types: number[];
    operation_types_display: string[];
    budget_amount_total: number;
    projects_per_sector: {
        primary_sector: number;
        primary_sector_display: string;
        count: number;
    }[];
}

export interface ProjectPerProgrammeType {
    programme_type: number;
    programme_type_display: string;
    count: number;
}

export interface ProjectPerSector {
    count: number;
    primary_sector: number;
    primary_sector_display: string;
}

export interface ProjectPerSecondarySector {
    count: number;
    secondary_sectors: number;
    secondary_sectors_display: string;
}

export interface GlobalProjectsOverview {
    total_ongoing_projects: number;
    ns_with_ongoing_activities: number;
    target_total: number;
    projects_per_sector: ProjectPerSector[];
    projects_per_programme_type: ProjectPerProgrammeType[];
    projects_per_secondary_sectors: ProjectPerSecondarySector[];
}

export function countSelector(d: { count: number | null | undefined }) {
    return d.count;
}

export function projectPerSectorLabelSelector(
    projectPerSector: GlobalProjectsOverview['projects_per_sector'][number],
) {
    return projectPerSector.primary_sector_display;
}

export function projectPerSectorKeySelector(
    projectPerSector: GlobalProjectsOverview['projects_per_sector'][number],
) {
    return projectPerSector.primary_sector;
}
