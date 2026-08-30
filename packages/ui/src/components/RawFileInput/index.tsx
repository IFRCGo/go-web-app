import {
    useCallback,
    useState,
} from 'react';
import { randomString } from '@togglecorp/fujs';

import type { Props as ButtonLayoutProps } from '#components/ButtonLayout';
import ButtonLayout from '#components/ButtonLayout';

import styles from './styles.module.css';

export type CommonRawFileInputProps<NAME> = Omit<ButtonLayoutProps, 'elementRef' | 'onChange'> & {
    accept?: string;
    disabled?: boolean;
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    name: NAME;
    readOnly?: boolean;
};

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

function RawFileInput<NAME>(props: Props<NAME>) {
    const {
        accept,
        disabled,
        inputProps,
        inputRef,
        multiple,
        name,
        onChange,
        readOnly,
        spacingOffset = -3,
        ...buttonLayoutProps
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
            className={styles.fileInput}
        >
            <ButtonLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...buttonLayoutProps}
                spacingOffset={spacingOffset}
                disabled={disabled}
                readOnly={readOnly}
            />
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
