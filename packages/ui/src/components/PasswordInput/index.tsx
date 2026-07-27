import {
    useCallback,
    useId,
    useState,
} from 'react';
import {
    EyeFillIcon,
    EyeOffLineIcon,
} from '@ifrc-go/icons';
import { isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import useTranslation from '#hooks/useTranslation';
import { extractInputContainerProps } from '#utils/inputs';

import i18n from './i18n.json';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawInputProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<T> extends InheritedProps<T> {
    /** Ref to the inner <input> node (elementRef refers to the root) */
    inputElementRef?: React.RefObject<HTMLInputElement | null>;
    inputClassName?: string;
}

/**
 * Password input with a show/hide toggle, composed of InputContainer
 * and RawInput (specific layer).
 */
function PasswordInput<const T>(props: Props<T>) {
    const {
        disabled,
        inputClassName,
        inputElementRef,
        readOnly,
        required,
        actions,
        ...otherProps
    } = props;

    const [inputContainerProps, rawInputProps] = extractInputContainerProps(
        otherProps,
    );

    const generatedId = useId();
    const inputId = generatedId;
    const hasError = isDefined(inputContainerProps.error);
    const hasHint = isDefined(inputContainerProps.hint);
    const errorId = hasError ? `${generatedId}-error` : undefined;
    const hintId = hasHint ? `${generatedId}-hint` : undefined;
    const describedBy = [hintId, errorId].filter(isDefined).join(' ') || undefined;

    const [showPassword, setShowPassword] = useState(false);
    const strings = useTranslation(i18n);
    const handleButtonClick = useCallback(() => {
        setShowPassword((show: boolean) => !show);
    }, []);

    return (
        <InputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerProps}
            inputId={inputId}
            hintId={hintId}
            errorId={errorId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            actions={(
                <>
                    {actions}
                    <Button
                        onClick={handleButtonClick}
                        variant="tertiary"
                        disabled={disabled}
                        name={undefined}
                        aria-label={showPassword ? strings.hidePassword : strings.showPassword}
                        aria-pressed={showPassword}
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
                    id={inputId}
                    aria-invalid={hasError}
                    aria-required={required}
                    aria-describedby={describedBy}
                    elementRef={inputElementRef}
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
