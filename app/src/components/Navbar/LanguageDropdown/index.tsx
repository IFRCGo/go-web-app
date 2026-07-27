import {
    useCallback,
    useContext,
    useEffect,
} from 'react';
import { CheckFillIcon } from '@ifrc-go/icons';
import { Menu } from '@ifrc-go/ui';
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
        <Menu
            label={languageNameMapEn[currentLanguage]}
            labelVariant="tertiary"
            persistent
            labelSpacing="sm"
        >
            {languageList.map(
                (language) => (
                    <DropdownMenuItem
                        type="confirm-button"
                        key={language.key}
                        name={language.key}
                        persist
                        onConfirm={handleLanguageConfirm}
                        before={(
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
        </Menu>
    );
}

export default LanguageDropdown;
