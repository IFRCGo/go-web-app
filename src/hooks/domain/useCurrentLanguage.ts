import { useContext } from 'react';

import LanguageContext from '#contexts/language';

function useCurrentLanguage() {
    const { currentLanguage } = useContext(LanguageContext);

    return currentLanguage;
}

export default useCurrentLanguage;
