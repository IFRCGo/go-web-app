import { useEffect } from 'react';

interface Internationalization<S extends Record<string, string>> {
    namespace: string;
    strings: S,
}

function useTranslation<S extends Record<string, string>>(i18n: Internationalization<S>) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.info('fetching translations for', i18n.namespace);
    }, [i18n.namespace]);
    return i18n.strings;
}

export default useTranslation;
