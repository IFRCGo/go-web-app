import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import DefaultMessage from '#components/DefaultMessage';
import RawList, {
    type ListKey,
    type Props as RawListProps,
} from '#components/RawList';

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
    filteredEmptyMessage?: React.ReactNode;

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

        errorMessage,
        emptyMessage,
        pendingMessage,
        filteredEmptyMessage,

        compact,
        withoutMessage = false,
        messageClassName,
    } = props;

    const isEmpty = isNotDefined(data) || data.length === 0;

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
            {!withoutMessage && (
                <DefaultMessage
                    className={messageClassName}
                    pending={pending}
                    filtered={filtered}
                    empty={isEmpty}
                    errored={errored}
                    compact={compact}
                    emptyMessage={emptyMessage}
                    filteredEmptyMessage={filteredEmptyMessage}
                    pendingMessage={pendingMessage}
                    errorMessage={errorMessage}
                    overlayPending
                />
            )}
        </div>
    );
}

export default List;
