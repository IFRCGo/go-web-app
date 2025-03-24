import { Container } from '@ifrc-go/ui';

import OngoingERUDeployments from '#views/Surge/OngoingERUDeployments';
import OngoingRapidResponseDeployments from '#views/Surge/OngoingRapidResponseDeployments';

import ActiveRapidResponseTable from './ActiveRapidResponseTable';
import ActiveSurgeSupport from './ActiveSurgeSupport';
import SurgeMap from './SurgeMap';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <Container
            contentViewType="vertical"
            spacing="loose"
            className={styles.activeSurgeDeployments}
        >
            <SurgeMap />
            <ActiveSurgeSupport />
            <ActiveRapidResponseTable />
            <OngoingRapidResponseDeployments />
            <OngoingERUDeployments />
        </Container>
    );
}

Component.displayName = 'ActiveSurgeDeployments';
