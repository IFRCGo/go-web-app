import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import DefaultMessage from '#components/DefaultMessage';
import RawList, {
    type ListKey,
    type Props as RawListProps,
} from '#components/RawList';
import { type SpacingType } from '#components/types';
import useSpacingTokens from '#hooks/useSpacingTokens';

import styles from './styles.module.css';

type NumColumn = 2 | 3 | 4 | 5;

export interface Props<
    DATUM,
    KEY extends ListKey,
    RENDERER_PROPS
> extends RawListProps<DATUM, KEY, RENDERER_PROPS> {
    className?: string;
    numPreferredColumns: NumColumn;
    spacing?: SpacingType;

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

function Grid<DATUM, KEY extends ListKey, RENDERER_PROPS>(
    props: Props<DATUM, KEY, RENDERER_PROPS>,
) {
    const {
        className,
        data,
        keySelector,
        renderer,
        rendererParams,
        numPreferredColumns,
        spacing = 'default',

        pending,
        errored,
        filtered,

        errorMessage,
        emptyMessage,
        pendingMessage,
        filteredEmptyMessage,

        compact,
        withoutMessage,
    } = props;

    const isEmpty = isNotDefined(data) || data.length === 0;

    const gapSpacing = useSpacingTokens({ spacing });

    return (
        <div
            className={_cs(
                styles.grid,
                numPreferredColumns === 2 && styles.twoColumns,
                numPreferredColumns === 3 && styles.threeColumns,
                numPreferredColumns === 4 && styles.fourColumns,
                numPreferredColumns === 5 && styles.fiveColumns,
                gapSpacing,
                pending && styles.pending,
                compact && styles.compact,
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
                    className={styles.message}
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

export default Grid;
