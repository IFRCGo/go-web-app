import { InformationLineIcon } from '@ifrc-go/icons';

import InfoModal from '#components/domain/InfoModal';

import styles from './styles.module.css';

interface Props {
    content: React.ReactNode;
    heading: string;
    ariaLabel: string;
    title: string;
}

function ExplanatoryNote(props: Props) {
    const {
        content,
        heading,
        ariaLabel,
        title,
    } = props;

    return (
        <InfoModal
            name={undefined}
            heading={heading}
            modalContent={content}
            icon={<InformationLineIcon className={styles.icon} />}
            ariaLabel={ariaLabel}
            title={title}
        />
    );
}

export default ExplanatoryNote;
