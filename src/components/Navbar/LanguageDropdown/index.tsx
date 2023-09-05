import { useContext, useCallback, useEffect } from 'react';
import { _cs, mapToList } from '@togglecorp/fujs';
import { CheckFillIcon } from '@ifrc-go/icons';

import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import LanguageContext, { type Language } from '#contexts/language';

import styles from './styles.module.css';

const languageNameMap: Record<Language, string> = {
    en: 'English',
    fr: 'Français',
    es: 'Española',
    ar: 'عربي',
};

const languageNameMapEn: Record<Language, string> = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    ar: 'Arabic',
};

const languageList = mapToList(
    languageNameMap,
    (value, key) => ({ key: key as Language, value }),
);

function LangaugeDropdown() {
    const {
        currentLanguage,
        setCurrentLanguage,
    } = useContext(LanguageContext);

    useEffect(
        () => {
            if (currentLanguage === 'ar') {
                document.body.style.direction = 'rtl';
                document.body.setAttribute('dir', 'rtl');
            } else {
                document.body.style.direction = 'ltr';
                document.body.setAttribute('dir', 'ltr');
            }
        },
        [currentLanguage],
    );

    const handleItemClick = useCallback(
        (newLanguage: Language) => {
            setCurrentLanguage(newLanguage);
            window.location.reload();
        },
        [setCurrentLanguage],
    );

    return (
        <DropdownMenu
            label={languageNameMapEn[currentLanguage]}
            variant="tertiary"
        >
            {languageList.map(
                (language) => (
                    <DropdownMenuItem
                        type="button"
                        key={language.key}
                        name={language.key}
                        onClick={handleItemClick}
                        icons={(
                            <CheckFillIcon
                                className={_cs(
                                    styles.icon,
                                    language.key === currentLanguage && styles.active,
                                )}
                            />
                        )}
                    >
                        {language.value}
                    </DropdownMenuItem>
                ),
            )}
        </DropdownMenu>
    );
}

export default LangaugeDropdown;
