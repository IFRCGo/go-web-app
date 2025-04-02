import {
    CheckboxCircleLineIcon,
    CloseCircleLineIcon,
} from '@ifrc-go/icons';

import styles from './styles.module.css';

interface ReadinessIconProps {
    readiness: number | undefined;
}

function ReadinessIcon({ readiness }: ReadinessIconProps) {
    if (readiness === 3) {
        return <CloseCircleLineIcon className={styles.redIcon} />;
    }
    if (readiness === 2) {
        return <CheckboxCircleLineIcon className={styles.yellowIcon} />;
    }
    if (readiness === 1) {
        return <CheckboxCircleLineIcon className={styles.greenIcon} />;
    }
    return <CheckboxCircleLineIcon className={styles.grayIcon} />;
}

export default ReadinessIcon;
