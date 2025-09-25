import { Message } from '@ifrc-go/ui';
import { type Language } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    languageNameMapEn,
    resolveToString,
} from '@ifrc-go/ui/utils';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;

    // FIXME: typings should be fixed in the server
    // this should be of type Language
    originalLanguage: string | undefined;
    selectedLanguage: Language;
}

function LanguageMismatchMessage(props: Props) {
    const strings = useTranslation(i18n);

    const {
        title = strings.languageMismatchErrorTitle,
        originalLanguage,
        selectedLanguage,
    } = props;

    return (
        <Message
            variant="error"
            title={title}
            description={
                resolveToString(
                    strings.languageMismatchErrorMessage,
                    // FIXME: this should not require cast
                    {
                        originalLanguage: languageNameMapEn[originalLanguage as Language] ?? '--',
                        selectedLanguage: languageNameMapEn[selectedLanguage] ?? '--',
                    },
                )
            }
            actions={strings.languageMismatchHelpMessage}
        />
    );
}

export default LanguageMismatchMessage;
