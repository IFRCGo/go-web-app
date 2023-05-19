import { _cs } from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    empty?: boolean;
    pending?: boolean;
    errored?: boolean;
    message?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    emptyMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
}

function Message(props: Props) {
    const {
        className: classNameFromProps,
        empty,
        pending,
        errored,
        message: messageFromProps,
        emptyMessage = 'Data is not available!',
        errorMessage = 'Oops! We ran into an issue!',
    } = props;

    let message: React.ReactNode = messageFromProps;
    const className = _cs(
        styles.message,
        errored && styles.errored,
        classNameFromProps,
    )

    if (pending) {
        return (
            <BlockLoading />
        );
    }

    if (empty) {
        message = emptyMessage;
    }

    if (errored) {
        message = errorMessage;
    }

    if (!message) {
        return null;
    }

    return (
        <div className={className}>
            {message}
        </div>
    );
}

export default Message;
