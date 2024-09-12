import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import DomainContext, { type SecondarySectors } from '#contexts/domain';

export type SecondarySector = NonNullable<SecondarySectors>[number];

type ListProps = {
    id?: never;
}

type PropsForId = {
    id: number;
}

function useSecondarySector(props?: ListProps): [Array<SecondarySector> | undefined, boolean]
function useSecondarySector(props: PropsForId): [SecondarySector | undefined, boolean]
function useSecondarySector(
    props?: ListProps | PropsForId,
): [SecondarySector | undefined | Array<SecondarySector> | undefined, boolean | undefined ] {
    const {
        register,
        secondarySectors,
        secondarySectorsPending,
    } = useContext(DomainContext);

    useEffect(
        () => {
            register('secondary-sector');
        },
        [register],
    );

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return secondarySectors?.find((secondaryTag) => secondaryTag.key === id);
            }

            return secondarySectors;
        },
        [secondarySectors, props?.id],
    );

    return [returnValue, secondarySectorsPending];
}

export default useSecondarySector;
