import type { Maybe } from '@togglecorp/fujs';
import {
    isDefined,
    isInteger,
} from '@togglecorp/fujs';

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
            ? `Field must be greater than ${x}`
            : undefined
    );
}

export function nonZeroCondition(value: Maybe<number>) {
    // FIXME: use translations
    return isDefined(value) && value === 0
        ? 'The field must not be 0'
        : undefined;
}
