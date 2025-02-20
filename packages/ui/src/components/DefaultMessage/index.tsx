import { useMemo } from 'react';
import { AnalysisIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    compact?: boolean;
    pending: boolean;
    overlayPending?: boolean;
    filtered: boolean;
    empty: boolean;
    errored: boolean;

    emptyMessage?: React.ReactNode;
    filteredEmptyMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
}

function DefaultMessage(props: Props) {
    const {
        className,
        compact,
        pending,
        overlayPending,
        filtered,
        empty,
        errored,

        emptyMessage,
        filteredEmptyMessage,
        pendingMessage,
        errorMessage,
    } = props;

    const strings = useTranslation(i18n);

    const messageTitle = useMemo(
        () => {
            if (pending) {
                return pendingMessage ?? strings.messageTitleFetching;
            }

            if (errored) {
                return errorMessage ?? strings.messageTitleDataFailedToFetch;
            }

            if (filtered) {
                return filteredEmptyMessage ?? strings.messageTitleFilteredDataNotAvailable;
            }

            if (empty) {
                return emptyMessage ?? strings.messageTitleDataNotAvailable;
            }

            return null;
        },
        [
            empty,
            pending,
            filtered,
            errored,
            emptyMessage,
            filteredEmptyMessage,
            pendingMessage,
            errorMessage,
            strings,
        ],
    );

    if (!empty && !pending && !errored) {
        return null;
    }

    return (
        <Message
            className={_cs(
                styles.defaultMessage,
                pending && overlayPending && styles.overlay,
                className,
            )}
            icon={<AnalysisIcon />}
            compact={compact}
            title={messageTitle}
            pending={pending}
        />
    );
}

export default DefaultMessage;
