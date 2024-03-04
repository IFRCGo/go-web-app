import {
    useCallback,
    useState,
} from 'react';
import {
    EyeFillIcon,
    EyeOffLineIcon,
} from '@ifrc-go/icons';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import useTranslation from '#hooks/useTranslation';

import Button from '../Button';

import i18n from './i18n.json';

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
        errorOnTooltip,
        hint,
        icons,
        inputClassName,
        inputSectionClassName,
        labelClassName,
        label,
        readOnly,
        required,
        variant,
        withAsterisk,
        ...rawInputProps
    } = props;

    const [showPassword, setShowPassword] = useState(false);
    const strings = useTranslation(i18n);
    const handleButtonClick = useCallback(() => {
        setShowPassword((show: boolean) => !show);
    }, []);

    return (
        <InputContainer
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
            actions={(
                <>
                    {actions}
                    <Button
                        onClick={handleButtonClick}
                        variant="tertiary"
                        disabled={disabled}
                        name={undefined}
                        title={showPassword ? strings.hidePassword : strings.showPassword}
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
                    readOnly={readOnly}
                    disabled={disabled}
                    type={showPassword ? 'text' : 'password'}
                />
            )}
        />
    );
}

export default PasswordInput;
