import { useMemo } from 'react';

import DateOutput from '#components/DateOutput';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { getHighlightMode } from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input' | 'highlightMode'>
& Omit<RawInputProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<NAME> extends InheritedProps<NAME> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
    withDiffView?: boolean;
    prevValue?: RawInputProps<NAME>['value'];
}

function DateInput<const T>(props: Props<T>) {
    const {
        disabled,
        inputClassName,
        readOnly,
        required,
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

    const prevValueDisplay = useMemo(
        () => <DateOutput value={prevValue} />,
        [prevValue],
    );

    return (
        <InputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerProps}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            highlightMode={highlightMode}
            prevValue={prevValueDisplay}
            input={(
                <RawInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawInputProps}
                    value={value}
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClassName}
                    type="date"
                />
            )}
        />
    );
}

export default DateInput;
