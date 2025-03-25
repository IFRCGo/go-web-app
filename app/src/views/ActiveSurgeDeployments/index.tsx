import { Container } from '@ifrc-go/ui';

import ActiveRapidResponseTable from './ActiveRapidResponseTable';
import ActiveSurgeSupport from './ActiveSurgeSupport';
import OngoingEruDeployments from './OngoingEruDeployments';
import OngoingRapidResponseDeployments from './OngoingRapidResponseDeployments';
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
            childrenContainerClassName={styles.content}
        >
            <SurgeMap />
            <ActiveSurgeSupport />
            <ActiveRapidResponseTable />
            <OngoingRapidResponseDeployments />
            <OngoingEruDeployments />
        </Container>
    );
}

Component.displayName = 'ActiveSurgeDeployments';
