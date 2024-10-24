import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import DomainContext, { PerComponents } from '#contexts/domain';

export type PerComponent = NonNullable<PerComponents['results']>[number];

type ListProps = {
    id?: never;
}

type PropsForId = {
    id: number;
}

function usePerComponent(props?: ListProps): Array<PerComponent> | undefined
function usePerComponent(props: PropsForId): PerComponent | undefined
function usePerComponent(
    props?: ListProps | PropsForId,
): PerComponent | undefined | Array<PerComponent> | undefined {
    const {
        register,
        perComponents,
    } = useContext(DomainContext);

    useEffect(
        () => {
            register('per-components');
        },
        [register],
    );

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return perComponents
                    ?.results?.find((perComponent) => perComponent.id === id);
            }

            // NOTE: we need to filter out parent components
            return perComponents?.results?.filter(
                (perComponent) => !perComponent.is_parent,
            );
        },
        [perComponents, props?.id],
    );

    return returnValue;
}

export default usePerComponent;
