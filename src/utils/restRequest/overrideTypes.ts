import {
    RequestOptions,
    UrlParams,
    LazyRequestOptions,
} from '@togglecorp/toggle-request';

import {
    TransformedError,
    AdditionalOptions,
} from './go';

type ResolveRes<T> = T extends {
    200 : {
        content: {
            'application/json': infer Res
        }
    }
} ? Res : unknown;

type ResolveBody<T> = T extends {
    content: {
        'application/json': infer Body,
    },
} ? Body : unknown;

type Callable<C, R> = R | ((value: C) => R);

type GetOption<SCHEMA, PATH extends keyof SCHEMA, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        get: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
        },
    }
        ? Omit<{
            url: PATH,
            query?: NonNullable<SCHEMA[PATH]['get']['parameters']>['query'],
            method?: 'GET',

            pathVariables?: NonNullable<SCHEMA[PATH]['get']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: any) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: any) => number;
            onSuccess?: (val: ResolveRes<Res>, context: any) => void;
            onFailure?: (val: TransformedError, context: any) => void;
        }, OMISSION>
        : never
);
type PutOptions<SCHEMA, PATH extends keyof SCHEMA, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        put: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
            requestBody?: infer Body,
        },
    }
        ? Omit<{
            url: PATH,
            query?: NonNullable<SCHEMA[PATH]['put']['parameters']>['query'],
            method: 'PUT',
            body: ResolveBody<Body>,
            other?: Omit<RequestInit, 'body'> | undefined,

            pathVariables?: NonNullable<SCHEMA[PATH]['put']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: any) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: any) => number;
            onSuccess?: (val: ResolveRes<Res>, context: any) => void;
            onFailure?: (val: TransformedError, context: any) => void;
        }, OMISSION>
        : never
);
type PatchOptions<SCHEMA, PATH extends keyof SCHEMA, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        patch: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
            requestBody?: infer Body,
        },
    }
        ? Omit<{
            url: PATH,
            query?: NonNullable<SCHEMA[PATH]['patch']['parameters']>['query'],
            method: 'PATCH',
            body: ResolveBody<Body>,
            other?: Omit<RequestInit, 'body'> | undefined,

            pathVariables?: NonNullable<SCHEMA[PATH]['patch']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: any) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: any) => number;
            onSuccess?: (val: ResolveRes<Res>, context: any) => void;
            onFailure?: (val: TransformedError, context: any) => void;
        }, OMISSION>
        : never
);
type PostOptions<SCHEMA, PATH extends keyof SCHEMA, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        post: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
            requestBody?: infer Body,
        },
    }
        ? Omit<{
            url: PATH,
            query?: NonNullable<SCHEMA[PATH]['post']['parameters']>['query'],
            method: 'POST'
            body: ResolveBody<Body>,
            other?: Omit<RequestInit, 'body'> | undefined,

            pathVariables?: NonNullable<SCHEMA[PATH]['post']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: any) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: any) => number;
            onSuccess?: (val: ResolveRes<Res>, context: any) => void;
            onFailure?: (val: TransformedError, context: any) => void;
        }, OMISSION>
        : never
);
type DeleteOptions<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends {
        delete: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
        }
    }
        ? {
            url: PATH,
            method: 'DELETE'
            query?: NonNullable<SCHEMA[PATH]['delete']['parameters']>['query'],

            pathVariables?: NonNullable<SCHEMA[PATH]['delete']['parameters']>['path'],
            mockResponse?: any,
            shouldRetry?: (val: any, run: number, context: any) => number;
            shouldPoll?: (val: any, context: any) => number;
            onSuccess?: (val: any, context: any) => void;
            onFailure?: (val: TransformedError, context: any) => void;
        }
        : never
);

