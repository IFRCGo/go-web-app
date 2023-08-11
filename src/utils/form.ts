import {
    isInteger,
    isDefined,
} from '@togglecorp/fujs';
import type { Maybe } from '@togglecorp/fujs';

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
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
    return (value: Maybe<string>) => (
        isDefined(value) && (new Date(value).getTime()) < (new Date(x).getTime())
            ? `Field must be greater than ${x}`
            : undefined
    );
}
