import getBbox from '@turf/bbox';

/**
 * Returns the bounding box [west, south, east, north] for any GeoJSON object.
 *
 * Accepts `Record<string, unknown>` so that both proper GeoJSON types and API
 * response data (typed as `{ [key: string]: unknown }`) can be passed without
 * casting at call sites. The return type `[number, number, number, number]` is
 * directly compatible with mapbox-gl's `LngLatBoundsLike`.
 */
// eslint-disable-next-line import/prefer-default-export
export function getGeoJsonBounds(
    geojson: GeoJSON.GeoJSON | Record<string, unknown>,
): [number, number, number, number] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getBbox(geojson as any) as [number, number, number, number];
}
