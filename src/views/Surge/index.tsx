import { DeployedIcon, EmergencyResponseUnitIcon, ClinicIcon } from '@ifrc-go/icons';

import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import KeyFigure from '#components/KeyFigure';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface SurgeAggregatedResponse {
    active_deployments: number;
    active_erus: number;
    deployments_this_year: number;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        pending: surgeAggregatedResponsePending,
        response: surgeAggregatedResponse,
    } = useRequest<SurgeAggregatedResponse>({
        url: '/api/v2/deployment/aggregated',
    });

    return (
        <Page
            className={styles.surge}
            title={strings.surgeTitle}
            heading={strings.surgeTitle}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {surgeAggregatedResponsePending && <BlockLoading />}
                    {surgeAggregatedResponse && (
                        <>
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<DeployedIcon />}
                                value={surgeAggregatedResponse.active_deployments}
                                description={strings.activeDeploymentsTitle}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<EmergencyResponseUnitIcon />}
                                value={surgeAggregatedResponse.active_erus}
                                description={strings.activeErusTitle}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<ClinicIcon />}
                                value={surgeAggregatedResponse.deployments_this_year}
                                description={strings.deploymentsThisYearTitle}
                            />
                        </>
                    )}
                </>
            )}
        >
            Surge Page
        </Page>
    );
}

Component.displayName = 'Surge';
