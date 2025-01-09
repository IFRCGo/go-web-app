import type { ActiveFilters } from '../types';
import type { AssessmentRecord } from '../../data-fetcher/types';

// Import JSON data
import perAssessmentsProcessedDataRaw from '../../data-fetcher/data/per-assessments-processed.json';
import perDashboardDataRaw from '../../data-fetcher/data/per-dashboard-data.json';
import perAssessmentsDataRaw from '../../data-fetcher/data/per-assessments.json';

const perAssessmentsProcessedData = perAssessmentsProcessedDataRaw;
const perDashboardData = perDashboardDataRaw;
const perAssessmentsData = perAssessmentsDataRaw;

// TODO: Replace with actual API calls and data processing
export function groupDataByRegion(): Array<{ region: string; data: AssessmentRecord[] }> {
    return perAssessmentsProcessedData.grouped_by_region || [];
}

export function getComponentRatings(filters: ActiveFilters, includeLatest: boolean) {
    return {
        overall: perDashboardData.overall_rating || 0,
        areas: perDashboardData.area_ratings || [],
        components: perDashboardData.component_ratings || [],
    };
}

export function summarizeData(filters: ActiveFilters, includeLatest: boolean) {
    return perDashboardData.summary_data || {};
}

export function getCycles(filters: ActiveFilters): Array<{ id: number; year: number }> {
    return perAssessmentsData.cycles || [];
}
