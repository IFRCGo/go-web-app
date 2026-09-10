import { useMemo } from 'react';
import { listToMap } from '@togglecorp/fujs';

import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import { MALAWI_ISO3 } from './constants';
import { type AdminArea } from './utils';

function useMalawiAdminAreas() {
    const {
        response,
        pending,
    } = useRequest({
        url: '/api/v2/admin2/',
        query: {
            admin1__country__iso3: MALAWI_ISO3,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const adminAreaByCode = useMemo(
        () => listToMap(
            response?.results ?? [],
            (adminArea: AdminArea) => adminArea.code,
            (adminArea) => adminArea,
        ),
        [response],
    );

    return {
        adminAreaByCode,
        pending,
    };
}

export default useMalawiAdminAreas;
