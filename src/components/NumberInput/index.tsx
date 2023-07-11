import { useState, useEffect, useCallback } from 'react';

import { isDefined } from '@togglecorp/fujs';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';

type InheritedProps<T> = (Omit<InputContainerProps, 'input'> & Omit<RawInputProps<T>, 'onChange' | 'value'>);

export interface Props<T> extends InheritedProps<T> {
  inputElementRef?: React.RefObject<HTMLInputElement>;
  inputClassName?: string;
  value: number | undefined | null;
  onChange?: (
    value: number | undefined,
    name: T,
    e?: React.FormEvent<HTMLInputElement> | undefined,
  ) => void;
}

function NumberInput<const T>(props: Props<T>) {
    const {
        className,
        actions,
        icons,
        error,
        hint,
        label,
        disabled,
        readOnly,
        inputClassName,
        value: valueFromProps,
        errorOnTooltip,
        onChange,
        ...otherInputProps
    } = props;

    const [tempValue, setTempValue] = useState<string | undefined>(String(valueFromProps ?? ''));

    useEffect(() => {
        setTempValue(String(valueFromProps ?? ''));
    }, [valueFromProps]);

    const handleChange: RawInputProps<T>['onChange'] = useCallback((v, n, e) => {
        setTempValue(v);

        if (!onChange) {
            return;
        }

        if (isDefined(v)) {
            const floatValue = +v;
            if (!Number.isNaN(floatValue)) {
                onChange(floatValue, n, e);
            }
        } else {
            onChange(undefined, n, e);
        }
    }, [onChange]);

    return (
        <InputContainer
            className={className}
            actions={actions}
            icons={icons}
            error={error}
            hint={hint}
            label={label}
            disabled={disabled}
            readOnly={readOnly}
            errorOnTooltip={errorOnTooltip}
            input={(
                <RawInput
                    {...otherInputProps} /* eslint-disable-line react/jsx-props-no-spreading */
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClassName}
                    value={tempValue}
                    onChange={handleChange}
                    type="number"
                />
            )}
        />
    );
}

export default NumberInput;
