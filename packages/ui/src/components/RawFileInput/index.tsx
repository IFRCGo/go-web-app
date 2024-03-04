import {
    useCallback,
    useState,
} from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import type { ButtonFeatureProps } from '#components/Button';
import { useButtonFeatures } from '#components/Button';

import styles from './styles.module.css';

export type RawFileInputProps<NAME> = ButtonFeatureProps & {
    accept?: string;
    disabled?: boolean;
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
    inputRef?: React.RefObject<HTMLInputElement>;
    name: NAME;
    readOnly?: boolean;
} & ({
    multiple: true;
    onChange: (files: File[] | undefined, name: NAME) => void;
} | {
    multiple?: false;
    onChange: (files: File | undefined, name: NAME) => void;
});

function RawFileInput<NAME>(props: RawFileInputProps<NAME>) {
    const {
        accept,
        disabled,
        inputProps,
        inputRef,
        multiple,
        name,
        onChange,
        readOnly,
        ...buttonFeatureProps
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

    const {
        children,
        className,
    } = useButtonFeatures({
        ...buttonFeatureProps,
        disabled,
    });

    return (
        <label
            htmlFor={inputId}
            className={_cs(styles.fileInput, className)}
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
