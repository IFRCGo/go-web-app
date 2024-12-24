import { type DeepNevaRemove } from '@ifrc-go/ui/utils';
import {
    type LazyRequestOptions,
    type RequestOptions,
    type useLazyRequest,
    type useRequest,
} from '@togglecorp/toggle-request';

import {
    type AdditionalOptions,
    type TransformedError,
} from './go';

export type VALID_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Helper Type Resolvers

export type ApiResponse<SCHEME, URL extends keyof SCHEME, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET'> = (
    METHOD extends 'GET'
    ? SCHEME[URL] extends { get: { responses: { 200: { content: { 'application/json': infer Res } } } } }
        ? DeepNevaRemove<Res>
        : never
    : METHOD extends 'POST'
        ? SCHEME[URL] extends { post: { responses: { 201: { content: { 'application/json': infer Res } } } } }
            ? DeepNevaRemove<Res>
            : never
        : METHOD extends 'PATCH'
            ? SCHEME[URL] extends { patch: { responses: { 200: { content: { 'application/json': infer Res } } } } }
                ? DeepNevaRemove<Res>
                : never
            : METHOD extends 'PUT'
                ? SCHEME[URL] extends { put: { responses: { 200: { content: { 'application/json': infer Res } } } } }
                    ? DeepNevaRemove<Res>
                    : never
                : never
)

export type ApiUrlQuery<SCHEME, URL extends keyof SCHEME, METHOD extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'> = (
    METHOD extends 'GET'
    ? SCHEME[URL] extends { get: { parameters: { query?: infer Query } } }
        ? Query
        : never
    : METHOD extends 'POST'
        ? SCHEME[URL] extends { post: { parameters: { query?: infer Query } } }
            ? Query
            : never
        : METHOD extends 'PATCH'
            ? SCHEME[URL] extends { patch: { parameters: { query?: infer Query } } }
                ? Query
                : never
            : METHOD extends 'PUT'
                ? SCHEME[URL] extends { put: { parameters: { query?: infer Query } } }
                    ? Query
                    : never
                : METHOD extends 'DELETE'
                    ? SCHEME[URL] extends { delete: { parameters: { query?: infer Query } } }
                        ? Query
                        : never
                    : never
);

export type ApiBody<SCHEME, URL extends keyof SCHEME, METHOD extends 'POST' | 'PUT' | 'PATCH'> = (
    METHOD extends 'POST'
        ? SCHEME[URL] extends { post: { requestBody?: { content: { 'application/json': infer Res } } } }
            ? DeepNevaRemove<Res>
            : never
        : METHOD extends 'PATCH'
            ? SCHEME[URL] extends { patch: { requestBody?: { content: { 'application/json': infer Res } } } }
                ? DeepNevaRemove<Res>
                : never
            : METHOD extends 'PUT'
                ? SCHEME[URL] extends { put: { requestBody?: { content: { 'application/json': infer Res } } } }
                    ? DeepNevaRemove<Res>
                    : never
                : never
)
// Type Resolvers

// NOTE: If the method is POST, the server generates typings for 201
// Also, adding a fallback so that we still support 200
type ResolveResponseContent<RESPONSES, METHOD> = (
    METHOD extends 'POST'
        ? RESPONSES extends { 201 : { content: { 'application/json': infer Response } } }
            ? DeepNevaRemove<Response>
            : ResolveResponseContent<RESPONSES, undefined>
        : RESPONSES extends { 200 : { content: { 'application/json': infer Response } } }
            ? DeepNevaRemove<Response>
            : unknown
);

type ResolvePath<PARAMETERS> = (
    PARAMETERS extends { path: infer Path }
        ? Path
        : unknown
);

type ResolveQuery<PARAMETERS> = (
    PARAMETERS extends { query?: infer Query }
        ? Query
        : unknown
);

type ResolveRequestBody<REQUEST_BODY> = (
    REQUEST_BODY extends { content: { 'application/json': infer RequestBody } }
        ? DeepNevaRemove<RequestBody>
        : unknown
);

type GetResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { get: { responses: infer Responses } }
        ? ResolveResponseContent<Responses, 'GET'>
        : unknown
);
type PutResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { put: { responses: infer Responses } }
        ? ResolveResponseContent<Responses, 'PUT'>
        : unknown
);
type PostResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { post: { responses: infer Responses } }
        ? ResolveResponseContent<Responses, 'POST'>
        : unknown
);
type PatchResponse<SCHEMA, PATH extends keyof SCHEMA> = (
    SCHEMA[PATH] extends { patch: { responses: infer Responses } }
        ? ResolveResponseContent<Responses, 'PATCH'>
        : unknown
);

