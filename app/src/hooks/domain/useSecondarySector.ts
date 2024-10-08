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

function useSecondarySector(props?: ListProps): Array<SecondarySector> | undefined
function useSecondarySector(props: PropsForId): SecondarySector | undefined
function useSecondarySector(
    props?: ListProps | PropsForId,
): SecondarySector | undefined | Array<SecondarySector> | undefined {
    const {
        register,
        secondarySectors,
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

    return returnValue;
}

export default useSecondarySector;
