import { useMemo } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type GlobalEnums } from '#contexts/domain';
import useUserMe from '#hooks/domain/useUserMe';

type OrganizationType = NonNullable<GlobalEnums['api_profile_org_types']>[number]['key'];

const canEditLocalUnitOrganization: OrganizationType[] = ['NTLS', 'DLGN', 'SCRT'];

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
            const isRegionAdmin = (regionId: number | null | undefined) => (
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

            const isLocalUnitGlobalValidator = (): boolean => (
                !isGuestUser
                && isDefined(userMe?.local_unit_global_validators)
                && userMe?.local_unit_global_validators.length > 0
            );

            const isLocalUnitGlobalValidatorByType = (localUnitTypeId: number | undefined) => (
                !isGuestUser
                && isDefined(localUnitTypeId)
                && !!userMe?.local_unit_global_validators.includes(localUnitTypeId)
            );

            const isLocalUnitRegionValidatorByType = (
                regionId: number | null | undefined,
                localUnitTypeId: number | undefined,
            ) => (
                !isGuestUser
                && isDefined(localUnitTypeId)
                && isDefined(regionId)
                && !!userMe?.local_unit_region_validators?.some(
                    (entry) => entry.region === regionId
                        && entry.local_unit_types.includes(localUnitTypeId),
                )
            );

            const isLocalUnitRegionValidator = (
                regionId: number | undefined,
            ) => (
                !isGuestUser
                && isDefined(regionId)
                && !!userMe?.local_unit_region_validators?.some(
                    (entry) => entry.region === regionId
                        && entry.local_unit_types.length > 0,
                )
            );

            const isLocalUnitCountryValidatorByType = (
                countryId: number | undefined,
                localUnitTypeId: number | undefined,
            ) => (
                !isGuestUser
                && isDefined(countryId)
                && isDefined(localUnitTypeId)
                && !!userMe?.local_unit_country_validators?.some(
                    (entry) => entry.country === countryId
                        && entry.local_unit_types.includes(localUnitTypeId),
                )
            );

            const isLocalUnitCountryValidator = (
                countryId: number | undefined,
            ) => (
                !isGuestUser
                && isDefined(countryId)
                && !!userMe?.local_unit_country_validators?.some(
                    (entry) => entry.country === countryId
                        && entry.local_unit_types.length > 0,
                )
            );

            const canEditLocalUnit = (
                countryId: number | undefined,
            ) => {
                if (isGuestUser
                    || isNotDefined(countryId)
                    || isNotDefined(userMe?.profile.org_type)) return false;

                return (
                    userMe?.profile.country?.id === countryId
                    && canEditLocalUnitOrganization.includes(userMe?.profile.org_type)
                );
            };

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
                isLocalUnitGlobalValidator,
                isLocalUnitGlobalValidatorByType,
                isLocalUnitCountryValidator,
                isLocalUnitRegionValidator,
                isLocalUnitCountryValidatorByType,
                isLocalUnitRegionValidatorByType,
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
                canEditLocalUnit,
            };
        },
        [userMe],
    );

    return perms;
}

export default usePermissions;
