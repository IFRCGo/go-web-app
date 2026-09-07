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

// NOTE: Firefox and Safari let you type letters into a number input. The browser
// then reports the value as empty, so the stray text never reaches onChange and
// cannot be stripped after the fact. Rejecting the insertion is the only fix.
// Scientific notation is excluded deliberately, no field here needs it.
const NON_NUMERIC_PATTERN = /[^\d.+-]/;

function isNonNumericText(text: string | undefined | null) {
    if (isNotDefined(text)) {
        return false;
    }

    return NON_NUMERIC_PATTERN.test(text);
}

export interface Props<NAME> extends InheritedProps<NAME> {
    inputElementRef?: React.RefObject<HTMLInputElement | null>;
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
        onBeforeInput,
        onPaste,
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
        // FIXME(frozenhelium): Syncs local string state with incoming prop value
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // NOTE: React skips onBeforeInput for ctrl/alt/meta combos, so select all,
    // undo and the browser shortcuts are left alone
    const handleBeforeInput = useCallback((e: React.InputEvent<HTMLInputElement>) => {
        onBeforeInput?.(e);

        if (!e.defaultPrevented && isNonNumericText(e.data)) {
            e.preventDefault();
        }
    }, [onBeforeInput]);

    // NOTE: React does not route paste through onBeforeInput on Firefox
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        onPaste?.(e);

        if (!e.defaultPrevented && isNonNumericText(e.clipboardData.getData('text'))) {
            e.preventDefault();
        }
    }, [onPaste]);

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
                    onBeforeInput={handleBeforeInput}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    readOnly={readOnly}
                    type="number"
                    value={tempValue}
                />
            )}
        />
    );
}

export default NumberInput;
