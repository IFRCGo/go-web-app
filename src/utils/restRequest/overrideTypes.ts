import {
    RequestOptions,
    LazyRequestOptions,
    useRequest,
    useLazyRequest,
} from '@togglecorp/toggle-request';

import {
    TransformedError,
    AdditionalOptions,
} from './go';

export type VALID_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Type Resolvers

type ResolveResponseContent<RESPONSES> = RESPONSES extends {
    200 : {
        content: {
            'application/json': infer Response
        }
    }
} ? Response : unknown;

type ResolveRequestBody<REQUEST_BODY> = REQUEST_BODY extends {
    content: {
        'application/json': infer RequestBody,
    },
} ? RequestBody : unknown;

type ResolvePath<PARAMETERS> = PARAMETERS extends {
    path: infer Path,
} ? Path : unknown;

type ResolveQuery<PARAMETERS> = PARAMETERS extends {
    query: infer Query,
} ? Query: unknown;

type GetResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { get: { responses: infer Responses } }
        ? ResolveResponseContent<Responses>
        : unknown
);
type PutResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { put: { responses: infer Responses } }
        ? ResolveResponseContent<Responses>
        : unknown
);
type PostResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { post: { responses: infer Responses } }
        ? ResolveResponseContent<Responses>
        : unknown
);
type PatchResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { patch: { responses: infer Responses } }
        ? ResolveResponseContent<Responses>
        : unknown
);

// Options

// FIXME: is this common between lazy and non-lazy?
type CommonOptions<PARAMETERS, RESPONSES, CONTEXT> = {
    pathVariables?: ResolvePath<PARAMETERS>,

    query?: ResolveQuery<PARAMETERS>,
    mockResponse?: ResolveResponseContent<RESPONSES>,
    shouldRetry?: (
        val: ResolveResponseContent<RESPONSES>,
        run: number,
        context: CONTEXT,
    ) => number;
    shouldPoll?: (
        val: ResolveResponseContent<RESPONSES> | undefined,
        context: CONTEXT
    ) => number;
    onSuccess?: (val: ResolveResponseContent<RESPONSES>, context: CONTEXT) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFailure?: (val: TransformedError, context: CONTEXT) => void;
}

type GetOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT = never> = (
    SCHEMA[PATH] extends {
        get: {
            parameters: infer Parameters,
            responses: infer Responses,
        },
    } ? ({
        url: PATH,
        method?: 'GET',
    } & CommonOptions<Parameters, Responses, CONTEXT>) : unknown
);

type PutOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT = never> = (
    SCHEMA[PATH] extends {
        put: {
            parameters: infer Parameters,
            responses: infer Responses,
            requestBody?: infer RequestBody,
        },
    } ? ({
        url: PATH,
        method: 'PUT',
        body: (context: CONTEXT) => ResolveRequestBody<RequestBody>,
        other?: Omit<RequestInit, 'body'> | undefined,
    } & CommonOptions<Parameters, Responses, CONTEXT>) : unknown
);

type PatchOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT = never> = (
    SCHEMA[PATH] extends {
        patch: {
            parameters: infer Parameters,
            responses: infer Responses,
            requestBody?: infer RequestBody,
        },
    } ? ({
        url: PATH,
        method: 'PATCH',
        body: (context: CONTEXT) => ResolveRequestBody<RequestBody>,
        other?: Omit<RequestInit, 'body'> | undefined,
    } & CommonOptions<Parameters, Responses, CONTEXT>) : unknown
);

type PostOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT = never> = (
    SCHEMA[PATH] extends {
        post: {
            parameters: infer Parameters,
            responses: infer Responses,
            requestBody?: infer RequestBody,
        },
    } ? ({
        url: PATH,
        method: 'POST',
        body: (context: CONTEXT) => ResolveRequestBody<RequestBody>,
        other?: Omit<RequestInit, 'body'> | undefined,
    } & CommonOptions<Parameters, Responses, CONTEXT>) : unknown
);

type DeleteOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT = never> = (
    SCHEMA[PATH] extends {
        delete: {
            get: {
                parameters: infer Parameters,
                responses: infer Responses,
            },
        }
    } ? ({
        url: PATH,
        method: 'DELETE'
    } & CommonOptions<Parameters, Responses, CONTEXT>) : unknown
);

