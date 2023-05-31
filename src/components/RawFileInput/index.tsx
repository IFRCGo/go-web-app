import { ReactElement, useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { NameType } from '../types';

export type RawFileInputProps<N extends NameType> = {
    accept?: string;
    capture?: boolean | 'user' | 'environment';
    children: ReactElement;
    disabled?: boolean;
    form?: string;
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
    inputRef: React.RefObject<HTMLInputElement>;
    name: N;
    readOnly?: boolean;
} & ({
    multiple: true;
    onChange: (files: File[] | undefined, name: N) => void;
} | {
    multiple?: false;
    onChange: (files: File | undefined, name: N) => void;
});

function RawFileInput<N extends NameType>(props: RawFileInputProps<N>) {
    const {
        accept,
        capture,
        children,
        disabled,
        form,
        inputProps,
        inputRef,
        multiple,
        name,
        onChange,
        readOnly,
    } = props;

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (multiple) {
            const values = event.currentTarget.files
                ? Array.from(event.currentTarget.files) : undefined;
            onChange(values, name);
        } else {
            onChange(event.currentTarget.files?.[0] ?? undefined, name);
        }
        if (event.target.value) {
            event.target.value = ''; // eslint-disable-line no-param-reassign
        }
    }, [multiple, name, onChange]);

    return (
        <>
            {children}
            <input
                style={{ display: 'none' }}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                name={isDefined(name) ? String(name) : undefined}
                ref={inputRef}
                form={form}
                capture={capture}
                disabled={disabled}
                readOnly={readOnly}
                {...inputProps} // eslint-disable-line react/jsx-props-no-spreading
            />
        </>
    );
}

export default RawFileInput;
