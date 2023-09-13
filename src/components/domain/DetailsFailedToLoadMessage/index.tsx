import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;
    description: React.ReactNode;
    helpText?: React.ReactNode;
}

function DetailsFailedToLoadMessage(props: Props) {
    const strings = useTranslation(i18n);

    const {
        title = strings.detailsFailedToLoadErrorTitle,
        description,
        helpText = strings.detailsFailedToLoadErrorHelpText,
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

export default DetailsFailedToLoadMessage;
