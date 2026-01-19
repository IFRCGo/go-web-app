import React, { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import { getHighlightMode } from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';

const BULLET = '•';
const KEY_ENTER = 'Enter';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawTextAreaProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<NAME> extends InheritedProps<NAME> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    autoBullets?: boolean;
    inputClassName?: string;
    withDiffView?: boolean;
    prevValue?: RawTextAreaProps<NAME>['value'];
}

function TextArea<const N>(props: Props<N>) {
    const {
        disabled,
        inputClassName,
        readOnly,
        required,
        onChange,
        name,

        autoBullets = false,
        rows = 5,

        withDiffView,
        value,
        prevValue,
        ...otherProps
    } = props;

    const [inputContainerProps, rawInputProps] = extractInputContainerProps(
        otherProps,
    );

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
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            highlightMode={highlightMode}
            prevValue={prevValue}
            input={(
                <RawTextArea
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
                    value={value}
                    className={inputClassName}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    onChange={onChange}
                    name={name}
                    onFocus={autoBullets ? handleInputFocus : undefined}
                    onKeyUp={autoBullets ? handleKeyUp : undefined}
                    rows={rows}
                />
            )}
        />
    );
}

export default TextArea;
