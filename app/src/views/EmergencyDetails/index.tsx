import { useOutletContext } from 'react-router-dom';

import EmergencyOverview from '#components/EmergencyOverviewTab';
import TabPage from '#components/TabPage';
import { type EmergencyOutletContext } from '#utils/outletContext';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();

    return (
        <TabPage>
            <EmergencyOverview
                response={emergencyResponse}
            />
        </TabPage>
    );
}

Component.displayName = 'EmergencyDetails';
