import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';

type InheritedProps<T> = (Omit<InputContainerProps, 'input'> & RawInputProps<T>);
export interface Props<T> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
}

function DateInput<const T>(props: Props<T>) {
    const {
        className,
        actions,
        icons,
        error,
        hint,
        label,
        disabled,
        readOnly,
        errorOnTooltip,
        inputClassName,
        withAsterisk,
        inputSectionClassName,
        labelClassName,
        required,
        variant,
        ...otherInputProps
    } = props;

    return (
        <InputContainer
            actions={actions}
            className={className}
            disabled={disabled}
            error={error}
            errorOnTooltip={errorOnTooltip}
            hint={hint}
            icons={icons}
            inputSectionClassName={inputSectionClassName}
            labelClassName={labelClassName}
            label={label}
            readOnly={readOnly}
            required={required}
            variant={variant}
            withAsterisk={withAsterisk}
            input={(
                <RawInput
                    {...otherInputProps} /* eslint-disable-line react/jsx-props-no-spreading */
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClassName}
                    type="date"
                />
            )}
        />
    );
}

export default DateInput;