type OptionOmissions = (
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
);

type RequestOptionsBase<PATH, METHOD> = {
    url: PATH,
    method?: METHOD,
} & Omit<
    RequestOptions<unknown, TransformedError, Omit<AdditionalOptions, 'pathVariables'>>,
    OptionOmissions
>;

type LazyRequestOptionsBase<PATH, METHOD, CONTEXT> = {
    url: PATH,
    method?: METHOD,
} & Omit<
    LazyRequestOptions<unknown, TransformedError, CONTEXT, Omit<AdditionalOptions, 'pathVariables'>>,
    OptionOmissions
>;

export type CustomRequestOptions<
    SCHEMA extends object,
    PATH extends keyof SCHEMA,
    METHOD extends VALID_METHOD | undefined,
> = (
    METHOD extends 'GET' | undefined
        ? RequestOptionsBase<PATH, METHOD> & GetOptions<SCHEMA, PATH>
        : METHOD extends 'PUT'
            ? RequestOptionsBase<PATH, METHOD> & PutOptions<SCHEMA, PATH>
            : METHOD extends 'PATCH'
                ? RequestOptionsBase<PATH, METHOD> & PatchOptions<SCHEMA, PATH>
                : METHOD extends 'POST'
                    ? RequestOptionsBase<PATH, METHOD> & PostOptions<SCHEMA, PATH, 'response'>
                    : METHOD extends 'DELETE'
                        ? RequestOptionsBase<PATH, METHOD> & DeleteOptions<SCHEMA, PATH>
                        : never
);

export type CustomLazyRequestOptions<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    CONTEXT,
> = (
    METHOD extends 'GET' | undefined
        ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT>
            & GetOptions<SCHEMA, PATH, CONTEXT>
        : METHOD extends 'PUT'
            ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT>
                & PutOptions<SCHEMA, PATH, CONTEXT>
            : METHOD extends 'PATCH'
                ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT>
                    & PatchOptions<SCHEMA, PATH, CONTEXT>
                : METHOD extends 'POST'
                    ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT>
                        & PostOptions<SCHEMA, PATH, CONTEXT>
                    : METHOD extends 'DELETE'
                        ? LazyRequestOptionsBase<PATH, METHOD, CONTEXT>
                            & DeleteOptions<SCHEMA, PATH, CONTEXT>
                        : never
);

// Return

type RequestReturn<RESPONSE> = ReturnType<typeof useRequest<
    RESPONSE,
    TransformedError,
    unknown
>>;

type LazyRequestReturn<RESPONSE, CONTEXT> = ReturnType<typeof useLazyRequest<
    RESPONSE,
    TransformedError,
    CONTEXT,
    unknown
>>;

export type CustomRequestReturn<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends VALID_METHOD | undefined,
> = (
    METHOD extends 'GET' | undefined
        ? RequestReturn<GetResponse<SCHEMA, PATH>>
        : METHOD extends 'PUT'
            ? RequestReturn<PutResponse<SCHEMA, PATH>>
            : METHOD extends 'PATCH'
                ? RequestReturn<PatchResponse<SCHEMA, PATH>>
                : METHOD extends 'POST'
                    ? RequestReturn<PostResponse<SCHEMA, PATH>>
                    : METHOD extends 'DELETE'
                        ? RequestReturn<undefined>
                        : never
);

export type CustomLazyRequestReturn<
    SCHEMA,
    PATH extends keyof SCHEMA,
    METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
    CONTEXT,
> = (
    METHOD extends 'GET' | undefined
        ? LazyRequestReturn<GetResponse<SCHEMA, PATH>, CONTEXT>
        : METHOD extends 'PUT'
            ? LazyRequestReturn<PutResponse<SCHEMA, PATH>, CONTEXT>
            : METHOD extends 'PATCH'
                ? LazyRequestReturn<PatchResponse<SCHEMA, PATH>, CONTEXT>
                : METHOD extends 'POST'
                    ? LazyRequestReturn<PostResponse<SCHEMA, PATH>, CONTEXT>
                    : METHOD extends 'DELETE'
                        ? LazyRequestReturn<undefined, CONTEXT>
                        : never
);
