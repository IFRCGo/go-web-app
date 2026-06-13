import {
    useId,
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { getHighlightMode } from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input' | 'highlightMode'>
& Omit<RawInputProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<NAME> extends InheritedProps<NAME> {
    /** Ref to the inner <input> node (elementRef refers to the root) */
    inputElementRef?: React.RefObject<HTMLInputElement | null>;
    inputClassName?: string;
    type?: 'text' | 'password';
    withDiffView?: boolean;
    prevValue?: RawInputProps<NAME>['value'];
}

/**
 * Single-line text input composed of InputContainer and RawInput
 * (specific layer).
 */
function TextInput<const NAME>(props: Props<NAME>) {
    const {
        disabled,
        inputClassName,
        inputElementRef,
        readOnly,
        required,
        type = 'text',
        withDiffView,
        value,
        prevValue,
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

    const highlightMode = useMemo(
        () => getHighlightMode(value, prevValue, withDiffView),
        [value, prevValue, withDiffView],
    );

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
            highlightMode={highlightMode}
            prevValue={prevValue}
            input={(
                <RawInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
                    id={inputId}
                    aria-invalid={hasError}
                    aria-required={required}
                    aria-describedby={describedBy}
                    elementRef={inputElementRef}
                    value={value}
                    className={inputClassName}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    type={type}
                />
            )}
        />
    );
}

export default TextInput;
