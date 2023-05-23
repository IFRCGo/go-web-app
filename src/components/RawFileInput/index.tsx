import { useRef, useCallback } from 'react';
import { NameType } from '#components/types';

export type RawFileInputProps<N extends NameType> = {
    children(props: { onClick(): void }): React.ReactNode;
    accept?: string;
    name: N;
    form?: string;
    disabled?: boolean;
    readOnly?: boolean;
    capture?: boolean | 'user' | 'environment';
    inputProps?: React.ComponentPropsWithoutRef<'input'>;
} & ({
    multiple: true;
    onChange: (files: File[] | null, name: N) => void;
} | {
    multiple?: false;
    onChange: (files: File | null, name: N) => void;
});

function RawFileInput<N extends NameType>(props: RawFileInputProps<N>) {
    const {
        onChange,
        children,
        multiple,
        accept,
        name,
        form,
        disabled,
        readOnly,
        capture,
        inputProps,
        ...others
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    const onClick = useCallback(() => {
        if (!disabled && typeof inputRef?.current?.click === 'function') {
            inputRef.current.click();
        }
    }, [disabled]);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (multiple) {
            const values = event.currentTarget.files ? Array.from(event.currentTarget.files) : null;
            onChange(values, name);
        } else {
            onChange(event.currentTarget.files?.[0] || null, name);
        }
        if (event.target.value) {
            event.target.value = ''; // eslint-disable-line no-param-reassign
        }
    }, [multiple, name, onChange]);

    return (
        <>
            {children({ onClick, ...others })}
            <input
                style={{ display: 'none' }}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                ref={inputRef}
                name={name}
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
