import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { extractInputContainerProps } from '#utils/inputs';

type InheritedProps<T> = Omit<InputContainerProps, 'input'>
& Omit<RawInputProps<T>, 'onChange' | 'value' | 'className' | 'elementRef'>;

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
        disabled,
        readOnly,
        inputClassName,
        value: valueFromProps,
        required,
        onChange,
        ...otherProps
    } = props;

    const [inputContainerProps, rawInputProps] = extractInputContainerProps(
        otherProps,
    );
    const [tempValue, setTempValue] = useState<string | undefined>(String(valueFromProps ?? ''));

    useEffect(() => {
        setTempValue(String(valueFromProps ?? ''));
    }, [valueFromProps]);

    const handleChange: RawInputProps<T>['onChange'] = useCallback((v, n, e) => {
        setTempValue(v);

        if (isNotDefined(onChange)) {
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerProps}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            input={(
                <RawInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
                    className={inputClassName}
                    disabled={disabled}
                    onChange={handleChange}
                    readOnly={readOnly}
                    type="number"
                    value={tempValue}
                />
            )}
        />
    );
}

export default NumberInput;
