import { useParams } from 'react-router-dom';

import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';

import PrivateCountryPreparedness from './PrivateCountryPreparedness';
import PublicCountryPreparedness from './PublicCountryPreparedness';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ perId: string, countryId: string }>();
    const {
        isCountryPerAdmin,
        isSuperUser,
        isRegionPerAdmin,
    } = usePermissions();

    const countryDetails = useCountry({ id: Number(countryId) });

    const hasPermission = isSuperUser
        || isCountryPerAdmin(Number(countryId))
        || isRegionPerAdmin(Number(countryDetails?.region));

    if (hasPermission) {
        return (
            <PrivateCountryPreparedness />
        );
    }

    return (
        <PublicCountryPreparedness />
    );
}

Component.displayName = 'CountryPreparedness';
