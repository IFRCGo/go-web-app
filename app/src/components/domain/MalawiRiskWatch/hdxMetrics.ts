import { listToMap } from '@togglecorp/fujs';

export type HdxMetricFormat = 'number' | 'percent';

// Metrics exposed from the HDX admin-2 CSVs served by the backend
interface HdxMetric {
    datasetName: string;
    column: string;
    format: HdxMetricFormat;
}

export const HDX_METRICS: HdxMetric[] = [
    { datasetName: 'MWI_ADM2_flood_exposure', column: 'RP100_pop_u15_30cm', format: 'number' },
    { datasetName: 'MWI_ADM2_flood_exposure', column: 'RP100_female_pop_30cm', format: 'number' },
    { datasetName: 'MWI_ADM2_flood_exposure', column: 'RP100_elderly_30cm', format: 'number' },
    { datasetName: 'MWI_ADM2_flood_exposure', column: 'RP100_hospitals_30cm_pct', format: 'percent' },
    { datasetName: 'MWI_ADM2_flood_exposure', column: 'RP100_education_30cm_pct', format: 'percent' },
    { datasetName: 'MWI_ADM2_vulnerability', column: 'pop_u15', format: 'number' },
    { datasetName: 'MWI_ADM2_vulnerability', column: 'female_pop', format: 'number' },
    { datasetName: 'MWI_ADM2_vulnerability', column: 'elderly', format: 'number' },
    { datasetName: 'MWI_ADM2_vulnerability', column: 'rural_pop_perc', format: 'percent' },
    { datasetName: 'MWI_ADM2_facilities', column: 'hospitals_count', format: 'number' },
    { datasetName: 'MWI_ADM2_access', column: 'access_pop_hospitals_30min', format: 'number' },
    { datasetName: 'MWI_ADM2_access', column: 'access_pop_primary_healthcare_30min', format: 'number' },
    { datasetName: 'MWI_ADM2_access', column: 'access_pop_education_5km', format: 'number' },
    { datasetName: 'MWI_ADM2_demographics', column: 'pop_u15', format: 'number' },
    { datasetName: 'MWI_ADM2_demographics', column: 'elderly', format: 'number' },
    { datasetName: 'MWI_ADM2_demographics', column: 'female_pop', format: 'number' },
    { datasetName: 'MWI_ADM2_rural_population', column: 'rural_pop_perc', format: 'percent' },
    { datasetName: 'MWI_ADM2_rural_population', column: 'pop_u15_rural', format: 'number' },
];

export function getHdxMetricKey(metric: Pick<HdxMetric, 'datasetName' | 'column'>) {
    return `${metric.datasetName}__${metric.column}`;
}

export const HDX_METRIC_BY_KEY = listToMap(
    HDX_METRICS,
    getHdxMetricKey,
    (metric) => metric,
);
