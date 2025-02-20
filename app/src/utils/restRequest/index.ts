import {
    RequestContext,
    useLazyRequest,
    useRequest,
} from '@togglecorp/toggle-request';

import type { paths as riskApiPaths } from '#generated/riskTypes';
import type { paths as goApiPaths } from '#generated/types';

import type {
    ApiBody,
    ApiResponse,
    ApiUrlQuery,
    CustomLazyRequestOptions,
    CustomLazyRequestReturn,
    CustomRequestOptions,
    CustomRequestReturn,
    VALID_METHOD,
} from './overrideTypes';

export type GoApiResponse<URL extends keyof goApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET'> = ApiResponse<goApiPaths, URL, METHOD>;
export type GoApiUrlQuery<URL extends keyof goApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'> = ApiUrlQuery<goApiPaths, URL, METHOD>
export type GoApiBody<URL extends keyof goApiPaths, METHOD extends 'POST' | 'PUT' | 'PATCH'> = ApiBody<goApiPaths, URL, METHOD>

export type RiskApiResponse<URL extends keyof riskApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET'> = ApiResponse<riskApiPaths, URL, METHOD>;
// type RiskApiUrlQuery<
//     URL extends keyof riskApiPaths,
//     METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
// > = ApiUrlQuery<riskApiPaths, URL, METHOD>
// type RiskApiBody<
//     URL extends keyof riskApiPaths,
//     METHOD extends 'POST' | 'PUT' | 'PATCH'
// > = ApiBody<riskApiPaths, URL, METHOD>

export type ListResponseItem<RESPONSE extends {
    results?: Array<unknown>
} | undefined> = NonNullable<NonNullable<RESPONSE>['results']>[number];

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
    useGoLazyRequest as useLazyRequest,
    useGoRequest as useRequest,
    useRiskLazyRequest,
    useRiskRequest,
};
