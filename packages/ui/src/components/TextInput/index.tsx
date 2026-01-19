import { useMemo } from 'react';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import RawInput, { Props as RawInputProps } from '#components/RawInput';
import { getHighlightMode } from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input' | 'highlightMode'>
& Omit<RawInputProps<NAME>, 'type' | 'className' | 'elementRef'>;

export interface Props<NAME> extends InheritedProps<NAME> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
    type?: 'text' | 'password';
    withDiffView?: boolean;
    prevValue?: RawInputProps<NAME>['value'];
}

function TextInput<const NAME>(props: Props<NAME>) {
    const {
        disabled,
        inputClassName,
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
