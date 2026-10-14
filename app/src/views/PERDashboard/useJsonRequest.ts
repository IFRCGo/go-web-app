import {
    useEffect,
    useState,
} from 'react';

interface JsonRequestState<T> {
    pending: boolean;
    response: T | undefined;
    error: boolean;
}

function useJsonRequest<T>(url: string): JsonRequestState<T> {
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

export default useJsonRequest;
