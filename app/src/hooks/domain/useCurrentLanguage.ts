import { useContext } from 'react';
import { LanguageContext } from '@ifrc-go/ui/contexts';

function useCurrentLanguage() {
    const { currentLanguage } = useContext(LanguageContext);

    return currentLanguage;
}

export default useCurrentLanguage;
