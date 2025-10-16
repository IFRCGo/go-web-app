import {
    useCallback,
    useContext,
    useEffect,
} from 'react';
import { CheckFillIcon } from '@ifrc-go/icons';
import { DropdownMenu } from '@ifrc-go/ui';
import {
    type Language,
    LanguageContext,
} from '@ifrc-go/ui/contexts';
import { languageNameMapEn } from '@ifrc-go/ui/utils';
import {
    _cs,
    mapToList,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { languageNameMap } from '#utils/common';

import styles from './styles.module.css';

const languageList = mapToList(
    languageNameMap,
    (value, key) => ({ key: key as Language, value }),
);

function LanguageDropdown() {
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

    const handleLanguageConfirm = useCallback(
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
            persistent
        >
            {languageList.map(
                (language) => (
                    <DropdownMenuItem
                        type="confirm-button"
                        key={language.key}
                        name={language.key}
                        persist
                        onConfirm={handleLanguageConfirm}
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

export default LanguageDropdown;
