import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import useCountry from './useCountry';

function useCountryHasAdmin2(countryId: number | undefined) {
    const countries = useCountry();

    const iso3 = useMemo(
        () => countries?.find((country) => country.id === countryId)?.iso3 ?? '',
        [countries, countryId],
    );

    const {
        response,
        pending,
        error,
    } = useRequest({
        skip: !iso3,
        url: '/api/v2/admin2/',
        query: {
            admin1__country__iso3: iso3 ?? undefined,
            // NOTE: we just need 1 value to check
            limit: 1,
        },
    });

    const errored = isDefined(error);

    const hasAdmin2 = pending || errored || !isDefined(response)
        ? undefined
        : (response.results?.length ?? 0) > 0;

    return {
        hasAdmin2,
        pending,
        errored,
    };
}

export default useCountryHasAdmin2;
