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
}

function LanguageMismatchMessage(props: Props) {
    const strings = useTranslation(i18n);

    const {
        title = strings.languageMismatchErrorTitle,
        originalLanguage = 'en',
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
