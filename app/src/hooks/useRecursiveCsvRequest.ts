import {
    useCallback,
    useRef,
    useState,
} from 'react';
import { type Language } from '@ifrc-go/ui/contexts';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import Papa from 'papaparse';

import {
    api,
    riskApi,
} from '#config';
import { type UserAuth } from '#contexts/user';
import {
    KEY_LANGUAGE_STORAGE,
    KEY_USER_STORAGE,
} from '#utils/constants';
import { getFromStorage } from '#utils/localStorage';
import { resolveUrl } from '#utils/resolveUrl';

type Maybe<T> = T | null | undefined;

interface UrlParams {
    [key: string]: Maybe<string | number | boolean | (string | number | boolean)[]>;
}

function prepareUrlParams(params: UrlParams): string {
    const finalParams: UrlParams = {
        ...params,
        format: 'csv',
    };
    return Object.keys(finalParams)
        .filter((k) => isDefined(finalParams[k]))
        .map((k) => {
            const param = finalParams[k];
            if (isNotDefined(param)) {
                return undefined;
            }
            let val: string;
            if (Array.isArray(param)) {
                val = param.join(',');
            } else if (typeof param === 'number' || typeof param === 'boolean') {
                val = String(param);
            } else {
                val = param;
            }
            return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`;
        })
        .filter(isDefined)
        .join('&');
}

const prepareUrl = (url: string, apiType = 'go') => {
    if (isFalsyString(url)) {
        return '';
    }

    // external URL
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return resolveUrl(
        apiType === 'risk' ? riskApi : api,
        url,
    );
};

const PAGE_SIZE = 100;

async function wait(time: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), time);
    });
}

async function fetchData(url: string, urlParams: UrlParams) {
    const finalUrl = `${prepareUrl(url)}?${prepareUrlParams(urlParams)}`;
    const currentLanguage = getFromStorage<Language>(KEY_LANGUAGE_STORAGE) ?? 'en';
    const user = getFromStorage<UserAuth | undefined>(KEY_USER_STORAGE);
    const token = user?.token;

    const response = await fetch(
        finalUrl,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                Authorization: token ? `Token ${token}` : '',
                'Accept-Language': currentLanguage ?? 'en',
            },
        },
    );
    const finalText = await response.text();

    return {
        data: finalText,
        status: response.status,
    };
}

async function fetchRecursive({
    url,
    urlParams,
    onPartialSuccess,
    onSuccess,
    offset,
    pageLimit,
    onFailure,
    totalCount,
    noOfRetries = 0,
} : {
    url: string,
    urlParams: UrlParams,
    onPartialSuccess: (data: string) => void,
    onSuccess: () => void,
    offset: number,
    pageLimit: number,
    onFailure: (error: unknown) => void,
    totalCount: number,
    noOfRetries?: number,
}) {
    let response;

    try {
        response = await fetchData(
            url,
            {
                ...urlParams,
                offset,
                limit: pageLimit,
            },
        );
    } catch {
        onFailure('Failed to fetch data');
        return;
    }

    if (response.status >= 200 && response.status <= 299) {
        onPartialSuccess(response.data);

        const newOffset = offset + pageLimit;

        if (newOffset < totalCount) {
            await wait((noOfRetries ** 2) * 500 + Math.random() * 200);
            await fetchRecursive({
                url,
                urlParams,
                onPartialSuccess,
                offset: newOffset,
                pageLimit,
                onSuccess,
                onFailure,
                totalCount,
                noOfRetries: Math.max(0, noOfRetries - 1),
            });
        } else {
            onSuccess();
        }
    } else if (response.status === 429) {
        await wait((noOfRetries ** 2) * 1000 + Math.random() * 1000);
        await fetchRecursive({
            url,
            urlParams,
            onPartialSuccess,
            offset,
            pageLimit,
            onSuccess,
            onFailure,
            totalCount,
            noOfRetries: noOfRetries + 1,
        });
    } else {
        onFailure(response?.data);
    }
}

function useRecursiveCSVRequest<D>({
    onFailure,
    onSuccess,
    disableProgress,
} : {
    onFailure: (error: unknown) => void;
    onSuccess: (data: D[], total: number) => void;
    disableProgress?: boolean,
}) {
    const [pending, setPending] = useState(false);
    const [progress, setProgress] = useState(0);

    const dataRef = useRef<D[]>([]);
    const totalRef = useRef(0);

    const handleFailure = useCallback((error: unknown) => {
        dataRef.current = [];
        totalRef.current = 0;

        setPending(false);
        setProgress(0);

        onFailure(error);
    }, [onFailure]);

    const handleSuccess = useCallback(() => {
        const data = dataRef.current;
        const total = totalRef.current;

        dataRef.current = [];
        totalRef.current = 0;

        setPending(false);
        setProgress(0);

        if (total !== data.length - 1 && !disableProgress) {
            // eslint-disable-next-line no-console
            console.error(`Length mismatch. Expected ${total} but got ${data.length - 1}`);
            onFailure(undefined);
        } else {
            onSuccess(data, total);
        }
    }, [onSuccess, onFailure, setPending, setProgress, disableProgress]);

    const handlePartialSuccess = useCallback((newResponse: string) => {
        Papa.parse(
            newResponse,
            {
                skipEmptyLines: true,
                complete: (test: { data: D[] }) => {
                    const items = [...test.data];

                    // NOTE: meaning this is not the first request
                    if (dataRef.current.length > 0) {
                        // NOTE: remove the headers
                        items.shift();
                    }

                    dataRef.current = [
                        ...dataRef.current,
                        ...items,
                    ];

                    if (totalRef.current === 0 || dataRef.current.length === 0) {
                        setProgress(0);
                    } else if (disableProgress) {
                        setProgress(0);
                    } else {
                        // NOTE: we are negating one because we have a header as well
                        setProgress((dataRef.current.length - 1) / totalRef.current);
                    }
                },
            },
        );
    }, [disableProgress]);

    const trigger = useCallback((url: string, total: number, newUrlParams: UrlParams) => {
        dataRef.current = [];
        totalRef.current = total;

        setPending(true);
        setProgress(0);

        fetchRecursive({
            url,
            urlParams: newUrlParams,
            offset: 0,
            pageLimit: PAGE_SIZE,
            onPartialSuccess: handlePartialSuccess,
            onSuccess: handleSuccess,
            onFailure: handleFailure,
            totalCount: total,
        });
    }, [
        handleSuccess,
        handlePartialSuccess,
        handleFailure,
    ]);

    return [pending, progress, trigger] as const;
}

export default useRecursiveCSVRequest;
