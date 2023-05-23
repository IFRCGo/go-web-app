import {
    useMemo, useCallback, useState, useEffect, useRef,
} from 'react';

import { TransformedError } from './go';
import { useRequest } from './index';

const PAGE_SIZE = 500;

// FIXME: let's move this to hooks

type ListResponse<T> = {
  count: number;
  results: T[];
  next?: string;
};

function useRecursiveRequest<D>({
    url,
    urlOptions,
    onFailure,
} : {
  url: string;
  urlOptions?: Record<string, unknown>;
  onFailure: (error: TransformedError) => void,
}) {
    const [pending, setPending] = useState(false);
    const [data, setData] = useState<D[]>([]);
    const [skipRequest, setSkipRequest] = useState(true);
    const [offset, setOffset] = useState(0);

    const query = useMemo(() => ({
        offset,
        limit: PAGE_SIZE,
        ...(urlOptions ?? {}),
    }), [offset, urlOptions]);

    const totalRef = useRef(0);
    const requestCountRef = useRef(1);

    const {
        response: currentResponse,
        retrigger: triggerRequestForCount,
    } = useRequest<ListResponse<D>>({
        url,
        skip: skipRequest,
        query,
        onSuccess: (response) => {
            totalRef.current = response.count;
            setSkipRequest(false);
        },
        onFailure: (error) => {
            // NOTE: Clear all values
            setData([]);
            requestCountRef.current = 0;
            setPending(false);
            setSkipRequest(true);
            setOffset(0);
            onFailure(error);
        },
    });

    useEffect(() => {
        if (!currentResponse) {
            return;
        }
        const currentOffset = requestCountRef.current * PAGE_SIZE;

        if (currentOffset <= totalRef.current) {
            // NOTE: New data is requested if offset is still less than total
            setOffset(currentOffset);
        } else {
            // NOTE: Reset pending, and query options after requests are done
            setPending(false);
            setSkipRequest(true);
            setOffset(0);
            requestCountRef.current = 0;
        }

        setData((prevData) => [...prevData, ...currentResponse.results]);

        requestCountRef.current += 1;
    }, [currentResponse]);

    const trigger = useCallback(() => {
    // NOTE: Clearing data during trigger as data and total are preserved outputs
        setData([]);
        totalRef.current = 0;
        triggerRequestForCount();
        setPending(true);
        setSkipRequest(false);
    }, [triggerRequestForCount]);

    return [pending, data, totalRef.current, trigger] as const;
}

export default useRecursiveRequest;
