import { useCallback, useMemo } from 'react';
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
    // FIXME: Is this used?
    withMessageOverContent?: boolean;
    withoutMessage?: boolean;
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

        // FIXME: use translations
        errorMessage = 'Failed to show the data!',
        emptyMessage = 'Data is not available!',
        pendingMessage = 'Fetching data...',
        filteredMessage = 'Data is not available for the selected filter!',

        compact,

        withoutMessage = false,
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

    const isEmpty = isNotDefined(data) || data.length === 0;

    const messageTitle = useMemo(
        () => {
            // FIXME: use translation
            if (pending) {
                return pendingMessage;
            }

            if (errored) {
                return errorMessage;
            }

            if (filtered) {
                return filteredMessage;
            }

            return emptyMessage;
        },
        [pending, filtered, errored, errorMessage, pendingMessage, filteredMessage, emptyMessage],
    );

    return (
        <div
            className={_cs(
                styles.list,
                compact && styles.compact,
                pending && styles.pending,
                className,
            )}
        >
            {data?.map(renderListItem)}
            {(pending || isEmpty) && !withoutMessage && (
                <Message
                    className={styles.message}
                    pending={pending}
                    title={messageTitle}
                    compact={compact}
                />
            )}
        </div>
    );
}

export default List;
