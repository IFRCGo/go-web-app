import { createContext } from 'react';

export type Language = 'en' | 'fr' | 'es' | 'ar';

type Strings = Record<string, Record<string, string>>;

export interface LanguageContextProps {
    currentLanguage: Language;
    setCurrentLanguage: React.Dispatch<React.SetStateAction<Language>>;
    strings: Strings;
    setStrings: React.Dispatch<React.SetStateAction<Strings>>;
    registerNamespace: (namespace: string, fallbackValue: Record<string, string>) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
    currentLanguage: 'en',
    setCurrentLanguage: () => {
        // eslint-disable-next-line no-console
        console.warn('LanguageContext::setCurrentLanguage called without a provider');
    },
    strings: {},
    setStrings: () => {
        // eslint-disable-next-line no-console
        console.warn('LanguageContext::setStrings called without a provider');
    },
    registerNamespace: () => {
        // eslint-disable-next-line no-console
        console.warn('LanguageContext::registerNamespace called without a provider');
    },
});

export default LanguageContext;
