import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

interface Props {
    title?: React.ReactNode;
}

function NonEnglishFormCreationMessage(props: Props) {
    const { title } = props;
    const strings = useTranslation(i18n);

    return (
        <Message
            variant="error"
            title={title}
            description={strings.fonNonEnglishErrorMessage}
            actions={strings.formNonEnglishHelpMessage}
        />
    );
}

export default NonEnglishFormCreationMessage;
