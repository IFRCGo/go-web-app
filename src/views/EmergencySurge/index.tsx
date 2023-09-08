import { useParams } from 'react-router-dom';
import {
    EmergencyResponseUnitIcon,
    ShieldUserLineIcon,
} from '@ifrc-go/icons';
import {
    useRequest,
} from '#utils/restRequest';
import Page from '#components/Page';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import SurgeTable from './SurgeTable';
import RapidResponsePersonnelTable from './RapidResponsePerosnnelTable';
import DeployedErusTable from './DeployedErusTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { emergencyId } = useParams<{ emergencyId: string }>();
    const strings = useTranslation(i18n);

    const {
        response: deployementResponse,
    } = useRequest({
        url: '/api/v2/deployment/aggregated',
        preserveResponse: true,
        query: {
            event: Number(emergencyId),
        } as never,
    });

    return (
        <Page
            className={styles.emergency}
            infoContainerClassName={styles.keyFigureList}
            mainSectionClassName={styles.content}
            info={(
                <>
                    <KeyFigure
                        // FIXME use appropriate icon
                        icon={<ShieldUserLineIcon />}
                        className={styles.keyFigure}
                        value={deployementResponse?.active_deployments}
                        compactValue
                        description={strings.emergencyActiveDeployments}
                    />
                    <KeyFigure
                        icon={<EmergencyResponseUnitIcon />}
                        className={styles.keyFigure}
                        value={deployementResponse?.active_erus}
                        compactValue
                        description={strings.emergencyActiveErus}
                    />
                </>
            )}
        >
            <SurgeTable
                emergencyId={emergencyId}
            />
            <RapidResponsePersonnelTable
                emergencyId={emergencyId}
            />
            <DeployedErusTable
                emergencyId={emergencyId}
            />
        </Page>
    );
}

Component.displayName = 'EmergencySurge';
