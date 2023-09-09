import { useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import Message from '#components/Message';
import RawList, { type Props as RawListProps, type ListKey } from '#components/RawList';
import type { SpacingType } from '#components/types';

import styles from './styles.module.css';

type NumColumn = 2 | 3 | 4 | 5;
const spacingTypeToClassNameMap: Record<SpacingType, string> = {
    none: styles.noSpacing,
    compact: styles.compactSpacing,
    cozy: styles.cozySpacing,
    comfortable: styles.comfortableSpacing,
    relaxed: styles.relaxedSpacing,
    loose: styles.looseSpacing,
    // FIXME: use proper styling (medium priority)
    default: 'default',
    condensed: 'condensed',
};

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
    filteredMessage?: React.ReactNode;

    compact?: boolean;
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
        spacing = 'comfortable',

        pending,
        errored,
        filtered,

        // FIXME: use translations
        errorMessage = 'Failed to show the data!',
        emptyMessage = 'Data is not available!',
        pendingMessage = 'Fetching data...',
        filteredMessage = 'Data is not available for the selected filter!',

        compact,
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
                styles.grid,
                numPreferredColumns === 2 && styles.twoColumns,
                numPreferredColumns === 3 && styles.threeColumns,
                numPreferredColumns === 4 && styles.fourColumns,
                numPreferredColumns === 5 && styles.fiveColumns,
                spacingTypeToClassNameMap[spacing],
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
            {(pending || isEmpty) && (
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

export default Grid;
