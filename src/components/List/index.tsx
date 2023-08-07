import { useCallback } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import Message from '#components/Message';

import styles from './styles.module.css';

export type ListKey = string | number | boolean;

export type Props<DATUM, KEY extends ListKey, RENDERER_PROPS> = {
    className?: string;
    data: DATUM[] | undefined;
    keySelector(datum: DATUM, index: number): KEY;
    renderer: React.ComponentType<RENDERER_PROPS>;
    rendererParams(key: KEY, datum: DATUM, index: number, data: DATUM[]): RENDERER_PROPS;

    pending: boolean;
    errored: boolean;
    filtered: boolean;

    compact?: boolean;
    message?: React.ReactNode;
    emptyMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    filteredMessage?: React.ReactNode;
    withMessageOverContent?: boolean;
};

function List<DATUM, KEY extends ListKey, RENDERER_PROPS>(
    props: Props<DATUM, KEY, RENDERER_PROPS>,
) {
    const {
        className,
        data,
        keySelector,
        renderer: Renderer,
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

    const renderListItem = useCallback((datum: DATUM, i: number) => {
        if (isNotDefined(data)) {
            return null;
        }

        const key = keySelector(datum, i);
        const extraProps = rendererParams(key, datum, i, data);

        return (
            <Renderer
                key={String(key)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...extraProps}
            />
        );
    }, [keySelector, Renderer, rendererParams, data]);

    return (
        <div className={_cs(styles.list, className)}>
            {(withMessageOverContent || !pending) && (
                data?.map(renderListItem)
            )}
            <Message
                className={_cs(
                    styles.message,
                    withMessageOverContent && styles.withMessageOverContent,
                )}
                compact={compact}
                empty={isNotDefined(data) || data.length === 0}
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
        </div>
    );
}

export default List;
