import {
    RequestContext,
    useRequest,
    useLazyRequest,
} from '@togglecorp/toggle-request';

import type { paths as goApiPaths } from '#generated/types';
import type { paths as riskApiPaths } from '#generated/riskTypes';
import type {
    CustomRequestOptions,
    CustomRequestReturn,
    CustomLazyRequestOptions,
    CustomLazyRequestReturn,
    VALID_METHOD,
} from './overrideTypes';

// FIXME: add more types

export type GoApiResponse<URL extends keyof goApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET'> = (
    METHOD extends 'GET'
    ? goApiPaths[URL] extends { get: { responses: { 200: { content: { 'application/json': infer Res } } } } }
        ? Res
        : never
    : METHOD extends 'POST'
        ? goApiPaths[URL] extends { post: { responses: { 201: { content: { 'application/json': infer Res } } } } }
            ? Res
            : never
        : METHOD extends 'PATCH'
            ? goApiPaths[URL] extends { patch: { responses: { 200: { content: { 'application/json': infer Res } } } } }
                ? Res
                : never
            : METHOD extends 'PUT'
                ? goApiPaths[URL] extends { put: { responses: { 200: { content: { 'application/json': infer Res } } } } }
                    ? Res
                    : never
                : never
)

export type GoApiUrlQuery<URL extends keyof goApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'> = (
    METHOD extends 'GET'
    ? goApiPaths[URL] extends { get: { parameters: { query: infer Query } } }
        ? Query
        : never
    : METHOD extends 'POST'
        ? goApiPaths[URL] extends { post: { parameters: { query: infer Query } } }
            ? Query
            : never
        : METHOD extends 'PATCH'
            ? goApiPaths[URL] extends { patch: { parameters: { query: infer Query } } }
                ? Query
                : never
            : METHOD extends 'PUT'
                ? goApiPaths[URL] extends { put: { parameters: { query: infer Query } } }
                    ? Query
                    : never
                : METHOD extends 'DELETE'
                    ? goApiPaths[URL] extends { delete: { parameters: { query: infer Query } } }
                        ? Query
                        : never
                    : never
);

export type GoApiBody<URL extends keyof goApiPaths, METHOD extends 'POST' | 'PUT' | 'PATCH'> = (
    METHOD extends 'POST'
        ? goApiPaths[URL] extends { post: { requestBody: { content: { 'application/json': infer Res } } } }
            ? Res
            : never
        : METHOD extends 'PATCH'
            ? goApiPaths[URL] extends { patch: { requestBody: { content: { 'application/json': infer Res } } } }
                ? Res
                : never
            : METHOD extends 'PUT'
                ? goApiPaths[URL] extends { put: { requestBody: { content: { 'application/json': infer Res } } } }
                    ? Res
                    : never
                : never
)

export type RiskApiResponse<T extends keyof riskApiPaths> = (
    riskApiPaths[T] extends {
        get: {
            responses: {
                200: {
                    content: {
                        'application/json': infer Res,
                    },
                },
            },
        },
    }
        ? Res
        : never
)

export type RiskApiUrlQuery<T extends keyof riskApiPaths> = (
    riskApiPaths[T] extends {
        get: {
            parameters: {
                query: infer Que,
            },
        },
    }
        ? Que
        : never
);

// FIXME: identify a way to do this without a cast
const useGoRequest = useRequest as <
    PATH extends keyof goApiPaths,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomRequestOptions<goApiPaths, PATH, METHOD>
) => CustomRequestReturn<goApiPaths, PATH, METHOD>;

// FIXME: identify a way to do this without a cast
const useGoLazyRequest = useLazyRequest as <
    PATH extends keyof goApiPaths,
    CONTEXT = unknown,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<goApiPaths, PATH, METHOD, CONTEXT>
) => CustomLazyRequestReturn<goApiPaths, PATH, METHOD, CONTEXT>;

// FIXME: identify a way to do this without a cast
const useRiskRequest = useRequest as <
    PATH extends keyof riskApiPaths,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomRequestOptions<riskApiPaths, PATH, METHOD> & { apiType: 'risk' },
) => CustomRequestReturn<riskApiPaths, PATH, METHOD>;

// FIXME: identify a way to do this without a cast
const useRiskLazyRequest = useLazyRequest as <
    PATH extends keyof riskApiPaths,
    CONTEXT = unknown,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<riskApiPaths, PATH, METHOD, CONTEXT> & { apiType: 'risk' }
) => CustomLazyRequestReturn<riskApiPaths, PATH, METHOD, CONTEXT>;

export {
    RequestContext,
    useGoRequest as useRequest,
    useGoLazyRequest as useLazyRequest,
    useRiskRequest,
    useRiskLazyRequest,
};
