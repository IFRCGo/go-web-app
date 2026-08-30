import React, { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import {
    getHighlightMode,
    getWordCount,
    trimToWordLimit,
} from '#utils/common';
import { extractInputContainerProps } from '#utils/inputs';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';
import TextBadge from '../TextBadge';

const BULLET = '•';
const KEY_ENTER = 'Enter';

type InheritedProps<NAME> = Omit<InputContainerProps, 'input'>
& Omit<RawTextAreaProps<NAME>, 'type' | 'className' | 'elementRef' | 'maxLength'>;

interface BaseProps<NAME> {
    inputElementRef?: React.RefObject<HTMLInputElement | null>;
    autoBullets?: boolean;
    inputClassName?: string;
    withDiffView?: boolean;
    prevValue?: RawTextAreaProps<NAME>['value'];
}

type LimitProps = {
    maxLength?: number;
    maxWords?: never;
} | {
    maxLength?: never;
    maxWords?: number;
};

export type Props<NAME> = InheritedProps<NAME> & BaseProps<NAME> & LimitProps;

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
        maxLength,
        maxWords,
        ...otherProps
    } = props;

    const [inputContainerProps, rawInputProps] = extractInputContainerProps(
        otherProps,
    );

    const highlightMode = useMemo(
        () => getHighlightMode(value, prevValue, withDiffView),
        [value, prevValue, withDiffView],
    );

    const wordCount = useMemo(
        () => (isNotDefined(maxWords) ? undefined : getWordCount(value)),
        [value, maxWords],
    );

    const handleChange = React.useCallback((
        newValue: string | undefined,
        inputName: N,
        e?: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        if (isNotDefined(onChange)) {
            return;
        }

        if (isNotDefined(maxWords)) {
            onChange(newValue, inputName, e);
            return;
        }

        onChange(trimToWordLimit(newValue, maxWords), inputName, e);
    }, [onChange, maxWords]);

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
                <>
                    <RawTextArea
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rawInputProps}
                        value={value}
                        className={inputClassName}
                        disabled={disabled}
                        readOnly={readOnly}
                        required={required}
                        onChange={handleChange}
                        name={name}
                        onFocus={autoBullets ? handleInputFocus : undefined}
                        onKeyUp={autoBullets ? handleKeyUp : undefined}
                        maxLength={maxLength}
                        rows={rows}
                    />
                    <TextBadge
                        length={value?.length}
                        maxLength={maxLength}
                        wordCount={wordCount}
                        maxWords={maxWords}
                    />
                </>
            )}
        />
    );
}

export default TextArea;
