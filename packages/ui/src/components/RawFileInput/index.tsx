import {
    useCallback,
    useState,
} from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface CommonRawFileInputProps<NAME> {
    accept?: string;
    /**
     * Visible trigger content; the whole component acts as a label
     * for the hidden file input, so clicking any child opens the
     * file picker
     */
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    /** Props forwarded to the hidden file input element */
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
    /** Ref to the hidden file input element */
    inputRef?: React.RefObject<HTMLInputElement | null>;
    name: NAME;
    readOnly?: boolean;
}

export interface MultipleRawFileInputProps<NAME> {
    multiple: true;
    onChange: (files: File[] | undefined, name: NAME) => void;
}

export interface SingleRawFileInputProps<NAME> {
    multiple?: never;
    onChange: (files: File | undefined, name: NAME) => void;
}

export type Props<NAME> = CommonRawFileInputProps<NAME> & (
    SingleRawFileInputProps<NAME> | MultipleRawFileInputProps<NAME>
);

/**
 * Unstyled file input primitive (raw layer).
 *
 * Renders only the hidden file input and its change/reset plumbing,
 * wrapped in a `display: contents` label so the children act as the
 * trigger. Carries no visuals; use FileInputButton for the styled,
 * button-like file input.
 */
function RawFileInput<NAME>(props: Props<NAME>) {
    const {
        accept,
        children,
        className,
        disabled,
        inputProps,
        inputRef,
        multiple,
        name,
        onChange,
        readOnly,
    } = props;

    const [inputId] = useState(randomString);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (multiple) {
            const values = event.currentTarget.files
                ? Array.from(event.currentTarget.files) : undefined;
            onChange(values, name);
        } else {
            onChange(event.currentTarget.files?.[0] ?? undefined, name);
        }

        if (event.currentTarget.value) {
            event.currentTarget.value = ''; // eslint-disable-line no-param-reassign
        }
    }, [multiple, name, onChange]);

    return (
        <label
            htmlFor={inputId}
            className={_cs(styles.rawFileInput, className)}
        >
            {children}
            <input
                id={inputId}
                className={styles.input}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                name={typeof name === 'string' ? name : undefined}
                ref={inputRef}
                disabled={disabled}
                readOnly={readOnly}
                {...inputProps} // eslint-disable-line react/jsx-props-no-spreading
            />
        </label>
    );
}

export default RawFileInput;
