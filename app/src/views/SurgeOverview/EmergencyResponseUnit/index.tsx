import { Container } from '@ifrc-go/ui';

import OngoingERUDeployments from '#views/ActiveSurgeDeployments/OngoingERUDeployments';

import EmergencyResponseUnitReadiness from './EmergencyResponseUnitReadiness';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <Container
            className={styles.emergencyResponseUnit}
            contentViewType="vertical"
            childrenContainerClassName={styles.content}
        >
            <EmergencyResponseUnitReadiness />
            <OngoingERUDeployments />
        </Container>
    );
}

Component.displayName = 'EmergencyResponseUnit';
