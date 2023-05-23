import { useState, useCallback } from 'react';
import { EyeFillIcon, EyeOffLineIcon } from '@ifrc-go/icons';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import Button from '../Button';

type InheritedProps<T> = (Omit<InputContainerProps, 'input'> & RawInputProps<T>);
export interface Props<T> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
}
function PasswordInput<const T>(props: Props<T>) {
    const {
        actions,
        className,
        disabled,
        error,
        hint,
        icons,
        label,
        readOnly,
        inputElementRef,
        inputClassName,
        ...rawInputProps
    } = props;

    const [showPassword, setShowPassword] = useState(false);
    const handleButtonClick = useCallback(() => {
        setShowPassword((show: boolean) => !show);
    }, []);

    return (
        <InputContainer
            className={className}
            disabled={disabled}
            error={error}
            hint={hint}
            icons={icons}
            label={label}
            readOnly={readOnly}
            actions={(
                <>
                    {actions}
                    <Button
                        onClick={handleButtonClick}
                        variant="tertiary"
                        disabled={disabled}
                        name={undefined}
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeFillIcon /> : <EyeOffLineIcon />}
                    </Button>
                </>
            )}
            input={(
                <RawInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
                    className={inputClassName}
                    elementRef={inputElementRef}
                    readOnly={readOnly}
                    disabled={disabled}
                    type={showPassword ? 'text' : 'password'}
                />
            )}
        />
    );
}

export default PasswordInput;
