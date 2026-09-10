import { isTruthyString } from '@togglecorp/fujs';

import { malawiRiskWatchGraphqlApi } from '#config';
import { type GoApiResponse } from '#utils/restRequest';

import { MALAWI_ISO3 } from './constants';

export type MalawiRiskWatchSource = 'jba' | 'arc';

export type AdminArea = NonNullable<GoApiResponse<'/api/v2/admin2/'>['results']>[number];

export function isMalawiRiskWatchEnabled(iso3: string | undefined) {
    return isTruthyString(malawiRiskWatchGraphqlApi) && iso3 === MALAWI_ISO3;
}

export function getAdminAreaCentroid(adminArea: AdminArea | undefined) {
    const centroid = adminArea?.centroid as GeoJSON.Geometry | undefined;
    if (centroid?.type !== 'Point') {
        return undefined;
    }
    return centroid;
}

export function getAdminAreaBbox(adminArea: AdminArea | undefined) {
    const bbox = adminArea?.bbox as GeoJSON.Geometry | undefined;
    if (bbox?.type !== 'Polygon') {
        return undefined;
    }
    return bbox;
}
