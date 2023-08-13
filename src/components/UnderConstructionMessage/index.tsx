import { PaintBrushLineIcon } from '@ifrc-go/icons';

import Message from '#components/Message';

import styles from './styles.module.css';

interface Props {
    title?: string;
}

function UnderConstructionMessage(props: Props) {
    const {
        title = 'Work in Progress!',
    } = props;

    return (
        <Message
            className={styles.underConstructionMessage}
            icon={<PaintBrushLineIcon />}
            title={title}
            description="This page is currently under construction!"
        />
    );
}

export default UnderConstructionMessage;
