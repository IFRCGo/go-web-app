import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';

type InheritedProps<T> = (Omit<InputContainerProps, 'input'> & Omit<RawInputProps<T>, 'type'>);

export interface Props<T> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
    type?: 'text' | 'password';
}

function TextInput<const T>(props: Props<T>) {
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
        type = 'text',
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
            readOnly={readOnly}
            variant={variant}
            withAsterisk={withAsterisk}
            input={(
                <RawInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherInputProps}
                    required={required}
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClassName}
                    type={type}
                />
            )}
        />
    );
}

export default TextInput;
