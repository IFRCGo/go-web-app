export const MALAWI_ISO3 = 'MWI';

export const JBA_RUNS_LIMIT = 60;
export const JBA_DEFAULT_LEAD_TIME_DAYS = 3;
// Pending confirmation with MRCS; any forecasted impact counts for now
export const JBA_IMPACT_THRESHOLD = 1;

export type LayerColor = 'blue' | 'red' | 'grey';
// Light to dark, one colour per class; bubbles use the darkest
export const LAYER_COLOR_RAMPS: Record<LayerColor, [string, string, string, string]> = {
    blue: ['#c7d3e0', '#7d8b9d', '#4c5d9b', '#011e41'],
    red: ['#fdccd0', '#fa999f', '#f8666f', '#f5333f'],
    grey: ['#e0e0e0', '#bdbdbd', '#8f8f8f', '#616161'],
};
export const DEFAULT_SHADE_COLOR: LayerColor = 'blue';
export const DEFAULT_BUBBLE_COLOR: LayerColor = 'grey';

export const HDX_ADM2_JOIN_COLUMN = 'ADM2_PCODE';
// The active source's own metric, selectable next to the HDX metrics
export const FORECAST_METRIC_KEY = 'forecast';
export const BUBBLE_MAX_RADIUS = 20;
// Keeps thematic layers under the basemap labels and the hazard markers
export const BASEMAP_ADMIN_1_BOUNDARY_LAYER = 'admin-1-boundary';
