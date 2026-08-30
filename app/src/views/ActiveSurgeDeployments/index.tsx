import TabPage from '#components/TabPage';

import ActiveRapidResponseTable from './ActiveRapidResponseTable';
import ActiveSurgeSupport from './ActiveSurgeSupport';
import OngoingEruDeployments from './OngoingEruDeployments';
import OngoingRapidResponseDeployments from './OngoingRapidResponseDeployments';
import SurgeMap from './SurgeMap';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <TabPage>
            <SurgeMap />
            <ActiveSurgeSupport />
            <ActiveRapidResponseTable />
            <OngoingRapidResponseDeployments />
            <OngoingEruDeployments />
        </TabPage>
    );
}

Component.displayName = 'ActiveSurgeDeployments';
