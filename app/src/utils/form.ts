import { useCallback } from 'react';
import type { Maybe } from '@togglecorp/fujs';
import {
    isDefined,
    isInteger,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    isCallable,
    type SetValueArg,
} from '@togglecorp/toggle-form';

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

export function getNumberInBetweenCondition(min: number, max: number) {
    return (value: Maybe<number>) => (
        isDefined(value) && (value > max || value < min)
            ? `The value must be between ${min} to ${max}`
            : undefined
    );
}

export function positiveNumberCondition(value: Maybe<number>) {
    // FIXME: use translations
    return isDefined(value) && (!isNumber(value) || value < 0)
        ? 'The field must be a positive number'
        : undefined;
}

export function positiveIntegerCondition(value: Maybe<number>) {
    // FIXME: use translations
    return isDefined(value) && (!isInteger(value) || value < 0)
        ? 'The field must be a positive number without decimal'
        : undefined;
}

export function dateGreaterThanOrEqualCondition(x: string) {
    // FIXME: use translations
    return (value: Maybe<string>) => (
        isDefined(value) && (new Date(value).getTime()) < (new Date(x).getTime())
            ? `Select a date on or after ${x}.`
            : undefined
    );
}

export function nonZeroCondition(value: Maybe<number>) {
    // FIXME: use translations
    return isDefined(value) && value === 0
        ? 'The field must not be 0'
        : undefined;
}

// NOTE: This hook is an extension over useFormArray
// If an element is empty, we remove that element from the array
export function useFormArrayWithEmptyCheck<NAME, VALUE>(
    name: NAME,
    onChange: (
        newValue: SetValueArg<VALUE[]>,
        inputName: NAME,
    ) => void,
    isEmpty: (item: VALUE) => boolean,
) {
    const setValue = useCallback(
        (val: SetValueArg<VALUE>, index: number | undefined) => {
            onChange(
                (oldValue: VALUE[] | undefined): VALUE[] => {
                    const newVal = [...(oldValue ?? [])];

                    if (isNotDefined(index)) {
                        const resolvedVal = isCallable(val) ? val(undefined) : val;

                        if (!isEmpty(resolvedVal)) {
                            newVal.push(resolvedVal);
                        }
                    } else {
                        const resolvedVal = isCallable(val) ? val(newVal[index]) : val;

                        if (isEmpty(resolvedVal)) {
                            newVal.splice(index, 1);
                        } else {
                            newVal[index] = resolvedVal;
                        }
                    }
                    return newVal;
                },
                name,
            );
        },
        [name, onChange, isEmpty],
    );

    const removeValue = useCallback(
        (index: number) => {
            onChange(
                (oldValue: VALUE[] | undefined): VALUE[] => {
                    if (!oldValue) {
                        return [];
                    }
                    const newVal = [...oldValue];
                    newVal.splice(index, 1);
                    return newVal;
                },
                name,
            );
        },
        [name, onChange],
    );

    return { setValue, removeValue };
}
