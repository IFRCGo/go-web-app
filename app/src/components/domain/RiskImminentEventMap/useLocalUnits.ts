import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

type LocationGeoJson = {
    type: 'Point';
    coordinates: [number, number];
};

// Local-units point layer state (a single togglable marker layer + opacity),
// modelled like the HDX point groups in the design handoff.
export interface LocalUnitsSelection {
    active: boolean;
    opacity: number;
}

export const DEFAULT_LOCAL_UNITS_OPACITY = 90;

// Fetches a country's National Society local units (public endpoint, same data
// source as the NS LocalUnitsMap) and shapes them into a point FeatureCollection.
export default function useLocalUnits(iso3: string | undefined, enabled: boolean) {
    const { response, pending } = useRequest({
        skip: !enabled || !iso3,
        url: '/api/v2/public-local-units/',
        query: {
            country__iso3: iso3,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const geoJson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point, { id: number }>>(
        () => ({
            type: 'FeatureCollection',
            features: (response?.results ?? [])
                .map((unit) => {
                    const geometry = unit.location_geojson as unknown as
                        | LocationGeoJson
                        | undefined;
                    if (!geometry || geometry.type !== 'Point') {
                        return undefined;
                    }
                    return {
                        type: 'Feature' as const,
                        geometry,
                        properties: { id: unit.id },
                    };
                })
                .filter(isDefined),
        }),
        [response],
    );

    return { geoJson, pending };
}
