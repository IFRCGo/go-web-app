import React from 'react';
import { NameType } from '#components/types';
import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';

const BULLET = '•';
const KEY_ENTER = 'ENTER';

type InheritedProps<N extends NameType> = (Omit<InputContainerProps, 'input'> & Omit<RawTextAreaProps<N>, 'type'>);
export interface Props<T extends number | string | undefined> extends InheritedProps<T> {
  inputElementRef?: React.RefObject<HTMLInputElement>;
  autoBullets?: boolean;
  inputClassName?: string;
}

function TextArea<N extends NameType>(props: Props<N>) {
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
        withAsterisk,
        onChange,
        name,
        autoBullets = false,
        rows = 5,
        ...otherInputProps
    } = props;

    const handleInputFocus = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (!onChange) {
            return;
        }

        if (e.target.value === '') {
            onChange(`${BULLET} `, name);
        }
    }, [onChange, name]);

    const handleKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!onChange) {
            return;
        }

        if (e.key === KEY_ENTER) {
            onChange(`${e.currentTarget.value}${BULLET} `, name);
        }
    }, [onChange, name]);

    return (
        <InputContainer
            className={className}
            actions={actions}
            disabled={disabled}
            error={error}
            errorOnTooltip={errorOnTooltip}
            hint={hint}
            icons={icons}
            label={label}
            labelClassName={labelClassName}
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
