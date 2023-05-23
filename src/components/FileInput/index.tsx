import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import { NameType } from '#components/types';

import { CloseLineIcon } from '@ifrc-go/icons';
import IconButton from '#components/IconButton';
import RawFileInput, { RawFileInputProps } from '../RawFileInput';
import styles from './styles.module.css';

type InheritedProps<N extends NameType> = Omit<InputContainerProps, 'input'> & Omit<RawFileInputProps<N>, 'multiple' | 'onChange' | 'children'>;

export type FileInputProps<N extends NameType> = InheritedProps<N> & {
    valueComponent?: React.FC<{ value: File[] | File | null }>;
    clearable?: boolean;
    clearButtonProps?: React.ComponentPropsWithoutRef<'button'>;
    inputClassName?: string;
    fileInputProps?: React.ComponentPropsWithoutRef<'input'>;
    placeholder?: React.ReactNode;
} & ({
    multiple: true;
    value: File[] | null;
    onChange: (files: File[] | null, name: N) => void;
} | {
    multiple?: false;
    value: File | null;
    onChange: (files: File | null, name: N) => void;
    });

interface DefaultValueProps {
    value: File[] | File | null
}

function DefaultValue(props: DefaultValueProps) {
    const { value } = props;
    return (
        <div>
            {Array.isArray(value) ? value?.map((file) => file.name).join(', ') : value?.name}
        </div>
    );
}

function FileInput<N extends NameType>(props: FileInputProps<N>) {
    const {
        actions: actionsFromProps,
        className,
        disabled,
        error,
        errorOnTooltip,
        hint,
        icons,
        inputClassName,
        inputSectionClassName,
        label,
        readOnly,
        required,
        variant,
        withAsterisk,
        onChange,
        multiple,
        accept,
        name,
        form,
        capture,
        inputProps,
        fileInputProps,
        value,
        valueComponent,
        placeholder,
        clearable,
        clearButtonProps,
        ...others
    } = props;

    const ValueComponent = valueComponent ?? DefaultValue;
    const hasValue = Array.isArray(value) ? value.length !== 0 : value !== null;

    const handleClear = useCallback(() => {
        onChange(null, name);
    }, [onChange, name]);

    const actions = (clearable && hasValue && !readOnly && !disabled ? (
        <>
            {actionsFromProps}
            <IconButton
                {...clearButtonProps} // eslint-disable-line react/jsx-props-no-spreading
                name="clear-button"
                variant="tertiary"
                ariaLabel="Clear"
                onClick={handleClear}
                className={styles.clearButton}
            >
                <CloseLineIcon />
            </IconButton>
        </>
    ) : null);

    const FileInputComponent = multiple ? (
        <RawFileInput
            onChange={onChange}
            multiple={multiple}
            accept={accept}
            name={name}
            form={form}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            capture={capture}
            inputProps={fileInputProps}
        >
            {(fileButtonProps) => (
                <div
                    className={_cs(inputClassName, styles.button, disabled && styles.disabled)}
                    {...fileButtonProps} // eslint-disable-line react/jsx-props-no-spreading
                    {...inputProps} // eslint-disable-line react/jsx-props-no-spreading
                    {...others} // eslint-disable-line react/jsx-props-no-spreading
                    role="button"
                    aria-disabled={disabled || readOnly}
                    tabIndex={0}
                >
                    {hasValue ? (
                        <ValueComponent value={value} />
                    ) : <div>{placeholder}</div>}
                </div>
            )}
        </RawFileInput>
    ) : (
        <RawFileInput
            onChange={onChange}
            multiple={multiple}
            accept={accept}
            name={name}
            form={form}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            capture={capture}
            inputProps={fileInputProps}
        >
            {(fileButtonProps) => (
                <div
                    className={_cs(inputClassName, styles.button, disabled && styles.disabled)}
                    {...fileButtonProps} // eslint-disable-line react/jsx-props-no-spreading
                    {...inputProps} // eslint-disable-line react/jsx-props-no-spreading
                    {...others} // eslint-disable-line react/jsx-props-no-spreading
                    role="button"
                    aria-disabled={disabled || readOnly}
                    tabIndex={0}
                >
                    {hasValue ? (
                        <ValueComponent value={value} />
                    ) : <div>{placeholder}</div>}
                </div>
            )}
        </RawFileInput>
    );

    return (
        <InputContainer
            className={className}
            actions={actions}
            disabled={disabled}
            error={error}
            errorOnTooltip={errorOnTooltip}
            hint={hint}
            icons={icons}
            inputSectionClassName={inputSectionClassName}
            label={label}
            required={required}
            readOnly={readOnly}
            variant={variant}
            withAsterisk={withAsterisk}
            input={FileInputComponent}
        />
    );
}

export default FileInput;
