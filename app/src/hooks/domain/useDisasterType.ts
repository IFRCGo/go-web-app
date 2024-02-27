import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { isTruthyString } from '@togglecorp/fujs';

import DomainContext, { DisasterTypes } from '#contexts/domain';

export type PartialDisasterType = NonNullable<DisasterTypes['results']>[number];

export type DisasterType = Omit<
    PartialDisasterType,
    'name'
> & {
    name: string,
};

export function isValidDisasterType(type: PartialDisasterType): type is DisasterType {
    return isTruthyString(type.name);
}

function useDisasterTypes() {
    const { disasterTypes, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('disaster-type');
        },
        [register],
    );

    const value = useMemo(
        () => disasterTypes?.results?.filter(isValidDisasterType),
        [disasterTypes],
    );

    return value;
}

export default useDisasterTypes;
