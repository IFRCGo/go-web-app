import { useParams } from 'react-router-dom';
import {
    DeployedIcon,
    EmergencyResponseUnitIcon,
} from '@ifrc-go/icons';
import {
    KeyFigureView,
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
                <KeyFigureView
                    icon={<DeployedIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_rapid_response_personnel}
                    valueType="number"
                    valueOptions={{ compact: true }}
                    label={strings.emergencyActiveDeployments}
                    withShadow
                />
                <KeyFigureView
                    icon={<EmergencyResponseUnitIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_emergency_response_units}
                    valueType="number"
                    valueOptions={{ compact: true }}
                    label={strings.emergencyActiveErus}
                    withShadow
                />
            </ListView>
            <SurgeTable emergencyId={emergencyId} />
            <RapidResponsePersonnelTable emergencyId={emergencyId} />
            <DeployedErusTable emergencyId={emergencyId} />
        </TabPage>
    );
}

Component.displayName = 'EmergencySurge';
