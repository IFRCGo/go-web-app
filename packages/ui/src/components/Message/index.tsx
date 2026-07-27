import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Spinner from '#components/Spinner';

import styles from './styles.module.css';

type MessageVariant = 'info' | 'error';

export interface Props {
    className?: string;
    /** Semantic tone of the message; 'error' highlights the title */
    variant?: MessageVariant;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    /** Use reduced sizing and spacing for constrained contexts */
    compact?: boolean;

    /** Show a spinner in place of the icon */
    pending?: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;

    /** Show the errored title/description instead of the default ones */
    errored?: boolean;
    erroredTitle?: React.ReactNode;
    erroredDescription?: React.ReactNode;
}

/**
 * Message displays status feedback content (pending, empty or errored
 * states) with an optional icon, title, description and actions.
 * Generic layer: consumed by DefaultMessage, Container, etc.
 */
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
            // NOTE: status feedback (pending/empty/errored) -> polite live region
            role="status"
            aria-busy={pending}
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
                    {errored ? erroredDescription : description}
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
