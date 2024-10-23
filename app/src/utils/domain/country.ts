import { isNotDefined } from '@togglecorp/fujs';

import {
    COUNTRY_AFRICA_REGION,
    COUNTRY_AMERICAS_REGION,
    COUNTRY_ASIA_REGION,
    COUNTRY_EUROPE_REGION,
    COUNTRY_MENA_REGION,
    type Region,
    REGION_AFRICA,
    REGION_AMERICAS,
    REGION_ASIA,
    REGION_EUROPE,
    REGION_MENA,
} from '#utils/constants';

export const countryIdToRegionIdMap: Record<number, Region> = {
    [COUNTRY_AFRICA_REGION]: REGION_AFRICA,
    [COUNTRY_AMERICAS_REGION]: REGION_AMERICAS,
    [COUNTRY_ASIA_REGION]: REGION_ASIA,
    [COUNTRY_EUROPE_REGION]: REGION_EUROPE,
    [COUNTRY_MENA_REGION]: REGION_MENA,
};

export function isCountryIdRegion(countryId: number | null | undefined) {
    if (isNotDefined(countryId)) {
        return false;
    }

    return countryId === COUNTRY_ASIA_REGION
        || countryId === COUNTRY_AFRICA_REGION
        || countryId === COUNTRY_AMERICAS_REGION
        || countryId === COUNTRY_EUROPE_REGION
        || countryId === COUNTRY_MENA_REGION;
}
