import { _cs } from '@togglecorp/fujs';

import Spinner from '#components/Spinner';

import styles from './styles.module.css';

type MessageVariant = 'info' | 'error';

export interface Props {
    className?: string;
    pending?: boolean;
    variant?: MessageVariant;
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
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
    } = props;

    return (
        <div
            className={_cs(
                styles.message,
                variant === 'error' && styles.errored,
                className,
            )}
        >
            {(icon || pending) && (
                <div className={styles.icon}>
                    {pending && <Spinner className={styles.spinner} />}
                    {!pending && icon}
                </div>
            )}
            {title && (
                <div className={styles.title}>
                    {title}
                </div>
            )}
            {description && (
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
