import { _cs } from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    empty?: boolean;
    pending?: boolean;
    errored?: boolean;
    filtered?: boolean;
    message?: React.ReactNode;
    emptyMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    filteredMessage?: React.ReactNode;
    compact?: boolean;
    withoutBorder?: boolean;
}

function Message(props: Props) {
    const {
        className: classNameFromProps,
        empty,
        pending,
        errored,
        filtered,
        message: messageFromProps,
        pendingMessage = 'Fetching data...',
        emptyMessage = 'Data is not available!',
        errorMessage = 'Oops! We ran into an issue!',
        filteredMessage = 'No matching data available!',
        compact,
        withoutBorder,
    } = props;

    let messageContent: React.ReactNode = messageFromProps;

    const className = _cs(
        styles.message,
        errored && styles.errored,
        compact && styles.compact,
        classNameFromProps,
    );

    if (pending) {
        messageContent = (
            <BlockLoading
                className={styles.blockLoading}
                compact={compact}
                message={pendingMessage}
                withoutBorder={withoutBorder}
            />
        );
    } else if (errored) {
        messageContent = errorMessage;
    } else if (empty && filtered) {
        messageContent = filteredMessage;
    } else if (empty && !filtered) {
        messageContent = emptyMessage;
    }

    if (!messageContent) {
        return null;
    }
    return (
        <div className={className}>
            {messageContent}
        </div>
    );
}

export default Message;
