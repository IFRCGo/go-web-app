import {
    useEffect,
    useState,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import {
    type CogInfo,
    loadCog,
} from './cog';

// Header and overview reads are shared through a cache, so the map layer
// and the legend can both call this for the same file
function useCogInfo(url: string | undefined) {
    const [cog, setCog] = useState<CogInfo | undefined>();
    const [errored, setErrored] = useState(false);

    useEffect(
        () => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCog(undefined);
            setErrored(false);
            if (isNotDefined(url)) {
                return undefined;
            }
            let cancelled = false;
            loadCog(url).then(
                (info) => {
                    if (!cancelled) {
                        setCog(info);
                    }
                },
                (error: unknown) => {
                    if (!cancelled) {
                        // eslint-disable-next-line no-console
                        console.warn(`Could not read raster ${url}`, error);
                        setErrored(true);
                    }
                },
            );
            return () => {
                cancelled = true;
            };
        },
        [url],
    );

    return {
        cog,
        pending: isNotDefined(url) ? false : (isNotDefined(cog) && !errored),
        errored,
    };
}

export default useCogInfo;
