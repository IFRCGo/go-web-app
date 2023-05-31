import { useCallback, useRef } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { CloseLineIcon } from '@ifrc-go/icons';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import { NameType } from '../types';
import IconButton from '../IconButton';
import RawFileInput, { RawFileInputProps } from '../RawFileInput';
import styles from './styles.module.css';

type InheritedProps<N extends NameType> = Omit<InputContainerProps, 'input'> & Omit<RawFileInputProps<N>, 'multiple' | 'onChange' | 'children' | 'inputRef'>;

export type SingleFileInputProps<N extends NameType> = InheritedProps<N> & {
    clearButtonProps?: React.ComponentPropsWithoutRef<'button'>;
    clearable?: boolean;
    fileInputProps?: React.ComponentPropsWithoutRef<'input'>;
    inputClassName?: string;
    onChange: (files: File | undefined, name: N) => void;
    placeholder?: React.ReactNode;
    value: File | null | undefined;
    valueComponent?: React.FC<{ value: File }>;
}

interface DefaultValueProps {
    value: File;
}

function DefaultValue(props: DefaultValueProps) {
    const { value } = props;
    return (
        <div>
            {value?.name}
        </div>
    );
}

function SingleFileInput<N extends NameType>(props: SingleFileInputProps<N>) {
    const {
        accept,
        actions: actionsFromProps,
        capture,
        className,
        clearButtonProps,
        clearable,
        disabled,
        error,
        errorOnTooltip,
        fileInputProps,
        form,
        hint,
        icons,
        inputClassName,
        inputProps,
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
        ...others
    } = props;

    const ValueComponent = valueComponent ?? DefaultValue;

    const inputRef = useRef<HTMLInputElement>(null);

    const hasValue = isDefined(value);

    const handleClick = useCallback(() => {
        if (!disabled) {
            inputRef?.current?.click();
        }
    }, [disabled]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    const handleClear = useCallback(() => {
        onChange(undefined, name);
    }, [onChange, name]);

    const actions = (clearable && value && !readOnly && !disabled ? (
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
                    onChange={onChange}
                    accept={accept}
                    name={name}
                    form={form}
                    disabled={disabled || readOnly}
                    readOnly={readOnly}
                    capture={capture}
                    inputProps={fileInputProps}
                    inputRef={inputRef}
                >
                    <div
                        {...inputProps} // eslint-disable-line react/jsx-props-no-spreading
                        {...others} // eslint-disable-line react/jsx-props-no-spreading
                        className={_cs(
                            inputClassName,
                            styles.button,
                            disabled && styles.disabled,
                        )}
                        onKeyDown={handleKeyDown}
                        onClick={handleClick}
                        role="button"
                        aria-disabled={disabled || readOnly}
                        tabIndex={disabled ? -1 : 0}
                    >
                        {hasValue ? (
                            <ValueComponent value={value} />
                        ) : <div>{placeholder}</div>}
                    </div>
                </RawFileInput>
            )}
        />
    );
}

export default SingleFileInput;
