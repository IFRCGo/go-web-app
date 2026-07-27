import { useParams } from 'react-router-dom';
import {
    DeployedIcon,
    EmergencyResponseUnitIcon,
} from '@ifrc-go/icons';
import {
    KeyFigureCard,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import DeployedErusTable from './DeployedErusTable';
import RapidResponsePersonnelTable from './RapidResponsePersonnelTable';
import SurgeTable from './SurgeTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { emergencyId } = useParams<{ emergencyId: string }>();
    const strings = useTranslation(i18n);

    const {
        response: deploymentResponse,
    } = useRequest({
        url: '/api/v2/deployment/aggregated',
        preserveResponse: true,
        // FIXME: fix typings in server (low priority)
        query: {
            event: Number(emergencyId),
        } as never,
    });

    return (
        <TabPage>
            <ListView
                layout="grid"
                numPreferredGridColumns={4}
            >
                <KeyFigureCard
                    icon={<DeployedIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_rapid_response_personnel}
                    valueType="number"
                    compact
                    label={strings.emergencyActiveDeployments}
                    boxShadow="md"
                />
                <KeyFigureCard
                    icon={<EmergencyResponseUnitIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_emergency_response_units}
                    valueType="number"
                    compact
                    label={strings.emergencyActiveErus}
                    boxShadow="md"
                />
            </ListView>
            <SurgeTable emergencyId={emergencyId} />
            <RapidResponsePersonnelTable emergencyId={emergencyId} />
            <DeployedErusTable emergencyId={emergencyId} />
        </TabPage>
    );
}

Component.displayName = 'EmergencySurge';