type LazyGetOption<SCHEMA, PATH extends keyof SCHEMA, CONTEXT, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        get: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
        },
    }
        ? Omit<{
            url: Callable<CONTEXT, PATH>,
            query?: Callable<CONTEXT, NonNullable<SCHEMA[PATH]['get']['parameters']>['query']>,
            method?: Callable<CONTEXT, 'GET'>,

            pathVariables?: NonNullable<SCHEMA[PATH]['get']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: CONTEXT) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: CONTEXT) => number;
            onSuccess?: (val: ResolveRes<Res>, context: CONTEXT) => void;
            onFailure?: (val: TransformedError, context: CONTEXT) => void;
        }, OMISSION>
        : never
);
type LazyPutOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        put: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
            requestBody?: infer Body,
        },
    }
        ? Omit<{
            url: Callable<CONTEXT, PATH>,
            query?: Callable<CONTEXT, NonNullable<SCHEMA[PATH]['put']['parameters']>['query']>,
            method: Callable<CONTEXT, 'PUT'>,
            body: Callable<CONTEXT, ResolveBody<Body>>,
            other?: Callable<CONTEXT, Omit<RequestInit, 'body'>>,

            pathVariables?: NonNullable<SCHEMA[PATH]['put']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: CONTEXT) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: CONTEXT) => number;
            onSuccess?: (val: ResolveRes<Res>, context: CONTEXT) => void;
            onFailure?: (val: TransformedError, context: CONTEXT) => void;
        }, OMISSION>
        : never
);
type LazyPatchOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        patch: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
            requestBody?: infer Body,
        },
    }
        ? Omit<{
            url: Callable<CONTEXT, PATH>,
            query?: Callable<CONTEXT, NonNullable<SCHEMA[PATH]['patch']['parameters']>['query']>,
            method: Callable<CONTEXT, 'PATCH'>,
            body: Callable<CONTEXT, ResolveBody<Body>>,
            other?: Callable<CONTEXT, Omit<RequestInit, 'body'> | undefined>,

            pathVariables?: NonNullable<SCHEMA[PATH]['patch']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: CONTEXT) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: CONTEXT) => number;
            onSuccess?: (val: ResolveRes<Res>, context: CONTEXT) => void;
            onFailure?: (val: TransformedError, context: CONTEXT) => void;
        }, OMISSION>
        : never
);
type LazyPostOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT, OMISSION extends 'response' = never> = (
    SCHEMA[PATH] extends {
        post: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
            responses: infer Res,
            requestBody?: infer Body,
        },
    }
        ? Omit<{
            url: Callable<CONTEXT, PATH>,
            query?: Callable<CONTEXT, NonNullable<SCHEMA[PATH]['post']['parameters']>['query']>,
            method: Callable<CONTEXT, 'POST'>,
            body: Callable<CONTEXT, ResolveBody<Body>>,
            other?: Callable<CONTEXT, Omit<RequestInit, 'body'> | undefined>,

            pathVariables?: NonNullable<SCHEMA[PATH]['post']['parameters']>['path'],
            mockResponse?: ResolveRes<Res>,
            response: ResolveRes<Res>,
            shouldRetry?: (val: ResolveRes<Res>, run: number, context: CONTEXT) => number;
            shouldPoll?: (val: ResolveRes<Res> | undefined, context: CONTEXT) => number;
            onSuccess?: (val: ResolveRes<Res>, context: CONTEXT) => void;
            onFailure?: (val: TransformedError, context: CONTEXT) => void;
        }, OMISSION>
        : never
);
type LazyDeleteOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT> = (
    SCHEMA[PATH] extends {
        delete: {
            parameters?: {
                query?: UrlParams,
                path?: AdditionalOptions['pathVariables'],
            },
        }
    }
        ? {
            url: Callable<CONTEXT, PATH>,
            method: Callable<CONTEXT, 'DELETE'>,
            query?: Callable<CONTEXT, NonNullable<SCHEMA[PATH]['delete']['parameters']>['query']>,

            pathVariables?: NonNullable<SCHEMA[PATH]['delete']['parameters']>['path'],
            mockResponse?: CONTEXT,
            shouldRetry?: (val: CONTEXT, run: number, context: CONTEXT) => number;
            shouldPoll?: (val: CONTEXT, context: CONTEXT) => number;
            onSuccess?: (val: CONTEXT, context: CONTEXT) => void;
            onFailure?: (val: TransformedError, context: CONTEXT) => void;
        }
        : never
);

