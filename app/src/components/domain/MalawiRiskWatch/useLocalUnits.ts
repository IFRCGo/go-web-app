import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { getFirstTruthyString } from '#utils/common';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { MALAWI_ISO3 } from './constants';

type LocalUnit = NonNullable<GoApiResponse<'/api/v2/public-local-units/'>['results']>[number];

export interface LocalUnitType {
    code: number;
    name: string;
    color: string | undefined;
    iconUrl: string;
}

export interface LocalUnitProperties {
    id: number;
    name: string;
    typeCode: number;
    typeName: string;
    iconKey: string;
    facilityType: string | undefined;
    address: string | undefined;
}

export function getLocalUnitIconKey(code: number) {
    return `malawi-local-unit-${code}`;
}

type LocalUnitFeature = GeoJSON.Feature<GeoJSON.Point, LocalUnitProperties>;
type LocalUnitCollection = GeoJSON.FeatureCollection<GeoJSON.Point, LocalUnitProperties>;

function toFeature(unit: LocalUnit): LocalUnitFeature | undefined {
    const geometry = unit.location_geojson as unknown as GeoJSON.Geometry | undefined;
    if (geometry?.type !== 'Point') {
        return undefined;
    }
    return {
        type: 'Feature',
        id: unit.id,
        geometry,
        properties: {
            id: unit.id,
            name: getFirstTruthyString(unit.local_branch_name, unit.english_branch_name)
                ?? unit.type_details.name,
            typeCode: unit.type,
            typeName: unit.type_details.name,
            iconKey: getLocalUnitIconKey(unit.type),
            // Only health care units carry health details
            facilityType: unit.health_details?.health_facility_type_details.name,
            address: getFirstTruthyString(unit.address_loc, unit.address_en),
        },
    };
}

function useLocalUnits(skip = false) {
    const {
        response,
        pending,
    } = useRequest({
        skip,
        url: '/api/v2/public-local-units/',
        query: {
            country__iso3: MALAWI_ISO3,
            limit: MAX_PAGE_LIMIT,
        },
    });

    // Only the types present in the country, with the icon GO uses for them
    const types = useMemo<LocalUnitType[]>(
        () => {
            const byCode = new Map<number, LocalUnitType>();
            response?.results?.forEach((unit) => {
                const details = unit.type_details;
                if (!byCode.has(details.code)) {
                    byCode.set(details.code, {
                        code: details.code,
                        name: details.name,
                        color: details.colour ?? undefined,
                        iconUrl: details.image_url,
                    });
                }
            });
            return [...byCode.values()].sort((a, b) => a.code - b.code);
        },
        [response],
    );

    const featureCollection = useMemo<LocalUnitCollection>(
        () => ({
            type: 'FeatureCollection',
            features: (response?.results ?? []).map(toFeature).filter(isDefined),
        }),
        [response],
    );

    return {
        featureCollection,
        types,
        pending,
    };
}

export default useLocalUnits;
