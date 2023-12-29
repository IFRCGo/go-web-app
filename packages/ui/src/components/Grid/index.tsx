import { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Message from '#components/Message';
import RawList, {
    type ListKey,
    type Props as RawListProps,
} from '#components/RawList';
import { type SpacingType } from '#components/types';
import useSpacingTokens from '#hooks/useSpacingTokens';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
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
        spacing = 'default',

        pending,
        errored,
        filtered,

        errorMessage: errorMessageFromProps,
        emptyMessage: emptyMessageFromProps,
        pendingMessage: pendingMessageFromProps,
        filteredMessage: filteredMessageFromProps,

        compact,
    } = props;

    const strings = useTranslation(i18n);

    const filteredMessage = filteredMessageFromProps ?? strings.gridFilteredMessage;
    const pendingMessage = pendingMessageFromProps ?? strings.gridPendingMessage;
    const emptyMessage = emptyMessageFromProps ?? strings.gridEmptyMessage;
    const errorMessage = errorMessageFromProps ?? strings.gridFailedToFetch;

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
