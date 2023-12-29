import {
    useContext,
    useEffect,
} from 'react';

import LanguageContext from '#contexts/language';

interface Internationalization<S extends Record<string, string>> {
    namespace: string;
    strings: S,
}

function useTranslation<S extends Record<string, string>>(i18n: Internationalization<S>) {
    const {
        strings,
        registerNamespace,
    } = useContext(LanguageContext);

    useEffect(() => {
        registerNamespace(i18n.namespace, i18n.strings);
    }, [registerNamespace, i18n]);

    const dynamicStrings = strings[i18n.namespace] as typeof i18n.strings;

    return dynamicStrings ?? i18n.strings;
}

export default useTranslation;
