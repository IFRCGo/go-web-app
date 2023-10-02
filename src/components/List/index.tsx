import { useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import Message from '#components/Message';
import RawList, { type Props as RawListProps, type ListKey } from '#components/RawList';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props<
    DATUM,
    KEY extends ListKey,
    RENDERER_PROPS
> extends RawListProps<DATUM, KEY, RENDERER_PROPS> {
    className?: string;
    messageClassName?: string;

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
        messageClassName,
        data,
        keySelector,
        renderer,
        rendererParams,

        pending,
        errored,
        filtered,

        errorMessage: errorMessageFromProps,
        emptyMessage: emptyMessageFromProps,
        pendingMessage: pendingMessageFromProps,
        filteredMessage: filteredMessageFromProps,

        compact,
        withoutMessage = false,
    } = props;

    const strings = useTranslation(i18n);

    const filteredMessage = filteredMessageFromProps ?? strings.listFilteredMessage;
    const pendingMessage = pendingMessageFromProps ?? strings.listPendingMessage;
    const emptyMessage = emptyMessageFromProps ?? strings.listEmptyMessage;
    const errorMessage = errorMessageFromProps ?? strings.listFailedToFetch;

    const isEmpty = isNotDefined(data) || data.length === 0;
    const messageTitle = useMemo(
        () => {
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
                    className={_cs(styles.message, messageClassName)}
                    pending={pending}
                    title={messageTitle}
                    compact={compact}
                />
            )}
        </div>
    );
}

export default List;
