import { Message } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;
    description: React.ReactNode;
    helpText?: React.ReactNode;
}

function FormFailedToLoadMessage(props: Props) {
    const strings = useTranslation(i18n);

    const {
        title = strings.formFailedToLoadErrorTitle,
        description,
        helpText = strings.formFailedToLoadErrorHelpText,
    } = props;

    return (
        <Message
            variant="error"
            title={title}
            description={description}
            actions={helpText}
        />
    );
}

export default FormFailedToLoadMessage;
