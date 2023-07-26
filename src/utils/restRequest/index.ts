import {
    RequestContext,
    useRequest as useReq,
    useLazyRequest,
    RequestOptions,
    LazyRequestOptions,
} from '@togglecorp/toggle-request';

import type { paths as goApiPaths } from '#generated/types';
import type { paths as riskApiPaths } from '#generated/riskTypes';

import {
    TransformedError,
    AdditionalOptions,
} from './go';

type GoGetOptions<T extends keyof goApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof goApiPaths]: goApiPaths[key] extends {
        get: {
            parameters: {
                query?: infer Query,
                path?: infer Path,
            },
            responses: {
                200: {
                    content: {
                        'application/json': infer Response,
                    },
                },
            },
        },
    }
        ? Omit<{
            url: key,
            query: Query,
            pathVariables: Path,
            response: Response,
        }, OMISSION>
        : never
}[T]
type GoPutOptions<T extends keyof goApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof goApiPaths]: goApiPaths[key] extends {
        put: {
            parameters: {
                query?: infer Query,
                path?: infer Path,
            },
            responses: {
                200: {
                    content: {
                        'application/json': infer Response,
                    },
                },
            },
            requestBody: {
                content: {
                    'application/json': infer Body,
                }
            },
        },
    }
        ? Omit<{
            url: key,
            query: Query,
            pathVariables: Path,
            response: Response,
            body: Body,
        }, OMISSION>
        : never
}[T]
type GoPatchOptions<T extends keyof goApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof goApiPaths]: goApiPaths[key] extends {
        patch: {
            parameters: {
                query?: infer Query,
                path?: infer Path,
            },
            responses: {
                200: {
                    content: {
                        'application/json': infer Response,
                    },
                },
            },
            requestBody: {
                content: {
                    'application/json': infer Body,
                }
            },
        },
    }
        ? Omit<{
            url: key,
            query: Query,
            pathVariables: Path,
            response: Response,
            body: Body,
        }, OMISSION>
        : never
}[T]
type GoPostOptions<T extends keyof goApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof goApiPaths]: goApiPaths[key] extends {
        post: {
            parameters: {
                query?: infer Query,
                path?: infer Path,
            },
            responses: {
                200: {
                    content: {
                        'application/json': infer Response,
                    },
                },
            },
            requestBody: {
                content: {
                    'application/json': infer Body,
                }
            },
        },
    }
        ? Omit<{
            url: key,
            query: Query,
            pathVariables: Path,
            response: Response,
            body: Body,
        }, OMISSION>
        : never
}[T]
type GoDeleteOptions<T extends keyof goApiPaths> = {
    [key in keyof goApiPaths]: goApiPaths[key] extends {
        delete: {
            parameters: {
                query?: infer Query,
                path?: infer Path,
            },
        }
    }
        ? {
            url: key,
            query: Query,
            pathVariables: Path,
        }
        : never
}[T]

interface BasicGoType<U, M> {
    url: U,
    method: M,
    apiType?: 'default'
}
interface BasicGoReturnType<R> {
    response: R;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
}

// FIXME: Update here
type GoOptions<T extends keyof goApiPaths, M extends 'get' | 'post' | 'put' | 'patch' | 'delete', OMISSION extends 'response' = never> = (
    M extends 'get'
        ? BasicGoType<T, M> & GoGetOptions<T, OMISSION>
        : M extends 'put'
            ? BasicGoType<T, M> & GoPutOptions<T, OMISSION>
            : M extends 'patch'
                ? BasicGoType<T, M> & GoPatchOptions<T, OMISSION>
                : M extends 'post'
                    ? BasicGoType<T, M> & GoPostOptions<T, OMISSION>
                    : M extends 'delete'
                        ? BasicGoType<T, M> & GoDeleteOptions<T>
                        : never
);
// FIXME: Update here
type GoResponse<T extends keyof goApiPaths, M extends 'get' | 'post' | 'put' | 'patch' | 'delete'> = (
    M extends 'get'
        ? BasicGoReturnType<GoGetOptions<T>['response']>
        : M extends 'put'
            ? BasicGoReturnType<GoPutOptions<T>['response']>
            : M extends 'patch'
                ? BasicGoReturnType<GoPatchOptions<T>['response']>
                : M extends 'post'
                    ? BasicGoReturnType<GoPostOptions<T>['response']>
                    : M extends 'delete'
                        ? BasicGoReturnType<undefined>
                        : never
);

function fakeRequest<T extends keyof goApiPaths, M extends 'get' | 'post' | 'put' | 'patch' | 'delete'>(
    requestOptions: GoOptions<T, M, 'response'>,
): GoResponse<T, M> {
    console.warn(requestOptions);
    return {} as any;
}

