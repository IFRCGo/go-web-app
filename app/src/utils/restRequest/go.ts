import { type Language } from '@ifrc-go/ui/contexts';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import { type ContextInterface } from '@togglecorp/toggle-request';

import {
    api,
    riskApi,
} from '#config';
import { type UserAuth } from '#contexts/user';
import {
    KEY_LANGUAGE_STORAGE,
    KEY_USER_STORAGE,
} from '#utils/constants';
import { getFromStorage } from '#utils/localStorage';
import { resolveUrl } from '#utils/resolveUrl';

import { type ResponseObjectError } from './error';

const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_CSV = 'text/csv';
const CONTENT_TYPE_EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type ResponseError = {
    status: number;
    originalResponse: Response,
    responseText: string;
}

export interface TransformedError {
    value: {
        formErrors: ResponseObjectError,
        messageForNotification: string,
    };
    status: number | undefined;
    debugMessage: string;
}

export interface AdditionalOptions {
    apiType?: 'go' | 'risk';
    formData?: boolean;
    isCsvRequest?: boolean;
    enforceEnglishForQuery?: boolean;
    useCurrentLanguageForMutation?: boolean;
    isExcelRequest?: boolean;
}

function transformError(
    response: ResponseError,
    fallbackMessage: string,
): ResponseObjectError | string {
    const {
        originalResponse,
        responseText,
    } = response;

    if (originalResponse.status.toLocaleString()[0] === '5') {
        return 'Internal server error!';
    }

    if (isFalsyString(responseText)) {
        return 'Empty error response from server!';
    }

    if (originalResponse.headers.get('content-type') === CONTENT_TYPE_JSON) {
        try {
            const json = JSON.parse(responseText);
            // Non Standard Error
            if (typeof json !== 'object' || Array.isArray(json) || isNotDefined(json)) {
                return fallbackMessage;
            }
            // Old Standard Error
            if (
                typeof json.statusCode === 'number'
                && typeof json.error_message === 'string'
            ) {
                return json.error_message;
            }
            // New Standard Error
            if (
                typeof json.errors === 'object'
                && !Array.isArray(json.errors)
            ) {
                return json.errors;
            }
            // Non Standard Error
            return fallbackMessage;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return fallbackMessage;
        }
    }

    if (typeof responseText === 'string') {
        return responseText;
    }

    return fallbackMessage;
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

    const { apiType } = additionalOptions;

    return resolveUrl(
        apiType === 'risk' ? riskApi : api,
        url,
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
        isExcelRequest,
        enforceEnglishForQuery = false,
        useCurrentLanguageForMutation = false,
    } = extraOptions;

    const currentLanguage = getFromStorage<Language>(KEY_LANGUAGE_STORAGE) ?? 'en';
    const user = getFromStorage<UserAuth | undefined>(KEY_USER_STORAGE);
    const token = user?.token;

    const defaultHeaders: HeadersInit = {
        Authorization: token ? `Token ${token}` : '',
    };

    if (method === 'GET') {
        // Query
        defaultHeaders['Accept-Language'] = enforceEnglishForQuery ? 'en' : currentLanguage;
    } else {
        // Mutation
        defaultHeaders['Accept-Language'] = useCurrentLanguageForMutation ? currentLanguage : 'en';
    }

    if (formData) {
        const requestBody = getFormData(body as FormDataCompatibleObj);
        return {
            method,
            headers: {
                ...defaultHeaders,
                ...headers,
            },
            body: requestBody,
            ...otherOptions,
        };
    }

    const requestBody = body ? JSON.stringify(body) : undefined;

    let contentType: string = CONTENT_TYPE_JSON;
    if (isCsvRequest) {
        contentType = CONTENT_TYPE_CSV;
    } else if (isExcelRequest) {
        contentType = CONTENT_TYPE_EXCEL;
    }

    const specificHeaders = {
        Accept: contentType,
        'Content-Type': contentType,
    };

    return {
        method,
        headers: {
            ...defaultHeaders,
            ...specificHeaders,
            ...headers,
        },
        body: requestBody,
        ...otherOptions,
    };
};

const isSuccessfulStatus = (status: number): boolean => status >= 200 && status < 300;

const isContentTypeExcel = (res: Response): boolean => res.headers.get('content-type') === CONTENT_TYPE_EXCEL;

const isContentTypeJson = (res: Response): boolean => res.headers.get('content-type') === CONTENT_TYPE_JSON;

const isLoginRedirect = (url: string): boolean => new URL(url).pathname.includes('login');

export const processGoResponse: GoContextInterface['transformResponse'] = async (
    res,
) => {
    if (res.redirected && isLoginRedirect(res.url)) {
        throw new Error('Redirected by server');
    }

    if (isSuccessfulStatus(res.status)) {
        if (isContentTypeExcel(res)) {
            return res.blob();
        }

        const resText = await res.text();
        if (isContentTypeJson(res)) {
            return JSON.parse(resText);
        }

        return resText;
    }

    const originalResponse = res.clone();
    const resText = await res.text();

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
        const err = {
            non_field_errors: ['Network error'],
        };
        return {
            reason: 'network',
            value: {
                messageForNotification: 'Cannot connect with the server! Please, make sure you have an active internet connection and try again!',
                formErrors: err,
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
        const err = {
            non_field_errors: ['Response parse error'],
        };
        return {
            reason: 'parse',
            value: {
                messageForNotification: 'There was a problem parsing the response from server',
                formErrors: err,
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
            formErrors: typeof formErrors === 'string'
                ? { non_field_errors: [formErrors] }
                : formErrors,
            messageForNotification: typeof formErrors === 'string'
                ? formErrors
                : formErrors.non_field_errors?.join(' ') || fallbackMessage,
            // errorText: responseError.responseText,
        },
        status: responseError?.status,

        // FIXME: We should not stringify the whole response eagerly
        debugMessage: JSON.stringify({
            url,
            status: responseError?.status,
            requestOptions,
            error: 'Request rejected by the server',
            responseText: responseError.responseText,
        }),
    };
};
