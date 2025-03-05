import { Container } from '@ifrc-go/ui';

import ActiveRapidResponseTable from './ActiveRapidResponseTable';
import OngoingERUDeployments from './OngoingERUDeployments';
import OngoingRapidResponse from './OngoingRapidResponse';
import SurgeMap from './SurgeMap';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <Container
            childrenContainerClassName={styles.activeSurge}
        >
            <SurgeMap />
            <ActiveRapidResponseTable />
            <OngoingRapidResponse />
            <OngoingERUDeployments />
        </Container>
    );
}

Component.displayName = 'ActiveSurgeDeployments';
