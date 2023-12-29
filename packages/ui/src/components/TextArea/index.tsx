import React from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';

const BULLET = '•';
const KEY_ENTER = 'Enter';

type InheritedProps<N> = (Omit<InputContainerProps, 'input'> & Omit<RawTextAreaProps<N>, 'type'>);
export interface Props<T> extends InheritedProps<T> {
  inputElementRef?: React.RefObject<HTMLInputElement>;
  autoBullets?: boolean;
  inputClassName?: string;
}

function TextArea<const N>(props: Props<N>) {
    const {
        actions,
        className,
        disabled,
        error,
        errorOnTooltip,
        hint,
        icons,
        inputClassName,
        label,
        labelClassName,
        readOnly,
        required,
        variant,
        inputSectionClassName,
        withAsterisk,
        onChange,
        name,
        autoBullets = false,
        rows = 5,
        ...otherInputProps
    } = props;

    const handleInputFocus = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (isNotDefined(onChange)) {
            return;
        }

        if (e.target.value === '') {
            onChange(`${BULLET} `, name);
        }
    }, [onChange, name]);

    const handleKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isNotDefined(onChange)) {
            return;
        }

        if (e.key === KEY_ENTER) {
            onChange(`${e.currentTarget.value}${BULLET} `, name);
        }
    }, [onChange, name]);

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
                <RawTextArea
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherInputProps}
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClassName}
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
