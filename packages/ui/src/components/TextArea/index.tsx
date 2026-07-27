import React, {
    useId,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import CharacterCount from '#components/CharacterCount';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '#components/RawTextArea';
import { getHighlightMode } from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

const BULLET = '•';
const KEY_ENTER = 'Enter';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawTextAreaProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<NAME> extends InheritedProps<NAME> {
    /** Ref to the inner <textarea> node (elementRef refers to the root) */
    inputElementRef?: React.RefObject<HTMLTextAreaElement | null>;
    autoBullets?: boolean;
    inputClassName?: string;
    withDiffView?: boolean;
    prevValue?: RawTextAreaProps<NAME>['value'];
}

/**
 * Multi-line text input composed of InputContainer and RawTextArea,
 * with optional auto-bullets and a character counter (specific layer).
 */
function TextArea<const N>(props: Props<N>) {
    const {
        disabled,
        inputClassName,
        inputElementRef,
        readOnly,
        required,
        onChange,
        name,

        autoBullets = false,
        rows = 5,

        withDiffView,
        value,
        prevValue,
        maxLength,
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

    const handleInputFocus = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (isNotDefined(onChange) || disabled || readOnly) {
            return;
        }

        if (e.target.value === '') {
            onChange(`${BULLET} `, name);
        }
    }, [onChange, name, disabled, readOnly]);

    const handleKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isNotDefined(onChange) || disabled || readOnly) {
            return;
        }

        if (e.key === KEY_ENTER) {
            onChange(`${e.currentTarget.value}${BULLET} `, name);
        }
    }, [onChange, name, disabled, readOnly]);

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
                <>
                    <RawTextArea
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
                        onChange={onChange}
                        name={name}
                        onFocus={autoBullets ? handleInputFocus : undefined}
                        onKeyUp={autoBullets ? handleKeyUp : undefined}
                        maxLength={maxLength}
                        rows={rows}
                    />
                    <CharacterCount
                        length={value?.length}
                        maxLength={maxLength}
                    />
                </>
            )}
        />
    );
}

export default TextArea;
