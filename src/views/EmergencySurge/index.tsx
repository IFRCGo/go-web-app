import { useParams } from 'react-router-dom';
import {
    EmergencyResponseUnitIcon,
    DeployedIcon,
} from '@ifrc-go/icons';
import {
    useRequest,
} from '#utils/restRequest';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import SurgeTable from './SurgeTable';
import RapidResponsePersonnelTable from './RapidResponsePersonnelTable';
import DeployedErusTable from './DeployedErusTable';

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
        <div className={styles.emergencySurge}>
            <div className={styles.keyFigureList}>
                <KeyFigure
                    icon={<DeployedIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_deployments}
                    compactValue
                    label={strings.emergencyActiveDeployments}
                />
                <KeyFigure
                    icon={<EmergencyResponseUnitIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_erus}
                    compactValue
                    label={strings.emergencyActiveErus}
                />
            </div>
            <SurgeTable
                emergencyId={emergencyId}
            />
            <RapidResponsePersonnelTable
                emergencyId={emergencyId}
            />
            <DeployedErusTable
                emergencyId={emergencyId}
            />
        </div>
    );
}

Component.displayName = 'EmergencySurge';
