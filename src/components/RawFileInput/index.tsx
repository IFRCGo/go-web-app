import { ReactElement, useCallback } from 'react';
import { NameType } from '#components/types';
import { isDefined } from '@togglecorp/fujs';

export type RawFileInputProps<N extends NameType> = {
    accept?: string;
    name: N;
    form?: string;
    disabled?: boolean;
    readOnly?: boolean;
    capture?: boolean | 'user' | 'environment';
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
    ref: React.RefObject<HTMLInputElement>;
    children: ReactElement;
} & ({
    multiple: true;
    onChange: (files: File[] | undefined, name: N) => void;
} | {
    multiple?: false;
    onChange: (files: File | undefined, name: N) => void;
});

function RawFileInput<N extends NameType>(props: RawFileInputProps<N>) {
    const {
        onChange,
        multiple,
        accept,
        name,
        form,
        disabled,
        readOnly,
        capture,
        inputProps,
        ref,
        children,
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
                ref={ref}
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