const value = fakeRequest({
    apiType: 'default',
    url: '/api/v2/dref-final-report/{id}/',
    method: 'delete',
    pathVariables: { id: '12' },
    query: { format: 'csv' },
});
console.warn(value);
const value2 = fakeRequest<'/api/v2/dref-final-report/{id}/', 'get'>({
    apiType: 'default' as const,
    url: '/api/v2/dref-final-report/{id}/',
    method: 'get',
    pathVariables: { id: '20' },
    query: { format: 'csv' },
});
console.warn(value2);
const value3 = fakeRequest({
    apiType: 'default' as const,
    url: '/api/v2/dref-final-report/{id}/',
    method: 'get',
    pathVariables: { id: '20' },
    query: { format: 'csv' },
});
console.warn(value3);
const value4 = fakeRequest<'/api/v2/dref-final-report/{id}/', 'put'>({
    apiType: 'default' as const,
    url: '/api/v2/dref-final-report/{id}/',
    method: 'put',
    pathVariables: { id: '12' },
    query: {},
    body: {},
});
console.warn(value4);
const value5 = fakeRequest({
    apiType: 'default' as const,
    url: '/api/v2/per-work-plan/{id}/',
    method: 'put',
    pathVariables: { id: 12 },
    query: {},
    body: {},
});
console.warn(value5);

// No need to look below

type GoApiUrlPaths = keyof goApiPaths;

type GoApiResponseWithContent = {
    'responses': {
        '200': {
            'content': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                'application/json': unknown;
            }
        }
    }
}

type GoApiUrlQueryWithContent = {
    'parameters': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'query': object;
    }
}

type GoApiUrlPathVariablesWithContent = {
    'parameters': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'path': object;
    }
}

type RiskApiResponseWithContent = {
    'responses': {
        '200': {
            'content': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                'application/json': any;
            }
        }
    }
}

type RiskApiUrlQueryWithContent = {
    'parameters': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'query': any;
    }
}

type RiskApiUrlPathVariablesWithContent = {
    'parameters': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'path': any;
    }
}

type RiskApiUrlPaths = keyof riskApiPaths;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetGoApi<URL extends GoApiUrlPaths> = goApiPaths[URL] extends { get: any } ? goApiPaths[URL]['get'] : unknown;
export type GoApiResponse<
    URL extends GoApiUrlPaths
> = GetGoApi<URL> extends GoApiResponseWithContent
    ? GetGoApi<URL>['responses']['200']['content']['application/json']
    : unknown;
export type GoApiUrlQuery<
    URL extends GoApiUrlPaths
> = GetGoApi<URL> extends GoApiUrlQueryWithContent ? GetGoApi<URL>['parameters']['query'] : unknown;
type GoApiUrlPathVariables<
    URL extends GoApiUrlPaths
> = GetGoApi<URL> extends GoApiUrlPathVariablesWithContent ? GetGoApi<URL>['parameters']['path'] : unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetRiskApi<URL extends RiskApiUrlPaths> = riskApiPaths[URL] extends { get: any } ? riskApiPaths[URL]['get'] : unknown;
export type RiskApiResponse<
    URL extends RiskApiUrlPaths
> = GetRiskApi<URL> extends RiskApiResponseWithContent
    ? GetRiskApi<URL>['responses']['200']['content']['application/json']
    : unknown;
export type RiskApiUrlQuery<
    URL extends RiskApiUrlPaths
> = GetRiskApi<URL> extends RiskApiUrlQueryWithContent ? GetRiskApi<URL>['parameters']['query'] : unknown;
type RiskApiUrlPathVariables<
    URL extends RiskApiUrlPaths
> = GetRiskApi<URL> extends RiskApiUrlPathVariablesWithContent ? GetRiskApi<URL>['parameters']['path'] : unknown;

type DefaultRequestOptions<RESPONSE> = RequestOptions<
    RESPONSE, TransformedError, AdditionalOptions
>;

type RiskRequestOptions<URL extends RiskApiUrlPaths> = Omit<DefaultRequestOptions<RiskApiResponse<URL>>, 'url' | 'query'> & {
    url: URL;
    pathVariables?: RiskApiUrlPathVariables<URL>;
    query?: RiskApiUrlQuery<URL>;
}

type GoRequestOptions<URL extends GoApiUrlPaths> = Omit<DefaultRequestOptions<GoApiResponse<URL>>, 'url' | 'query'> & {
    url: URL;
    pathVariables?: GoApiUrlPathVariables<URL>;
    query?: GoApiUrlQuery<URL>;
}

type RiskApiRequestReturnType<URL extends RiskApiUrlPaths> = {
    response: RiskApiResponse<URL> | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
}

type GoApiRequestReturnType<URL extends GoApiUrlPaths> = {
    response: GoApiResponse<URL> | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
}

// TODO: add url typing
// TODO: use path varialbes
// eslint-disable-next-line max-len
const useGoLazyRequest: <R, C = unknown>(requestOptions: LazyRequestOptions<R, TransformedError, C, AdditionalOptions>) => {
    response: R | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    trigger: (ctx: C) => void;
    context: C | undefined,
} = useLazyRequest;

function useReq<URL extends RiskApiUrlPaths>(
    requestOptions: { apiType: 'risk' } & RiskRequestOptions<URL>
): RiskApiRequestReturnType<URL>
function useReq<URL extends GoApiUrlPaths>(
    requestOptions: { apiType?: 'default' } & GoRequestOptions<URL>
): GoApiRequestReturnType<URL>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useReq(requestOptions: any) {
    return useReq(requestOptions);
}

// const useGoRequest: GoApiRequest & RiskApiRequest = useRequest;

export {
    RequestContext,
    useReq as useRequest,
    useGoLazyRequest as useLazyRequest,
};