type RequestOptionsBase<URL, METHOD> = {
    url: URL,
    method?: METHOD,
} & Omit<
    RequestOptions<unknown, TransformedError, Omit<AdditionalOptions, 'pathVariables'>>,
    'url'
    | 'query'
    | 'method'
    | 'other'
    | 'body'
    | 'mockResponse'
    | 'shouldRetry'
    | 'shouldPoll'
    | 'onSuccess'
    | 'onFailure'
>;

type LazyRequestOptionsBase<URL, METHOD, CONTEXT> = {
    url: URL,
    method?: METHOD,
} & Omit<
    LazyRequestOptions<unknown, TransformedError, CONTEXT, Omit<AdditionalOptions, 'pathVariables'>>,
    'url'
    | 'query'
    | 'method'
    | 'other'
    | 'body'
    | 'mockResponse'
    | 'shouldRetry'
    | 'shouldPoll'
    | 'onSuccess'
    | 'onFailure'
>;

interface RequestReturnBase<RESPONSE> {
    response: RESPONSE | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
}

interface LazyRequestReturnBase<RESPONSE, C> {
    response: RESPONSE | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    trigger: (ctx: C) => void;
    context: C | undefined;
}

export type CustomRequestOptions<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    OMISSION extends 'response' = never,
> = (
    METHOD extends 'GET' | undefined
        ? RequestOptionsBase<PATH, METHOD> & GetOption<SCHEMA, PATH, OMISSION>
        : METHOD extends 'PUT'
            ? RequestOptionsBase<PATH, METHOD> & PutOptions<SCHEMA, PATH, OMISSION>
            : METHOD extends 'PATCH'
                ? RequestOptionsBase<PATH, METHOD> & PatchOptions<SCHEMA, PATH, OMISSION>
                : METHOD extends 'POST'
                    ? RequestOptionsBase<PATH, METHOD> & PostOptions<SCHEMA, PATH, OMISSION>
                    : METHOD extends 'DELETE'
                        ? RequestOptionsBase<PATH, METHOD> & DeleteOptions<SCHEMA, PATH>
                        : never
);
export type CustomRequestReturn<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
> = (
    METHOD extends 'GET' | undefined
        ? RequestReturnBase<GetOption<SCHEMA, PATH >['response']>
        : METHOD extends 'PUT'
            ? RequestReturnBase<PutOptions<SCHEMA, PATH>['response']>
            : METHOD extends 'PATCH'
                ? RequestReturnBase<PatchOptions<SCHEMA, PATH>['response']>
                : METHOD extends 'POST'
                    ? RequestReturnBase<PostOptions<SCHEMA, PATH>['response']>
                    : METHOD extends 'DELETE'
                        ? RequestReturnBase<undefined>
                        : never
);

export type CustomLazyRequestOptions<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    CONTEXT,
    OMISSION extends 'response' = never,
> = (
    METHOD extends 'GET' | undefined
        ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT> & LazyGetOption<SCHEMA, PATH, CONTEXT, OMISSION>
        : METHOD extends 'PUT'
            ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT> & LazyPutOptions<SCHEMA, PATH, CONTEXT, OMISSION>
            : METHOD extends 'PATCH'
                ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT> & LazyPatchOptions<SCHEMA, PATH, CONTEXT, OMISSION>
                : METHOD extends 'POST'
                    ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT> & LazyPostOptions<SCHEMA, PATH, CONTEXT, OMISSION>
                    : METHOD extends 'DELETE'
                        ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT> & LazyDeleteOptions<SCHEMA, PATH, CONTEXT>
                        : never
);
export type CustomLazyRequestReturn<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    C,
> = (
    METHOD extends 'GET' | undefined
        ? LazyRequestReturnBase<GetOption<SCHEMA, PATH>['response'], C>
        : METHOD extends 'PUT'
            ? LazyRequestReturnBase<PutOptions<SCHEMA, PATH>['response'], C>
            : METHOD extends 'PATCH'
                ? LazyRequestReturnBase<PatchOptions<SCHEMA, PATH>['response'], C>
                : METHOD extends 'POST'
                    ? LazyRequestReturnBase<PostOptions<SCHEMA, PATH>['response'], C>
                    : METHOD extends 'DELETE'
                        ? LazyRequestReturnBase<undefined, C>
                        : never
);
