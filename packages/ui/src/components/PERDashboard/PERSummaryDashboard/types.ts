// Re-export shared types
export type {
    AssessmentType,
    Assessment,
    Component,
    PrioritizedComponent,
    AssessmentRecord,
    KPIData,
    ComponentSummary,
    FilterOptions,
    Filters,
    PercentageData,
    TotalsData,
    ChartDataItem,
    ChartData,
    PERConsiderationsData,
} from '../types';

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
