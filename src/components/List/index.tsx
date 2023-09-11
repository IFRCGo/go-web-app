import { useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import Message from '#components/Message';
import RawList, { type Props as RawListProps, type ListKey } from '#components/RawList';

import styles from './styles.module.css';

export interface Props<
    DATUM,
    KEY extends ListKey,
    RENDERER_PROPS
> extends RawListProps<DATUM, KEY, RENDERER_PROPS> {
    className?: string;

    pending: boolean;
    errored: boolean;
    filtered: boolean;

    emptyMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    filteredMessage?: React.ReactNode;

    compact?: boolean;
    withoutMessage?: boolean;
}

function List<DATUM, KEY extends ListKey, RENDERER_PROPS>(
    props: Props<DATUM, KEY, RENDERER_PROPS>,
) {
    const {
        className,
        data,
        keySelector,
        renderer,
        rendererParams,

        pending,
        errored,
        filtered,

        // FIXME: use translations
        errorMessage = 'Failed to fetch data!',
        emptyMessage = 'Data is not available!',
        pendingMessage = 'Fetching data...',
        filteredMessage = 'Data is not available for the selected filter!',

        compact,
        withoutMessage = false,
    } = props;

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
            <RawList
                data={data}
                keySelector={keySelector}
                renderer={renderer}
                rendererParams={rendererParams}
            />
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
