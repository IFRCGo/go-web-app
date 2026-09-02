import {
    useEffect,
    useState,
} from 'react';

export const STATIC_REVIEW_MODE = import.meta.env.APP_PER_DASHBOARD_STATIC_MODE === 'true';

export type SnapshotFile =
    | 'per-map-data.json'
    | 'per-dashboard-data.json'
    | 'snapshot.json';

interface JsonRequestState<T> {
    pending: boolean;
    response: T | undefined;
    error: boolean;
}

function getBaseUrl(): URL {
    return new URL(import.meta.env.BASE_URL, window.location.origin);
}

export function getSnapshotUrl(fileName: SnapshotFile): string {
    return new URL(`data/${fileName}`, getBaseUrl()).toString();
}

export function useJsonRequest<T>(url: string): JsonRequestState<T> {
    const [state, setState] = useState<JsonRequestState<T>>({
        pending: true,
        response: undefined,
        error: false,
    });

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        const timeoutId = window.setTimeout(() => controller.abort(), 60_000);

        async function loadJson() {
            setState({
                pending: true,
                response: undefined,
                error: false,
            });

            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Request returned ${response.status}`);
                }

                const value = await response.json() as T;
                if (active) {
                    setState({
                        pending: false,
                        response: value,
                        error: false,
                    });
                }
            } catch {
                if (active) {
                    setState({
                        pending: false,
                        response: undefined,
                        error: true,
                    });
                }
            } finally {
                window.clearTimeout(timeoutId);
            }
        }

        loadJson();

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [url]);

    return state;
}
