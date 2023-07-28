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
} from './overrideTypes';

// FIXME: remove this later
export type GoApiResponse<T extends keyof goApiPaths> = (
    goApiPaths[T] extends {
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
// FIXME: remove this later
export type GoApiUrlQuery<T extends keyof goApiPaths> = (
    goApiPaths[T] extends {
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
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined = 'GET',
>(
    requestOptions: CustomRequestOptions<goApiPaths, PATH, METHOD, 'response'>
) => CustomRequestReturn<goApiPaths, PATH, METHOD>;

// FIXME: identify a way to do this without a cast
const useGoLazyRequest = useLazyRequest as <
    PATH extends keyof goApiPaths,
    CONTEXT = null,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<goApiPaths, PATH, METHOD, CONTEXT, 'response'>
) => CustomLazyRequestReturn<goApiPaths, PATH, METHOD, CONTEXT>;

// FIXME: remove this later
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
// FIXME: remove this later
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
const useRiskRequest = useRequest as <
    PATH extends keyof riskApiPaths,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined = 'GET',
>(
    requestOptions: CustomRequestOptions<riskApiPaths, PATH, METHOD, 'response'> & { apiType: 'risk' }
) => CustomRequestReturn<riskApiPaths, PATH, METHOD>;

// FIXME: identify a way to do this without a cast
const useRiskLazyRequest = useLazyRequest as <
    PATH extends keyof riskApiPaths,
    CONTEXT = null,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<riskApiPaths, PATH, METHOD, CONTEXT, 'response'> & { apiType: 'risk' }
) => CustomLazyRequestReturn<riskApiPaths, PATH, METHOD, CONTEXT>;

export {
    RequestContext,
    useGoRequest as useRequest,
    useGoLazyRequest as useLazyRequest,
    useRiskRequest,
    useRiskLazyRequest,
};
