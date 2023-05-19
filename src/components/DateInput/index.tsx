import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { NameType } from '#components/types';

type InheritedProps<T extends NameType> = (Omit<InputContainerProps, 'input'> & RawInputProps<T>);
export interface Props<T extends NameType> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
}

function DateInput<T extends NameType>(props: Props<T>) {
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
        ...otherInputProps
    } = props;

    return (
        <InputContainer
            className={className}
            actions={actions}
            icons={icons}
            error={error}
            label={label}
            hint={hint}
            disabled={disabled}
            errorOnTooltip={errorOnTooltip}
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
