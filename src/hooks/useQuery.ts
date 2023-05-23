import { useState, useEffect, useMemo } from 'react';
import { rankedSearchOnList } from '#utils/common';

// NOTE: this is just a helper function
interface Entity {
    id: string;
    name: string;
}
function labelSelector(item: Entity) {
    return item.name;
}

type EntityVariable = string | undefined;
export function entityListTransformer<T extends Entity>(
    variable: EntityVariable | undefined,
    values: T[],
) {
    const result = rankedSearchOnList(
        values,
        variable,
        labelSelector,
    );

    const totalCount = result.length;
    const truncatedResult = result.slice(0, 10);
    const count = truncatedResult.length;

    return { results: truncatedResult, count, totalCount };
}

function useQuery<T, V>(
    values: T,
    variable: V,
    transformer: (variable: V, values: T) => { results: T, totalCount: number, count: number },
    skip: boolean,
) {
    const [pending, setPending] = useState(!skip);

    useEffect(
        () => {
            if (skip) {
                setPending(false);
                return undefined;
            }
            // eslint-disable-next-line no-console
            console.debug('Querying...', variable);
            setPending(true);
            const timer = setTimeout(
                () => {
                    setPending(false);
                },
                1200 + Math.floor(400 * Math.random()),
            );
            return () => {
                clearTimeout(timer);
            };
        },
        [variable, skip],
    );

    const { results, totalCount, count } = useMemo(
        () => transformer(variable, values),
        [values, variable, transformer],
    );

    return [
        pending,
        pending || skip ? undefined : results,
        pending || skip ? undefined : count,
        pending || skip ? undefined : totalCount,
    ] as const;
}

export default useQuery;
