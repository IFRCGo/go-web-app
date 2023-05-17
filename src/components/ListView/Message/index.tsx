import React from 'react';
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
  erroredMessage?: React.ReactNode;
}

function Message(props: Props) {
    const {
        className,
        empty,
        pending,
        errored,
        message: messageFromProps,
        emptyMessage = 'Data is not available',
        erroredMessage = 'Oops! We ran into an issue',
    } = props;

    let message: React.ReactNode = messageFromProps;

    if (pending) {
        return (
            <BlockLoading />
        );
    }

    if (empty) {
        message = emptyMessage;
    }

    if (errored) {
        message = erroredMessage;
    }

    if (!message) {
        return null;
    }

    return (
        <div className={_cs(styles.message, className)}>
            {message}
        </div>
    );
}

export default Message;
