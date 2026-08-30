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
import { extractInputContainerProps } from '#utils/inputs';

import Button from '../Button';

import i18n from './i18n.json';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawInputProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<T> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement | null>;
    inputClassName?: string;
}

function PasswordInput<const T>(props: Props<T>) {
    const {
        disabled,
        inputClassName,
        readOnly,
        required,
        actions,
        ...otherProps
    } = props;

    const [inputContainerProps, rawInputProps] = extractInputContainerProps(
        otherProps,
    );

    const [showPassword, setShowPassword] = useState(false);
    const strings = useTranslation(i18n);
    const handleButtonClick = useCallback(() => {
        setShowPassword((show: boolean) => !show);
    }, []);

    return (
        <InputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerProps}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            actions={(
                <>
                    {actions}
                    <Button
                        onClick={handleButtonClick}
                        styleVariant="action"
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
