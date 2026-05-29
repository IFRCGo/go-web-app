import {
    COLOR_BLUE_GRADIENT_5,
    COLOR_RED_GRADIENT_5,
} from '#utils/constants';

// Recipe table for HDX-sourced background layers rendered as admin2 choropleths.
// CSVs are admin2-keyed via the `ADM2_PCODE` column (HDX convention) and joined
// against the Mapbox `go-admin2-${iso3}-staging` tileset's feature `code`.
//
// One CSV may expose multiple metrics. Each metric becomes a flat option in the
// layer-selection radio, labelled "{dataset.label} — {metric.label}".
//
// Order is intentional (semantic grouping), not alphabetical:
//   1. hazard inputs:  flood_exposure, vulnerability
//   2. capacity:       facilities, access
//   3. context:        demographics, rural_population
//
// Unknown HDX datasets returned by the backend are silently skipped.

export type HdxColorRamp = readonly string[];

export interface HdxMetricRecipe {
    column: string;
    label: string;
    // 'percent' assumes the source value is already on a 0-100 scale.
    format?: 'number' | 'percent';
}

export interface HdxLayerRecipe {
    datasetName: string;
    label: string;
    joinColumn: string;
    colorRamp: HdxColorRamp;
    metrics: HdxMetricRecipe[];
}

const ADM2_JOIN = 'ADM2_PCODE';

export const HDX_LAYER_RECIPES: HdxLayerRecipe[] = [
    {
        datasetName: 'MWI_ADM2_flood_exposure',
        label: 'Flood exposure (RP100)',
        joinColumn: ADM2_JOIN,
        colorRamp: COLOR_RED_GRADIENT_5,
        metrics: [
            { column: 'RP100_pop_u15_30cm', label: 'Under-15 population exposed' },
            { column: 'RP100_female_pop_30cm', label: 'Female population exposed' },
            { column: 'RP100_elderly_30cm', label: 'Elderly population exposed' },
            { column: 'RP100_hospitals_30cm_pct', label: 'Hospitals at risk (%)', format: 'percent' },
            { column: 'RP100_education_30cm_pct', label: 'Education facilities at risk (%)', format: 'percent' },
        ],
    },
    {
        datasetName: 'MWI_ADM2_vulnerability',
        label: 'Vulnerability',
        joinColumn: ADM2_JOIN,
        colorRamp: COLOR_RED_GRADIENT_5,
        metrics: [
            { column: 'pop_u15', label: 'Under-15 population' },
            { column: 'female_pop', label: 'Female population' },
            { column: 'elderly', label: 'Elderly population' },
            { column: 'rural_pop_perc', label: 'Rural population (%)', format: 'percent' },
        ],
    },
    {
        datasetName: 'MWI_ADM2_facilities',
        label: 'Facilities',
        joinColumn: ADM2_JOIN,
        colorRamp: COLOR_BLUE_GRADIENT_5,
        metrics: [
            { column: 'hospitals_count', label: 'Hospitals' },
        ],
    },
    {
        datasetName: 'MWI_ADM2_access',
        label: 'Access',
        joinColumn: ADM2_JOIN,
        colorRamp: COLOR_BLUE_GRADIENT_5,
        metrics: [
            { column: 'access_pop_hospitals_30min', label: 'Pop. within 30 min of hospital' },
            { column: 'access_pop_primary_healthcare_30min', label: 'Pop. within 30 min of primary care' },
            { column: 'access_pop_education_5km', label: 'Pop. within 5 km of education' },
        ],
    },
    {
        datasetName: 'MWI_ADM2_demographics',
        label: 'Demographics',
        joinColumn: ADM2_JOIN,
        colorRamp: COLOR_BLUE_GRADIENT_5,
        metrics: [
            { column: 'pop_u15', label: 'Under-15 population' },
            { column: 'elderly', label: 'Elderly population' },
            { column: 'female_pop', label: 'Female population' },
        ],
    },
    {
        datasetName: 'MWI_ADM2_rural_population',
        label: 'Rural population',
        joinColumn: ADM2_JOIN,
        colorRamp: COLOR_BLUE_GRADIENT_5,
        metrics: [
            { column: 'rural_pop_perc', label: 'Rural (%)', format: 'percent' },
            { column: 'pop_u15_rural', label: 'Rural under-15 population' },
        ],
    },
];

export type HdxOptionKey = string;

export interface HdxOption {
    key: HdxOptionKey;
    label: string;
    recipe: HdxLayerRecipe;
    metric: HdxMetricRecipe;
}

// Build a flat list of `{datasetName} — {metricColumn}` options from a list of
// known dataset names returned by the backend. Datasets not in the recipe table
// are dropped.
export function buildHdxOptions(availableDatasetNames: Set<string>): HdxOption[] {
    return HDX_LAYER_RECIPES
        .filter((recipe) => availableDatasetNames.has(recipe.datasetName))
        .flatMap((recipe) => recipe.metrics.map((metric) => ({
            key: `${recipe.datasetName}__${metric.column}`,
            label: `${recipe.label} — ${metric.label}`,
            recipe,
            metric,
        })));
}
