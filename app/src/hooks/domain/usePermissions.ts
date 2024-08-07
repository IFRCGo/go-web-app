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
            const isRegionPerAdmin = (regionId: number | undefined) => (
                isDefined(regionId) && !!userMe?.is_per_admin_for_regions.includes(regionId)
            );
            const isCountryPerAdmin = (countryId: number | undefined) => (
                isDefined(countryId) && !!userMe?.is_per_admin_for_countries.includes(countryId)
            );

            const isPerAdmin = (userMe?.is_per_admin_for_countries.length ?? 0) > 0
                || (userMe?.is_admin_for_regions.length ?? 0) > 0;

            const isGuestUser = (userMe?.limit_access_to_guest);

            return {
                isDrefRegionalCoordinator,
                isRegionAdmin,
                isCountryAdmin,
                isRegionPerAdmin,
                isCountryPerAdmin,
                isPerAdmin,
                isIfrcAdmin: !!userMe?.is_ifrc_admin || !!userMe?.email?.toLowerCase().endsWith('@ifrc.org'),
                isSuperUser: !!userMe?.is_superuser,
                isGuestUser,
            };
        },
        [userMe],
    );

    return perms;
}

export default usePermissions;
