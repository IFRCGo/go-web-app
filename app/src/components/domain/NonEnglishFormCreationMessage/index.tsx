import { Message } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;
}

function NonEnglishFormCreationMessage(props: Props) {
    const strings = useTranslation(i18n);
    const { title = strings.formNonEnglishErrorTitle } = props;

    return (
        <Message
            variant="error"
            title={title}
            description={strings.formNonEnglishErrorMessage}
            actions={strings.formNonEnglishHelpMessage}
        />
    );
}

export default NonEnglishFormCreationMessage;
