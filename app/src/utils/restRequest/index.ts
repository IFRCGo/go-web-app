import {
    RequestContext,
    useLazyRequest,
    useRequest,
} from '@togglecorp/toggle-request';

import type { paths as riskApiPaths } from '#generated/riskTypes';
import type { paths as translationApiPaths } from '#generated/translationTypes';
import type { paths as goApiPaths } from '#generated/types';

import type {
    ApiBody,
    ApiResponse,
    ApiUrlQuery,
    CustomLazyRequestOptions,
    CustomLazyRequestReturn,
    CustomRequestOptions,
    CustomRequestReturn,
    ExternalRequestOptions,
    ExternalRequestReturn,
    VALID_METHOD,
} from './overrideTypes';

export type GoApiResponse<URL extends keyof goApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET'> = ApiResponse<goApiPaths, URL, METHOD>;
export type GoApiUrlQuery<URL extends keyof goApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'> = ApiUrlQuery<goApiPaths, URL, METHOD>
export type GoApiBody<URL extends keyof goApiPaths, METHOD extends 'POST' | 'PUT' | 'PATCH'> = ApiBody<goApiPaths, URL, METHOD>

export type RiskApiResponse<URL extends keyof riskApiPaths, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET'> = ApiResponse<riskApiPaths, URL, METHOD>;

export type ListResponseItem<RESPONSE extends {
    results?: Array<unknown>
} | undefined> = NonNullable<NonNullable<RESPONSE>['results']>[number];

// FIXME: identify a way to do this without a cast
const useTranslationLazyRequestBase = useLazyRequest as <
    PATH extends keyof translationApiPaths,
    CONTEXT = unknown,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<translationApiPaths, PATH, METHOD, CONTEXT> & { apiType: 'translation' }
) => CustomLazyRequestReturn<translationApiPaths, PATH, METHOD, CONTEXT>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useTranslationLazyRequest<
    PATH extends keyof translationApiPaths,
    CONTEXT = unknown,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<translationApiPaths, PATH, METHOD, CONTEXT>,
): CustomLazyRequestReturn<translationApiPaths, PATH, METHOD, CONTEXT> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useTranslationLazyRequestBase({ ...(requestOptions as any), apiType: 'translation' });
}

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
const useRiskRequestBase = useRequest as <
    PATH extends keyof riskApiPaths,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomRequestOptions<riskApiPaths, PATH, METHOD> & { apiType: 'risk' },
) => CustomRequestReturn<riskApiPaths, PATH, METHOD>;

function useRiskRequest<
    PATH extends keyof riskApiPaths,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomRequestOptions<riskApiPaths, PATH, METHOD>,
): CustomRequestReturn<riskApiPaths, PATH, METHOD> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useRiskRequestBase({ ...(requestOptions as any), apiType: 'risk' });
}

// FIXME: identify a way to do this without a cast
const useRiskLazyRequestBase = useLazyRequest as <
    PATH extends keyof riskApiPaths,
    CONTEXT = unknown,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<riskApiPaths, PATH, METHOD, CONTEXT> & { apiType: 'risk' }
) => CustomLazyRequestReturn<riskApiPaths, PATH, METHOD, CONTEXT>;

function useRiskLazyRequest<
    PATH extends keyof riskApiPaths,
    CONTEXT = unknown,
    METHOD extends VALID_METHOD | undefined = 'GET',
>(
    requestOptions: CustomLazyRequestOptions<riskApiPaths, PATH, METHOD, CONTEXT>,
): CustomLazyRequestReturn<riskApiPaths, PATH, METHOD, CONTEXT> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useRiskLazyRequestBase({ ...(requestOptions as any), apiType: 'risk' });
}

const useExternalRequest = useRequest as <RESPONSE>(
    requestOptions: ExternalRequestOptions<RESPONSE>,
) => ExternalRequestReturn<RESPONSE>;

export {
    RequestContext,
    useExternalRequest,
    useGoLazyRequest as useLazyRequest,
    useGoRequest,
    useRiskLazyRequest,
    useRiskRequest,
    useTranslationLazyRequest,
};
