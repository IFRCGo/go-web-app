import { useCallback, useRef } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import { NameType } from '#components/types';

import { CloseLineIcon } from '@ifrc-go/icons';
import IconButton from '#components/IconButton';
import RawFileInput, { RawFileInputProps } from '../RawFileInput';
import styles from './styles.module.css';

type InheritedProps<N extends NameType> = Omit<InputContainerProps, 'input'> & Omit<RawFileInputProps<N>, 'multiple' | 'onChange' | 'children'>;

export type SingleFileInputProps<N extends NameType> = InheritedProps<N> & {
    valueComponent?: React.FC<{ value: File }>;
    clearable?: boolean;
    clearButtonProps?: React.ComponentPropsWithoutRef<'button'>;
    inputClassName?: string;
    fileInputProps?: React.ComponentPropsWithoutRef<'input'>;
    placeholder?: React.ReactNode;
    value: File | null | undefined;
    onChange: (files: File | undefined, name: N) => void;
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

    const inputRef = useRef<HTMLInputElement>(null);

    const hasValue = isDefined(value);

    const handleClick = useCallback(() => {
        if (!disabled && typeof inputRef?.current?.click === 'function') {
            inputRef.current.click();
        }
    }, [disabled]);

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
                    ref={inputRef}
                >
                    <div
                        {...inputProps} // eslint-disable-line react/jsx-props-no-spreading
                        {...others} // eslint-disable-line react/jsx-props-no-spreading
                        className={_cs(
                            inputClassName,
                            styles.button,
                            disabled && styles.disabled,
                        )}
                        onKeyDown={handleClick}
                        onClick={handleClick}
                        role="button"
                        aria-disabled={disabled || readOnly}
                        tabIndex={0}
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
