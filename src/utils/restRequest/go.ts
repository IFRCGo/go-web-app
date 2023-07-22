import {
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import { ContextInterface } from '@togglecorp/toggle-request';
import { nonFieldError } from '@togglecorp/toggle-form';
import { UserAuth } from '#contexts/user';
import { KEY_USER_STORAGE } from '#utils/constants';
import { resolveUrl } from '#utils/resolveUrl';

import {
    riskApi,
    api,
} from '#config';
import { isObject } from '#utils/common';
import { getFromStorage } from '#utils/localStorage';

const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_CSV = 'text/csv';

export type ResponseError = {
    status: number;
    originalResponse: Response,
    responseText: string;
}

export interface TransformedError {
    value: {
        formErrors: Record<string, unknown> & { [nonFieldError]: string },
        messageForNotification: string,
    };
    status: number | undefined;
    debugMessage: string;
}

export interface AdditionalOptions {
    apiType?: 'go' | 'risk';
    pathVariables?: Record<string, number | string | undefined>;
    formData?: boolean;
    isCsvRequest?: boolean;
    enforceEnglish?: boolean;
}

function transformError(response: ResponseError, fallbackMessage: string): TransformedError['value']['formErrors'] {
    const {
        originalResponse,
        responseText,
    } = response;

    if (originalResponse.status.toLocaleString()[0] === '5') {
        return { [nonFieldError]: 'Internal server error!' };
    }

    if (!responseText) {
        return { [nonFieldError]: 'Empty error response from server!' };
    }

    if (originalResponse.headers.get('content-type') === CONTENT_TYPE_JSON) {
        try {
            const json = JSON.parse(responseText);
            if (isObject(json)) {
                const {
                    error_message,
                    non_field_errors,
                    ...otherError
                } = json as Record<string, string[]>;

                const formError = {
                    [nonFieldError]: [
                        error_message,
                        non_field_errors,
                    ].filter(Boolean).join(', ') ?? fallbackMessage,
                    ...otherError,
                };

                return formError;
            }

            if (Array.isArray(json)) {
                return { [nonFieldError]: json.join(', ') };
            }

            // FIXME: rename error message
            return { [nonFieldError]: 'Response content type mismatch' };
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    if (typeof responseText === 'string') {
        return { [nonFieldError]: responseText };
    }

    return { [nonFieldError]: fallbackMessage };
}

export function resolvePath(
    path: string,
    params: Record<string, string | number | undefined> | undefined,
) {
    if (isNotDefined(path)) {
        return '';
    }

    if (isNotDefined(params)) {
        return path;
    }

    // TODO: use regex to parse and resolve path Variables
    // TODO: Write test
    const parts = path.split('{');
    const resolvedParts = parts.map((part) => {
        const endIndex = part.indexOf('}');

        if (endIndex === -1) {
            return part;
        }

        const key = part.substring(0, endIndex);
        const value = params[key];
        if (isNotDefined(value)) {
            // eslint-disable-next-line no-console
            console.error(`resolveUrlPath: value for key "${key}" not provided`);
            return '';
        }

        return part.replace(`${key}}`, String(value));
    });

    return resolvedParts.join('');
}

type GoContextInterface = ContextInterface<
    unknown,
    ResponseError,
    TransformedError,
    AdditionalOptions
>;

export const processGoUrls: GoContextInterface['transformUrl'] = (url, _, additionalOptions) => {
    if (isFalsyString(url)) {
        return '';
    }

    // external URL
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    const {
        apiType,
        pathVariables,
    } = additionalOptions;

    const resolvedPath = resolvePath(url, pathVariables);

    return resolveUrl(
        apiType === 'risk' ? riskApi : api,
        resolvedPath,
    );
};

type Literal = string | number | boolean | File;
type FormDataCompatibleObj = Record<string, Literal | Literal[] | null | undefined>;

function getFormData(jsonData: FormDataCompatibleObj) {
    const formData = new FormData();
    Object.keys(jsonData || {}).forEach(
        (key) => {
            const value = jsonData?.[key];
            if (value && Array.isArray(value)) {
                value.forEach((v) => {
                    formData.append(key, v instanceof Blob ? v : String(v));
                });
            } else if (isDefined(value)) {
                formData.append(key, value instanceof Blob ? value : String(value));
            } else {
                formData.append(key, '');
            }
        },
    );
    return formData;
}

export const processGoOptions: GoContextInterface['transformOptions'] = (
    _,
    requestOptions,
    extraOptions,
) => {
    const {
        body,
        headers,
        method = 'GET',
        ...otherOptions
    } = requestOptions;

    const {
        formData,
        isCsvRequest,
        enforceEnglish,
    } = extraOptions;

    const currentLanguage = 'en';
    const user = getFromStorage<UserAuth | undefined>(KEY_USER_STORAGE);
    const token = user?.token;

    const defaultHeaders = {
        Authorization: token ? `Token ${token}` : '',
        'Accept-Language': (enforceEnglish || method !== 'GET') ? 'en' : currentLanguage,
    };

    if (formData) {
        const requestBody = getFormData(body as FormDataCompatibleObj);
        return {
            method,
            headers: {
                Accept: 'application/json',
                ...defaultHeaders,
                ...headers,
            },
            body: requestBody,
            ...otherOptions,
        };
    }

    const requestBody = body ? JSON.stringify(body) : undefined;
    return {
        method,
        headers: {
            Accept: isCsvRequest ? CONTENT_TYPE_CSV : CONTENT_TYPE_JSON,
            'Content-Type': isCsvRequest
                ? 'text/csv; charset=utf-8'
                : 'application/json; charset=utf-8',
            ...defaultHeaders,
            ...headers,
        },
        body: requestBody,
        ...otherOptions,
    };
};

export const processGoResponse: GoContextInterface['transformResponse'] = async (
    res,
) => {
    const originalResponse = res.clone();
    const resText = await res.text();

    if (res.redirected) {
        const url = new URL(res.url);
        if (url.pathname.includes('login')) {
            throw Error('Redirected by server');
        }
    }

    if (res.status >= 200 && res.status < 300) {
        if (res.headers.get('content-type') === CONTENT_TYPE_JSON) {
            const json = JSON.parse(resText);
            return json;
        }

        return resText;
    }

    return {
        status: res.status,
        originalResponse,
        responseText: resText,
    };
};

export const processGoError: GoContextInterface['transformError'] = (
    responseError,
    url,
    requestOptions,
) => {
    if (responseError === 'network') {
        return {
            reason: 'network',
            value: {
                messageForNotification: 'Cannot communicate with the server! Please, make sure you have an active internet connection and try again!',
                formErrors: {
                    [nonFieldError]: 'Network error',
                },
            },
            status: undefined,
            debugMessage: JSON.stringify({
                url,
                status: undefined,
                requestOptions,
                error: 'Network error',
            }),
        };
    }

    if (responseError === 'parse') {
        return {
            reason: 'parse',
            value: {
                messageForNotification: 'There was a problem parsing the response from server',
                formErrors: {
                    [nonFieldError]: 'Response parse error',
                },
            },
            status: undefined,
            debugMessage: JSON.stringify({
                url,
                status: undefined,
                requestOptions,
                error: 'Response parse error',
            }),
        };
    }

    const { method } = requestOptions;

    // default fallback message for GET
    let fallbackMessage = 'Failed to load data';

    if (method !== 'GET') {
        switch (responseError?.status) {
            case 401:
                fallbackMessage = 'You do not have enough permission to perform this action';
                break;
            case 413:
                fallbackMessage = 'Your request was refused because the payload was too large';
                break;
            default:
                fallbackMessage = 'Some error occurred while performing this action.';
                break;
        }
    }

    const formErrors = transformError(responseError, fallbackMessage);

    return {
        reason: 'server',
        value: {
            formErrors,
            messageForNotification: formErrors[nonFieldError],
            errorText: responseError.responseText,
        },
        status: responseError?.status,
        debugMessage: JSON.stringify({
            url,
            status: responseError?.status,
            requestOptions,
            error: 'Request rejected by the server',
            responseText: responseError.responseText,
        }),
    };
};
