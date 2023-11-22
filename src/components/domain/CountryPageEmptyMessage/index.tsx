import { PaintBrushLineIcon } from '@ifrc-go/icons';

import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    title?: string;
}

function CountryPageEmptyMessage(props: Props) {
    const {
        title,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Message
            className={styles.countryPageEmptyMessage}
            title={title}
            icon={<PaintBrushLineIcon />}
            description={strings.countryPageWipMessage}
        />
    );
}

export default CountryPageEmptyMessage;
