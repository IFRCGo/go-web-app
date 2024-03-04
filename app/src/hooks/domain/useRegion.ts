import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import DomainContext, { type Regions } from '#contexts/domain';

export type Region = NonNullable<Regions['results']>[number];

type PropsForId = {
    id?: number | null | undefined;
}

type ListProps = {
    id: never;
}

function useRegion(props?: ListProps): Array<Region> | undefined
function useRegion(props: PropsForId): Region | undefined
function useRegion(props?: PropsForId): (Region | undefined | Array<Region>) {
    const { regions, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('region');
        },
        [register],
    );

    const regionMode = isDefined(props) && Object.keys(props).includes('id');

    const value = useMemo(
        () => {
            if (regionMode) {
                const id = props?.id;
                if (isDefined(id)) {
                    return regions?.results?.find((region) => region.id === id);
                }
                return undefined;
            }

            return regions?.results;
        },
        [regions?.results, props?.id, regionMode],
    );

    return value;
}

export default useRegion;
