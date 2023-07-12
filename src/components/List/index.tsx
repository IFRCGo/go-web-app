import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import Message from '#components/Message';

import GroupedList from './GroupedList';
import {
    OptionKey,
    NoGroupOptions,
    GroupOptions,
    BaseProps,
    GroupCommonProps,
    emptyList,
} from './common';

import styles from './styles.module.css';

// eslint-disable-next-line max-len
export type Props<D, P, K extends OptionKey, GP, GK extends OptionKey> = (
    BaseProps<D, P, K> & (GroupOptions<D, GP, GK> | NoGroupOptions)
);

function hasGroup<D, P, K extends OptionKey, GP, GK extends OptionKey>(
    props: Props<D, P, K, GP, GK>,
): props is (BaseProps<D, P, K> & GroupOptions<D, GP, GK>) {
    return !!(props as BaseProps<D, P, K> & GroupOptions<D, GP, GK>).grouped;
}

function List<D, P, K extends OptionKey, GP extends GroupCommonProps, GK extends OptionKey>(
    props: Props<D, P, K, GP, GK>,
) {
    const {
        data: dataFromProps,
        keySelector,
        renderer: Renderer,
        rendererClassName,
        rendererParams,

        pending,
        errored,
        filtered,

        message: messageFromProps,
        withMessageOverContent,
        errorMessage,
        emptyMessage,
        pendingMessage,
        filteredMessage,
        compact,
    } = props;

    const data = dataFromProps ?? (emptyList as D[]);
    const empty = !(data?.length && data.length > 0);

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
    }, [keySelector, Renderer, rendererClassName, rendererParams, data]);

    const message = (
        <Message
            className={_cs(styles.message, withMessageOverContent && styles.withMessageOverContent)}
            empty={empty}
            pending={pending}
            errored={errored}
            filtered={filtered}
            message={messageFromProps}
            pendingMessage={pendingMessage}
            emptyMessage={emptyMessage}
            errorMessage={errorMessage}
            filteredMessage={filteredMessage}
            compact={compact}
        />
    );

    if (!hasGroup(props)) {
        return (
            <>
                {data.map(renderListItem)}
                {message}
            </>
        );
    }

    return (
        <>
            <GroupedList
                {...props} /* eslint-disable-line react/jsx-props-no-spreading */
            />
            {message}
        </>
    );
}

export default List;
