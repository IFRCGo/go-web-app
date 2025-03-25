import { Container } from '@ifrc-go/ui';

import OngoingEruDeployments from '#views/ActiveSurgeDeployments/OngoingEruDeployments';

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
            <OngoingEruDeployments />
        </Container>
    );
}

Component.displayName = 'EmergencyResponseUnit';
