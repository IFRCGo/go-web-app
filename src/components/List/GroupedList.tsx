import {
    useCallback,
    useMemo,
} from 'react';
import { listToGroupList } from '@togglecorp/fujs';

import {
    BaseProps,
    OptionKey,
    GroupCommonProps,
    GroupOptions,
    emptyList,
} from './common';

// eslint-disable-next-line max-len
export type Props<D, P, K extends OptionKey, GP, GK extends OptionKey> = (
BaseProps<D, P, K> & GroupOptions<D, GP, GK>
);

function GroupedList<D, P, K extends OptionKey, GP extends GroupCommonProps, GK extends OptionKey>(
    props: Props<D, P, K, GP, GK>,
) {
    const {
        groupKeySelector,
        groupComparator,
        renderer: Renderer,
        groupRenderer: GroupRenderer,
        groupRendererClassName,
        groupRendererParams,
        data: dataFromProps,
        keySelector,
        rendererParams,
        rendererClassName,
    } = props;

    const data = dataFromProps ?? (emptyList as D[]);

    const renderListItem = useCallback((datum: D, i: number) => {
        const key = keySelector(datum, i);
        const extraProps = rendererParams(key, datum, i, data);

        return (
            <Renderer
                key={String(key)}
                className={rendererClassName}
                {...extraProps} /* eslint-disable-line react/jsx-props-no-spreading */
            />
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Renderer, data, keySelector, rendererClassName, rendererParams]);

    const renderGroup = (
        groupKey: GK,
        index: number,
        groupData: D[],
        children: React.ReactNode,
    ) => {
        const extraProps = groupRendererParams(groupKey, index, groupData);

        const finalProps = {
            ...extraProps,
            className: groupRendererClassName,
            children,
        };

        return (
            <GroupRenderer
                key={String(groupKey)}
                {...finalProps as GP} /* eslint-disable-line react/jsx-props-no-spreading */
            />
        );
    };

    const typeSafeGroupKeySelector: (d: D) => string | number = useCallback((d) => {
        const key = groupKeySelector(d);

        if (typeof key === 'number') {
            return key;
        }

        return String(key);
    }, [groupKeySelector]);

    const groups = useMemo(
        () => listToGroupList(data, typeSafeGroupKeySelector),
        [data, typeSafeGroupKeySelector],
    );

    const sortedGroupKeys = useMemo(
        () => {
            const keys = Object.keys(groups) as GK[];
            return keys.sort(groupComparator);
        },
        [groups, groupComparator],
    );

    return (
        <>
            {sortedGroupKeys.map((groupKey, i) => (
                renderGroup(
                    groupKey,
                    i,
                    groups[String(groupKey)],
                    groups[String(groupKey)].map(renderListItem),
                )
            ))}
        </>
    );
}

export default GroupedList;
