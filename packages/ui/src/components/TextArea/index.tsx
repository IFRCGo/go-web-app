import React from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import { extractInputContainerProps } from '#utils/inputs';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';

const BULLET = '•';
const KEY_ENTER = 'Enter';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawTextAreaProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<T> extends InheritedProps<T> {
  inputElementRef?: React.RefObject<HTMLInputElement>;
  autoBullets?: boolean;
  inputClassName?: string;
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
        ...otherProps
    } = props;

    const [inputContainerProps, rawInputProps] = extractInputContainerProps(
        otherProps,
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
            input={(
                <RawTextArea
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
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
