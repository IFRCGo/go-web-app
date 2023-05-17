import React from 'react';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { NameType } from '#components/types';

type InheritedProps<T extends NameType> = (Omit<InputContainerProps, 'input'> & Omit<RawInputProps<T>, 'type'>);

export interface Props<T extends NameType> extends InheritedProps<T> {
  inputElementRef?: React.RefObject<HTMLInputElement>;
  inputClassName?: string;
}

function TextInput<T extends NameType>(props: Props<T>) {
    const {
        actions,
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
        ...otherInputProps
    } = props;

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
            variant={variant}
            withAsterisk={withAsterisk}
            input={(
                <RawInput
                    {...otherInputProps}
                    required={required}
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClassName}
                    type="text"
                />
            )}
        />
    );
}

export default TextInput;
