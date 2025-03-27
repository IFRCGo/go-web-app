import { useParams } from 'react-router-dom';
import {
    DeployedIcon,
    EmergencyResponseUnitIcon,
} from '@ifrc-go/icons';
import { KeyFigure } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { useRequest } from '#utils/restRequest';

import DeployedErusTable from './DeployedErusTable';
import RapidResponsePersonnelTable from './RapidResponsePersonnelTable';
import SurgeTable from './SurgeTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
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
                    value={deploymentResponse?.active_rapid_response_personnel}
                    compactValue
                    label={strings.emergencyActiveDeployments}
                />
                <KeyFigure
                    icon={<EmergencyResponseUnitIcon />}
                    className={styles.keyFigure}
                    value={deploymentResponse?.active_emergency_response_units}
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
