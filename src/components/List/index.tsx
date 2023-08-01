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

function List<
    DATUM,
    RENDERER_PROPS,
    KEY extends OptionKey,
    GroupProps extends GroupCommonProps,
    GroupKey extends OptionKey
>(
    props: Props<DATUM, RENDERER_PROPS, KEY, GroupProps, GroupKey>,
) {
    const {
        className,
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

    const data = dataFromProps ?? (emptyList as DATUM[]);
    const empty = !(data?.length && data.length > 0);

    const renderListItem = useCallback((datum: DATUM, i: number) => {
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
            compact={compact}
            empty={empty}
            emptyMessage={emptyMessage}
            errorMessage={errorMessage}
            errored={errored}
            filtered={filtered}
            filteredMessage={filteredMessage}
            message={messageFromProps}
            pending={pending}
            pendingMessage={pendingMessage}
            withoutBorder={withMessageOverContent}
        />
    );

    let content: React.ReactNode = null;

    if (!hasGroup(props)) {
        content = (
            <>
                {(withMessageOverContent || !pending) && (
                    data.map(renderListItem)
                )}
                {message}
            </>
        );
    } else {
        content = (
            <>
                <GroupedList
                    {...props} /* eslint-disable-line react/jsx-props-no-spreading */
                />
                {message}
            </>
        );
    }

    return (
        <div className={_cs(styles.list, className)}>
            {content}
        </div>
    );
}

export default List;
