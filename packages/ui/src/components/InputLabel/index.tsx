import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    // FIXME: change prop name to withAsterisk
    required?: boolean;
    /** Id of the control this labels; renders a real `<label htmlFor>` */
    htmlFor?: string;
}

/**
 * Form-field label (generic layer). Renders a real `<label htmlFor>` so
 * the label is programmatically associated with its control; the
 * required asterisk is `aria-hidden` (requiredness is conveyed via
 * `aria-required` on the control).
 */
function InputLabel(props: Props) {
    const {
        children,
        className,
        disabled,
        required,
        htmlFor,
    } = props;

    if (!children) {
        return null;
    }

    return (
        <label
            htmlFor={htmlFor}
            className={_cs(
                styles.inputLabel,
                disabled && styles.disabled,
                className,
            )}
        >
            {children}
            {required && (
                <span aria-hidden className={styles.required}>
                    *
                </span>
            )}
        </label>
    );
}

export default InputLabel;
