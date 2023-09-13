import Message from '#components/Message';
import { Language } from '#contexts/language';
import useTranslation from '#hooks/useTranslation';
import { languageNameMapEn } from '#utils/common';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;

    // FIXME: typings should be fixed in the server
    // this should be of type Language
    originalLanguage: string;
}

function LanguageMismatchMessage(props: Props) {
    const strings = useTranslation(i18n);

    const {
        title = strings.languageMismatchErrorTitle,
        originalLanguage,
    } = props;

    return (
        <Message
            variant="error"
            title={title}
            description={
                resolveToString(
                    strings.languageMismatchErrorMessage,
                    // FIXME: this should not require cast
                    { originalLanguage: languageNameMapEn[originalLanguage as Language] ?? '--' },
                )
            }
            actions={
                resolveToString(
                    strings.languageMismatchHelpMessage,
                    // FIXME: this should not require cast
                    { originalLanguage: languageNameMapEn[originalLanguage as Language] ?? '--' },
                )
            }
        />
    );
}

export default LanguageMismatchMessage;
