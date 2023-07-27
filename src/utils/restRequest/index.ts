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

type GoApiGetOption<PATH extends keyof goApiPaths, OMISSION extends 'response' = never> = {
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
            query?: Query,
            pathVariables?: Path,
            response: Response,
        }, OMISSION>
        : never
}[PATH]
type GoApiPutOptions<PATH extends keyof goApiPaths, OMISSION extends 'response' = never> = {
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
}[PATH]
type GoApiPatchOptions<PATH extends keyof goApiPaths, OMISSION extends 'response' = never> = {
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
}[PATH]
type GoApiPostOptions<PATH extends keyof goApiPaths, OMISSION extends 'response' = never> = {
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
}[PATH]
type GoApiDeleteOptions<PATH extends keyof goApiPaths> = {
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
}[PATH]

type RiskApiGetOption<PATH extends keyof riskApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof riskApiPaths]: riskApiPaths[key] extends {
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
            query?: Query,
            pathVariables?: Path,
            response: Response,
        }, OMISSION>
        : never
}[PATH]
type RiskApiPutOptions<PATH extends keyof riskApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof riskApiPaths]: riskApiPaths[key] extends {
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
}[PATH]
type RiskApiPatchOptions<PATH extends keyof riskApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof riskApiPaths]: riskApiPaths[key] extends {
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
}[PATH]
type RiskApiPostOptions<PATH extends keyof riskApiPaths, OMISSION extends 'response' = never> = {
    [key in keyof riskApiPaths]: riskApiPaths[key] extends {
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
}[PATH]
type RiskApiDeleteOptions<PATH extends keyof riskApiPaths> = {
    [key in keyof riskApiPaths]: riskApiPaths[key] extends {
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
}[PATH]

type GoApiRequestOptionsBase<URL, METHOD, API_TYPE> = Omit<RequestOptions<any, TransformedError, AdditionalOptions>, 'url' | 'method'> & {
    url: URL,
    method?: METHOD,
    apiType: API_TYPE,
}

type RiskApiRequestOptionsBase<URL, METHOD, API_TYPE> = Omit<RequestOptions<any, TransformedError, AdditionalOptions>, 'url' | 'method'> & {
    url: URL,
    method?: METHOD,
    apiType: API_TYPE,
}

interface UseRequestReturnTypeBase<RESPONSE> {
    response: RESPONSE | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
}

type GoRequestOptions<
    PATH extends keyof goApiPaths | keyof riskApiPaths,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    API_TYPE extends 'default' | 'risk' = 'default',
    OMISSION extends 'response' = never,
> = (
    API_TYPE extends 'risk'
        ? PATH extends keyof riskApiPaths
            ? METHOD extends 'GET' | undefined
                ? RiskApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                    & RiskApiGetOption<PATH, OMISSION>
                : METHOD extends 'PUT'
                    ? RiskApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                        & RiskApiPutOptions<PATH, OMISSION>
                    : METHOD extends 'PATCH'
                        ? RiskApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                            & RiskApiPatchOptions<PATH, OMISSION>
                        : METHOD extends 'POST'
                            ? RiskApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                                & RiskApiPostOptions<PATH, OMISSION>
                            : METHOD extends 'DELETE'
                                ? RiskApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                                    & RiskApiDeleteOptions<PATH>
                                : never
            : never
        : PATH extends keyof goApiPaths
            ? METHOD extends 'GET' | undefined
                ? GoApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                    & GoApiGetOption<PATH, OMISSION>
                : METHOD extends 'PUT'
                    ? GoApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                        & GoApiPutOptions<PATH, OMISSION>
                    : METHOD extends 'PATCH'
                        ? GoApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                            & GoApiPatchOptions<PATH, OMISSION>
                        : METHOD extends 'POST'
                            ? GoApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                                & GoApiPostOptions<PATH, OMISSION>
                            : METHOD extends 'DELETE'
                                ? GoApiRequestOptionsBase<PATH, METHOD, API_TYPE>
                                    & GoApiDeleteOptions<PATH>
                                : never
        : never
);
type GoRequestReturn<
    PATH extends keyof goApiPaths | keyof riskApiPaths,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    API_TYPE extends 'risk' | 'default' = 'default',
> = (
    API_TYPE extends 'risk'
        ? PATH extends keyof riskApiPaths
            ? METHOD extends 'GET' | undefined
                ? UseRequestReturnTypeBase<RiskApiGetOption<PATH>['response']>
                : METHOD extends 'PUT'
                    ? UseRequestReturnTypeBase<RiskApiPutOptions<PATH>['response']>
                    : METHOD extends 'PATCH'
                        ? UseRequestReturnTypeBase<RiskApiPatchOptions<PATH>['response']>
                        : METHOD extends 'POST'
                            ? UseRequestReturnTypeBase<RiskApiPostOptions<PATH>['response']>
                            : METHOD extends 'DELETE'
                                ? UseRequestReturnTypeBase<undefined>
                                : never
            : never
        : PATH extends keyof goApiPaths
            ? METHOD extends 'GET' | undefined
                ? UseRequestReturnTypeBase<GoApiGetOption<PATH>['response']>
                : METHOD extends 'PUT'
                    ? UseRequestReturnTypeBase<GoApiPutOptions<PATH>['response']>
                    : METHOD extends 'PATCH'
                        ? UseRequestReturnTypeBase<GoApiPatchOptions<PATH>['response']>
                        : METHOD extends 'POST'
                            ? UseRequestReturnTypeBase<GoApiPostOptions<PATH>['response']>
                            : METHOD extends 'DELETE'
                                ? UseRequestReturnTypeBase<undefined>
                                : never
            : never
);

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

const useGoRequest: <
    PATH extends keyof goApiPaths | keyof riskApiPaths,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    API_TYPE extends 'risk' | 'default' = 'default',
>(
    requestOptions: GoRequestOptions<PATH, METHOD, API_TYPE, 'response'>
) => GoRequestReturn<PATH, METHOD, API_TYPE> = useRequest;

export {
    RequestContext,
    useGoRequest as useRequest,
    useGoLazyRequest as useLazyRequest,
};
