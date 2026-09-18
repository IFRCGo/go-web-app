import {
    useEffect,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import Papa from 'papaparse';

type CsvRow = Record<string, string>;

const cache = new Map<string, Promise<CsvRow[]>>();

function fetchCsv(url: string) {
    const cached = cache.get(url);
    if (cached) {
        return cached;
    }
    const request = new Promise<CsvRow[]>((resolve, reject) => {
        Papa.parse<CsvRow>(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: reject,
        });
    });
    cache.set(url, request);
    return request;
}

interface LoadedCsv {
    url: string;
    rows?: CsvRow[];
    errored?: boolean;
}

function useCsvRows(url: string | undefined) {
    const [loaded, setLoaded] = useState<LoadedCsv>();

    useEffect(
        () => {
            if (isNotDefined(url)) {
                return undefined;
            }
            let cancelled = false;
            fetchCsv(url)
                .then((rows) => {
                    if (!cancelled) {
                        setLoaded({ url, rows });
                    }
                })
                .catch(() => {
                    // Drop the failed promise so the next mount retries
                    cache.delete(url);
                    if (!cancelled) {
                        setLoaded({ url, errored: true });
                    }
                });
            return () => {
                cancelled = true;
            };
        },
        [url],
    );

    const isCurrent = isDefined(url) && loaded?.url === url;

    return {
        rows: isCurrent ? loaded.rows : undefined,
        errored: isCurrent && loaded.errored === true,
        pending: isDefined(url) && !isCurrent,
    };
}

export default useCsvRows;
