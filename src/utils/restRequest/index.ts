import {
    RequestContext,
    useRequest,
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

type GoApiResponseWithContent = {
    'responses': {
        '200': {
            'content': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                'application/json': any;
            }
        }
    }
}

type GoApiUrlQueryWithContent = {
    'parameters': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'query': any;
    }
}

type GoApiUrlPathVariablesWithContent = {
    'parameters': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'path': any;
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

type GoApiUrlPaths = keyof goApiPaths;
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

function useGoRequest<URL extends RiskApiUrlPaths>(
    requestOptions: { apiType: 'risk' } & RiskRequestOptions<URL>
): RiskApiRequestReturnType<URL>
function useGoRequest<URL extends GoApiUrlPaths>(
    requestOptions: { apiType?: never } & GoRequestOptions<URL>
): GoApiRequestReturnType<URL>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useGoRequest(requestOptions: any): unknown {
    return useRequest(requestOptions);
}

// const useGoRequest: GoApiRequest & RiskApiRequest = useRequest;

export {
    RequestContext,
    useGoRequest as useRequest,
    useGoLazyRequest as useLazyRequest,
};
