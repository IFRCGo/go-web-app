import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import useUserMe from '#hooks/domain/useUserMe';

function usePermissions() {
    const userMe = useUserMe();

    const perms = useMemo(
        () => {
            const isDrefRegionalCoordinator = (regionId: number | undefined) => (
                isDefined(regionId) && !!userMe?.is_dref_coordinator_for_regions?.includes(regionId)
            );
            const isCountryAdmin = (countryId: number | undefined) => (
                isDefined(countryId) && !!userMe?.is_admin_for_countries?.includes(countryId)
            );
            const isRegionAdmin = (regionId: number | undefined) => (
                isDefined(regionId) && !!userMe?.is_admin_for_regions?.includes(regionId)
            );
            return {
                isDrefRegionalCoordinator,
                isRegionAdmin,
                isCountryAdmin,
                isIfrcAdmin: !!userMe?.is_ifrc_admin || !!userMe?.email?.toLowerCase().endsWith('@ifrc.org'),
                isSuperUser: !!userMe?.is_superuser,
            };
        },
        [userMe],
    );

    return perms;
}

export default usePermissions;
