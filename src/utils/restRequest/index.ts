import {
  RequestContext,
  useRequest,
  useLazyRequest,
  RequestOptions,
  LazyRequestOptions,
} from '@togglecorp/toggle-request';

import {
  TransformedError,
  AdditionalOptions,
} from './go';

export type ListResponse<T> = {
  count: number;
  results: T[];
  next?: string;
};

// eslint-disable-next-line max-len
const useGoLazyRequest: <R, C = unknown>(requestOptions: LazyRequestOptions<R, TransformedError, C, AdditionalOptions>) => {
    response: R | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    trigger: (ctx: C) => void;
    context: C | undefined,
} = useLazyRequest;

const useGoRequest: <R>(requestOptions: RequestOptions<R, TransformedError, AdditionalOptions>) => {
    response: R | undefined;
    pending: boolean;
    error: TransformedError | undefined;
    retrigger: () => void;
} = useRequest;

export {
  RequestContext,
  useGoRequest as useRequest,
  useGoLazyRequest as useLazyRequest,
};
