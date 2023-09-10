import {
    useMemo,
    useContext,
    useEffect,
} from 'react';

import DomainContext, { type Regions } from '#contexts/domain';

export type Region = NonNullable<Regions['results']>[number];

function useRegion() {
    const { regions, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('region');
        },
        [register],
    );

    const value = useMemo(
        () => regions?.results,
        [regions?.results],
    );

    return value;
}

export default useRegion;
