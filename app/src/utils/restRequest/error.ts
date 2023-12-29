import {
    isNotDefined,
    listToMap,
    mapToMap,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

// NOTE: Some leaf can also have string error
type ResponseLeafError = string | string[];

export type ResponseObjectError = {
    [key: string]: ResponseObjectError | ResponseArrayError | ResponseLeafError | undefined;
} & {
    non_field_errors?: string[] | undefined;
    internal_non_field_errors?: string[] | undefined;
};

type ResponseArrayError = (ResponseObjectError | ResponseArrayError | ResponseLeafError)[];

type FormLeafError = string;
type FormArrayError = {
    [key: string]: FormLeafError | FormObjectError | FormArrayError | undefined;
}
type FormObjectError = {
    [nonFieldError]?: string
} & {
    [key: string]: FormLeafError | FormObjectError | FormArrayError | undefined;
};

export const NUM = Symbol('NUMBER');

export function matchArray(
    array: (string | number)[],
    expressions: (string | number | typeof NUM)[],
) {
    if (array.length !== expressions.length) {
        return undefined;
    }
    const response: number[] = [];
    for (let i = 0; i < array.length; i += 1) {
        const item = array[i];
        const expression = expressions[i];

        if (expression === NUM) {
            if (typeof item !== 'number') {
                return undefined;
            }

            response.push(item);
            // eslint-disable-next-line no-continue
            continue;
        }

        if (expression === item) {
            // eslint-disable-next-line no-continue
            continue;
        }

        return undefined;
    }
    return response;
}

function isObjectError(
    err: ResponseObjectError | ResponseArrayError | ResponseLeafError,
): err is ResponseObjectError {
    return !Array.isArray(err) && typeof err === 'object';
}

function isLeafError(
    err: ResponseObjectError | ResponseArrayError | ResponseLeafError,
): err is ResponseLeafError {
    if (isObjectError(err)) {
        return false;
    }
    if (typeof err === 'string') {
        return true;
    }
    const unsafeErr: unknown[] = err;
    return Array.isArray(unsafeErr) && unsafeErr.every(
        (e: unknown) => typeof e === 'string',
    );
}

function isArrayError(
    err: ResponseObjectError | ResponseArrayError | ResponseLeafError,
): err is ResponseLeafError {
    if (isObjectError(err)) {
        return false;
    }
    if (isLeafError(err)) {
        return false;
    }
    return Array.isArray(err) && err.every(
        (e) => isArrayError(e) || isObjectError(e),
    );
}

function transformLeafError(error: ResponseLeafError | undefined) {
    if (isNotDefined(error)) {
        return undefined;
    }
    if (typeof error === 'string') {
        return error;
    }
    return error.join(' ');
}

export type Location = (string | number)[];
type GetKey = (location: Location) => string | number | undefined;

function transformArrayError(
    error: ResponseArrayError | undefined,
    getKey: GetKey,
    location: Location = [],
): FormArrayError | undefined {
    if (isNotDefined(error)) {
        return undefined;
    }
    const EMPTY_KEY = '';
    const formErrors = listToMap(
        error,
        (_, index) => getKey([...location, index]) ?? EMPTY_KEY,
        (memberError, _, index) => {
            if (isObjectError(memberError)) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                return transformObjectError(memberError, getKey, [...location, index]);
            }
            if (isLeafError(memberError)) {
                return transformLeafError(memberError);
            }
            if (isArrayError(memberError)) {
                return transformArrayError(memberError, getKey, [...location, index]);
            }
            return undefined;
        },
    );
    delete formErrors[EMPTY_KEY];
    return formErrors;
}

export function transformObjectError(
    error: ResponseObjectError | undefined,
    getKey: GetKey,
    location: Location = [],
): FormObjectError | undefined {
    if (isNotDefined(error)) {
        return undefined;
    }
    const {
        non_field_errors,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        internal_non_field_errors,
        ...fieldErrors
    } = error;

    return {
        [nonFieldError]: non_field_errors?.join(' '),
        ...mapToMap(
            fieldErrors,
            (key) => key,
            (fieldError, key) => {
                if (isNotDefined(fieldError)) {
                    return undefined;
                }
                if (isObjectError(fieldError)) {
                    return transformObjectError(fieldError, getKey, [...location, key]);
                }
                if (isLeafError(fieldError)) {
                    return transformLeafError(fieldError);
                }
                if (isArrayError(fieldError)) {
                    return transformArrayError(fieldError, getKey, [...location, key]);
                }
                return undefined;
            },
        ),
    };
}
