import { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { CloseLineIcon } from '@ifrc-go/icons';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import { NameType } from '../types';
import IconButton from '../IconButton';
import RawFileInput, { RawFileInputProps } from '../RawFileInput';
import styles from './styles.module.css';

type InheritedProps<N extends NameType> = Omit<InputContainerProps, 'input'> & Omit<RawFileInputProps<N>, 'multiple' | 'onChange' | 'children' | 'inputRef'>;

export type MultiFileInputProps<N extends NameType> = InheritedProps<N> & {
    clearButtonProps?: React.ComponentPropsWithoutRef<'button'>;
    clearable?: boolean;
    fileInputProps?: React.ComponentPropsWithoutRef<'input'>;
    inputClassName?: string;
    onChange: (files: File[] | undefined, name: N) => void;
    placeholder?: React.ReactNode;
    value: File[] | null | undefined;
    valueComponent?: React.FC<{ value: File[] }>;
}

interface DefaultValueProps {
    value: File[];
}

function DefaultValue(props: DefaultValueProps) {
    const { value } = props;
    return (
        <div>
            {value?.map((file) => file.name).join(', ')}
        </div>
    );
}

function MultiFileInput<N extends NameType>(props: MultiFileInputProps<N>) {
    const {
        accept,
        actions: actionsFromProps,
        className,
        clearButtonProps,
        clearable,
        disabled,
        error,
        errorOnTooltip,
        fileInputProps,
        hint,
        icons,
        inputClassName,
        inputSectionClassName,
        label,
        name,
        onChange,
        placeholder,
        readOnly,
        required,
        value,
        valueComponent,
        variant,
        withAsterisk,
    } = props;

    const ValueComponent = valueComponent ?? DefaultValue;

    const hasValue = isDefined(value) && value.length > 0;

    const handleClear = useCallback(() => {
        onChange(undefined, name);
    }, [onChange, name]);

    const actions = (clearable && hasValue && !readOnly && !disabled ? (
        <>
            {actionsFromProps}
            <IconButton
                {...clearButtonProps} // eslint-disable-line react/jsx-props-no-spreading
                name="clear-button"
                variant="tertiary"
                ariaLabel="clear"
                onClick={handleClear}
                className={styles.clearButton}
            >
                <CloseLineIcon />
            </IconButton>
        </>
    ) : null);

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
            input={(
                <RawFileInput
                    className={inputClassName}
                    onChange={onChange}
                    accept={accept}
                    name={name}
                    disabled={disabled || readOnly}
                    readOnly={readOnly}
                    inputProps={fileInputProps}
                    multiple
                >
                    {hasValue ? (
                        <ValueComponent value={value} />
                    ) : <div>{placeholder}</div>}
                </RawFileInput>
            )}
        />
    );
}

export default MultiFileInput;
