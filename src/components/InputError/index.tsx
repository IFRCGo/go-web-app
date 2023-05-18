import { _cs } from '@togglecorp/fujs';
import { AlertLineIcon } from '@ifrc-go/icons';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    style?: React.CSSProperties;
}

function InputError(props: Props) {
    const {
        children,
        className,
        disabled,
        style,
    } = props;

    if (!children) {
        return null;
    }

    return (
        <div
            style={style}
            className={_cs(
                styles.inputError,
                disabled && styles.disabled,
                className,
            )}
        >
            <div className={styles.tip} />
            <div className={styles.content}>
                <AlertLineIcon className={styles.icon} />
                {children}
            </div >
        </div >
    );
}

export default InputError;
