import {
    CheckboxCircleLineIcon,
    CloseCircleLineIcon,
} from '@ifrc-go/icons';

import {
    ERU_READINESS_CAN_CONTRIBUTE,
    ERU_READINESS_NO_CAPACITY,
    ERU_READINESS_READY,
} from '#utils/constants';

import styles from './styles.module.css';

interface ReadinessIconProps {
    readiness: number | undefined;
}

function ReadinessIcon({ readiness }: ReadinessIconProps) {
    if (readiness === ERU_READINESS_NO_CAPACITY) {
        return <CloseCircleLineIcon className={styles.redIcon} />;
    }
    if (readiness === ERU_READINESS_CAN_CONTRIBUTE) {
        return <CheckboxCircleLineIcon className={styles.yellowIcon} />;
    }
    if (readiness === ERU_READINESS_READY) {
        return <CheckboxCircleLineIcon className={styles.greenIcon} />;
    }
    return <CheckboxCircleLineIcon className={styles.grayIcon} />;
}

export default ReadinessIcon;
