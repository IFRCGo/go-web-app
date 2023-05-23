import { useState, useEffect, useCallback } from 'react';

import {
    getHashFromBrowser,
    setHashToBrowser,
} from '#utils/common';

function useHash(value?: string, use?: boolean) {
    const [initialValue] = useState<string | undefined>(value);
    const [hash, setHash] = useState(getHashFromBrowser());

    useEffect(() => {
        if (use) {
            setHashToBrowser(initialValue);
            // eslint-disable-next-line no-console
            console.info('setting hash', initialValue);
        }
    }, [initialValue, use]);

    const handleHashChange = useCallback(() => {
        setHash(getHashFromBrowser());
    }, [setHash]);

    useEffect(() => {
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [handleHashChange]);

    return hash;
}

export default useHash;
