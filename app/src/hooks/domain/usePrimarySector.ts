import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import DomainContext, { type PrimarySectors } from '#contexts/domain';

export type PrimarySector = NonNullable<PrimarySectors>[number];

type ListProps = {
    id?: never;
}

type PropsForId = {
    id: number;
}

function usePrimarySector(props?: ListProps): Array<PrimarySector> | undefined
function usePrimarySector(props: PropsForId): PrimarySector | undefined
function usePrimarySector(
    props?: ListProps | PropsForId,
): PrimarySector | undefined | Array<PrimarySector> | undefined {
    const {
        register,
        primarySectors,
    } = useContext(DomainContext);

    useEffect(
        () => {
            register('primary-sector');
        },
        [register],
    );

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return primarySectors?.find((primaryTag) => primaryTag.key === id);
            }

            return primarySectors;
        },
        [primarySectors, props?.id],
    );

    return returnValue;
}

export default usePrimarySector;
