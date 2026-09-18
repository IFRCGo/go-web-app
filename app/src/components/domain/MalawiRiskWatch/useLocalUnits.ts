import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import { MALAWI_ISO3 } from './constants';

function useLocalUnits() {
    const {
        response,
        pending,
    } = useRequest({
        url: '/api/v2/public-local-units/',
        query: {
            country__iso3: MALAWI_ISO3,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const featureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
        () => ({
            type: 'FeatureCollection',
            features: (response?.results ?? []).map((unit) => {
                const geometry = unit.location_geojson as unknown as GeoJSON.Geometry | undefined;
                if (geometry?.type !== 'Point') {
                    return undefined;
                }
                return {
                    type: 'Feature' as const,
                    id: unit.id,
                    geometry,
                    properties: { id: unit.id },
                };
            }).filter(isDefined),
        }),
        [response],
    );

    return {
        featureCollection,
        pending,
    };
}

export default useLocalUnits;
