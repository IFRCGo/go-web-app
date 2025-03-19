import { useTranslation } from '@ifrc-go/ui/hooks';

import Page from '#components/Page';

import ActiveRapidResponseTable from './ActiveRapidResponseTable';
import ActiveSurgeSupport from './ActiveSurgeSupport';
import OngoingERUDeployments from './OngoingERUDeployments';
import OngoingRapidResponse from './OngoingRapidResponse';
import SurgeMap from './SurgeMap';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    return (
        <Page
            title={strings.activeSurgeDeploymentsPageTitle}
        >
            <SurgeMap />
            <ActiveSurgeSupport />
            <ActiveRapidResponseTable />
            <OngoingRapidResponse />
            <OngoingERUDeployments />
        </Page>
    );
}

Component.displayName = 'ActiveSurgeDeployments';
