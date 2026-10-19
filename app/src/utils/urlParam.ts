import { isTruthyString } from '@togglecorp/fujs';

export interface UrlParam<VALUE> {
    // NOTE: other pages link to the list with this name (e.g. `atype`), so it must not change
    key: string;
    // NOTE: undefined for a value the list does not accept, which then counts as no filter
    parse: (value: string) => VALUE | undefined;
    // NOTE: undefined or an empty string removes the param
    serialize: (value: VALUE) => string | undefined;
}

function number(key: string): UrlParam<number> {
    return {
        key,
        parse: (value) => {
            const numericValue = Number(value);
            return value.trim() !== '' && Number.isFinite(numericValue)
                ? numericValue
                : undefined;
        },
        serialize: String,
    };
}

function oneOf<const VALUE extends string | number>(
    key: string,
    values: readonly VALUE[],
): UrlParam<VALUE> {
    return {
        key,
        parse: (value) => values.find((option) => String(option) === value),
        serialize: String,
    };
}

// NOTE: not trimmed, a bound text input would lose typed spaces; trim it in the request
function text(key: string): UrlParam<string> {
    return {
        key,
        parse: (value) => (isTruthyString(value) ? value : undefined),
        serialize: (value) => value,
    };
}

function flag(key: string): UrlParam<boolean> {
    return {
        key,
        parse: (value) => (value.toLowerCase() === 'true' ? true : undefined),
        serialize: (value) => (value ? 'true' : undefined),
    };
}

const urlParam = {
    number,
    oneOf,
    text,
    flag,
};

export default urlParam;
