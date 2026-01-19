import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { getHighlightMode } from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawInputProps<NAME>, 'onChange' | 'value' | 'className' | 'elementRef'>;

export interface Props<NAME> extends InheritedProps<NAME> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
    value: number | undefined | null;
    onChange?: (
        value: number | undefined,
        name: NAME,
        e?: React.FormEvent<HTMLInputElement> | undefined,
    ) => void;
    withDiffView?: boolean;
    prevValue?: number | undefined | null;
}

function NumberInput<const T>(props: Props<T>) {
    const {
        disabled,
        readOnly,
        inputClassName,
        value: valueFromProps,
        required,
        onChange,
        withDiffView,
        value,
        prevValue,
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

    const highlightMode = useMemo(
        () => getHighlightMode(value, prevValue, withDiffView),
        [value, prevValue, withDiffView],
    );

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
