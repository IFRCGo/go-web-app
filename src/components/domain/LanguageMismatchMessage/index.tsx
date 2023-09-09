import Message from '#components/Message';
import { Language } from '#contexts/language';
import useTranslation from '#hooks/useTranslation';
import { languageNameMapEn } from '#utils/common';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;

    // FIXME: typings should be fixed in the server
    // FIXME: this should be of type Language
    originalLanguage: string;
}

function LanguageMismatchMessage(props: Props) {
    const {
        title,
        originalLanguage,
    } = props;
    const strings = useTranslation(i18n);

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