// Options

type CommonOptions<METHOD, PARAMETERS, RESPONSES, CONTEXT> = {
    pathVariables?: ResolvePath<PARAMETERS>
        | ((context: CONTEXT) => ResolvePath<PARAMETERS> | undefined),

    // query?: ResolveQuery<PARAMETERS>,
    mockResponse?: ResolveResponseContent<RESPONSES, METHOD>,
    shouldRetry?: (
        // eslint-disable-next-line max-len
        val: { errored: true, value: TransformedError } | { errored: false, value: ResolveResponseContent<RESPONSES, METHOD> },
        run: number,
        context: CONTEXT,
    ) => number;
    shouldPoll?: (
        // eslint-disable-next-line max-len
        val: { errored: true, value: TransformedError } | { errored: false, value: ResolveResponseContent<RESPONSES, METHOD> },
        context: CONTEXT
    ) => number;
    onSuccess?: (val: ResolveResponseContent<RESPONSES, METHOD>, context: CONTEXT) => void;

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
        // FIXME: This should only be for lazy
        query?: ResolveQuery<Parameters>
            | ((context: CONTEXT) => ResolveQuery<Parameters> | undefined),
    } & CommonOptions<'GET', Parameters, Responses, CONTEXT>) : unknown
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
        body: ResolveRequestBody<RequestBody>
            | ((context: CONTEXT) => ResolveRequestBody<RequestBody>),
        other?: Omit<RequestInit, 'body'>
            | ((context: CONTEXT) => Omit<RequestInit, 'body'> | undefined),
        query?: ResolveQuery<Parameters>
            | ((context: CONTEXT) => ResolveQuery<Parameters> | undefined),
    } & CommonOptions<'PUT', Parameters, Responses, CONTEXT>) : unknown
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
        body: ResolveRequestBody<RequestBody>
            | ((context: CONTEXT) => ResolveRequestBody<RequestBody>),
        other?: Omit<RequestInit, 'body'>
            | ((context: CONTEXT) => Omit<RequestInit, 'body'> | undefined),
        query?: ResolveQuery<Parameters>
            | ((context: CONTEXT) => ResolveQuery<Parameters> | undefined),
    } & CommonOptions<'PATCH', Parameters, Responses, CONTEXT>) : unknown
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
        body: ResolveRequestBody<RequestBody>
            | ((context: CONTEXT) => ResolveRequestBody<RequestBody>),
        other?: Omit<RequestInit, 'body'>
            | ((context: CONTEXT) => Omit<RequestInit, 'body'> | undefined),
        query?: ResolveQuery<Parameters>
            | ((context: CONTEXT) => ResolveQuery<Parameters> | undefined),
    } & CommonOptions<'POST', Parameters, Responses, CONTEXT>) : unknown
);

type DeleteOptions<SCHEMA, PATH extends keyof SCHEMA, CONTEXT = never> = (
    SCHEMA[PATH] extends {
        delete: {
            parameters: infer Parameters,
            responses: infer Responses,
        }
    } ? ({
        url: PATH,
        method: 'DELETE'
    } & CommonOptions<'DELETE', Parameters, Responses, CONTEXT>) : unknown
);

type OptionOmissions = (
    /* manually */
    'url'
    | 'method'

    /* common options */
    | 'query'
    | 'mockResponse'
    | 'shouldRetry'
    | 'shouldPoll'
    | 'onSuccess'
    | 'onFailure'

    /* xxx options */
    | 'body'
    | 'other'
    | 'pathVariables'
);

type RequestOptionsBase<PATH, METHOD> = {
    url: PATH,
    method?: METHOD,
} & Omit<
    RequestOptions<unknown, TransformedError, AdditionalOptions>,
    OptionOmissions
>;

type LazyRequestOptionsBase<PATH, METHOD, CONTEXT> = {
    url: PATH,
    method?: METHOD,
} & Omit<
    LazyRequestOptions<unknown, TransformedError, CONTEXT, AdditionalOptions>,
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
    AdditionalOptions
>>;

type LazyRequestReturn<RESPONSE, CONTEXT> = ReturnType<typeof useLazyRequest<
    RESPONSE,
    TransformedError,
    AdditionalOptions,
    CONTEXT
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
