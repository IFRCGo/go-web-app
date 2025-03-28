import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import useUserMe from '#hooks/domain/useUserMe';

function usePermissions() {
    const userMe = useUserMe();

    const perms = useMemo(
        () => {
            const isGuestUser = !!userMe?.limit_access_to_guest;

            const isDrefRegionalCoordinator = (regionId: number | undefined) => (
                !isGuestUser
                && isDefined(regionId)
                && !!userMe?.is_dref_coordinator_for_regions?.includes(regionId)
            );
            const isCountryAdmin = (countryId: number | undefined) => (
                !isGuestUser
                && isDefined(countryId)
                && !!userMe?.is_admin_for_countries?.includes(countryId)
            );
            const isRegionAdmin = (regionId: number | undefined) => (
                !isGuestUser
                && isDefined(regionId)
                && !!userMe?.is_admin_for_regions?.includes(regionId)
            );
            const isRegionPerAdmin = (regionId: number | undefined) => (
                !isGuestUser
                && isDefined(regionId)
                && !!userMe?.is_per_admin_for_regions.includes(regionId)
            );
            const isCountryPerAdmin = (countryId: number | undefined) => (
                !isGuestUser
                && isDefined(countryId)
                && !!userMe?.is_per_admin_for_countries.includes(countryId)
            );

            const isPerAdmin = !isGuestUser
                && ((userMe?.is_per_admin_for_countries.length ?? 0) > 0
                || (userMe?.is_per_admin_for_regions.length ?? 0) > 0);

            const isIfrcAdmin = !isGuestUser
                && (!!userMe?.is_ifrc_admin || !!userMe?.email?.toLowerCase().endsWith('@ifrc.org'));

            const isSuperUser = !isGuestUser && !!userMe?.is_superuser;

            const isRegionalOrCountryAdmin = !isGuestUser
                && ((userMe?.is_admin_for_countries.length ?? 0) > 0
                || (userMe?.is_admin_for_regions.length ?? 0) > 0);

            return {
                isDrefRegionalCoordinator,
                isRegionAdmin,
                isCountryAdmin,
                isRegionPerAdmin,
                isCountryPerAdmin,
                isPerAdmin,
                isIfrcAdmin,
                isSuperUser,
                isGuestUser,
                isRegionalOrCountryAdmin,
            };
        },
        [userMe],
    );

    return perms;
}

export default usePermissions;
