import { useEffect } from 'react';

type PageName = 'home' | 'common' | 'login' | 'threeW' | 'dref';

function useTranslation<V extends Record<string, string>>(pageName: PageName, defaultValues: V) {
    useEffect(() => {
        console.info('fetching translations for', pageName);
    }, [pageName]);
    return defaultValues;
}

export default useTranslation;
