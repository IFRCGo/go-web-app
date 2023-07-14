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

export type ListResponse<T> = {
  count: number;
  results: T[];
  next?: string;
};

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

type GoRequestOptions<RESPONSE, ERROR, ADDITIONAL_OPTIONS> = Omit<RequestOptions<RESPONSE, ERROR, ADDITIONAL_OPTIONS>, 'url'> & {
    pathVariables?: Record<string, number | string | undefined>;
} & ({
    apiType?: 'go';
    url: keyof goApiPaths;
} | {
    apiType: 'risk';
    url: keyof riskApiPaths;
})

const useGoRequest: <RESPONSE>(
    requestOptions: GoRequestOptions<RESPONSE, TransformedError, AdditionalOptions>
) => {
    response: RESPONSE | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
} = useRequest;

export {
    RequestContext,
    useGoRequest as useRequest,
    useGoLazyRequest as useLazyRequest,
};
