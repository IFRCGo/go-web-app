import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Spinner from '#components/Spinner';

import styles from './styles.module.css';

type MessageVariant = 'info' | 'error';

export interface Props {
    className?: string;
    variant?: MessageVariant;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    compact?: boolean;

    pending?: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;

    errored?: boolean;
    erroredTitle?: React.ReactNode;
    erroredDescription?: React.ReactNode;
}

function Message(props: Props) {
    const {
        className,
        pending = false,
        variant,
        icon,
        title,
        description,
        actions,
        compact = false,
        errored,
        erroredTitle,
        erroredDescription,
    } = props;

    const showTitle = errored ? isDefined(erroredTitle) : isDefined(title);
    const showDescription = errored ? isDefined(erroredDescription) : isDefined(description);

    return (
        <div
            className={_cs(
                styles.message,
                variant === 'error' && styles.errored,
                compact && styles.compact,
                className,
            )}
        >
            {(icon || pending) && (
                <div className={styles.icon}>
                    {pending && <Spinner className={styles.spinner} />}
                    {!pending && icon}
                </div>
            )}
            {showTitle && (
                <div className={styles.title}>
                    {errored ? erroredTitle : title}
                </div>
            )}
            {showDescription && (
                <div className={styles.description}>
                    {description}
                </div>
            )}
            {actions && (
                <div className={styles.actions}>
                    {actions}
                </div>
            )}
        </div>
    );
}

export default Message;
