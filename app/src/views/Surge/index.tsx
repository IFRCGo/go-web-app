import { Outlet } from 'react-router-dom';
import {
    ClinicIcon,
    DeployedIcon,
    EmergencyResponseUnitIcon,
} from '@ifrc-go/icons';
import {
    BlockLoading,
    KeyFigure,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        pending: surgeAggregatedResponsePending,
        response: aggregatedResponse,
    } = useRequest({
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
                    {aggregatedResponse && (
                        <>
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<DeployedIcon />}
                                value={aggregatedResponse.active_rapid_response_personnel}
                                label={strings.activeRapidResponsePersonnel}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<DeployedIcon />}
                                value={aggregatedResponse.rapid_response_deployments_this_year}
                                label={strings.rapidResponseDeployments}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<EmergencyResponseUnitIcon />}
                                value={aggregatedResponse.active_emergency_response_units}
                                label={strings.activeErus}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<ClinicIcon />}
                                value={
                                    aggregatedResponse.emergency_response_unit_deployed_this_year
                                }
                                label={strings.eruDeploymentsThisYear}
                            />
                        </>
                    )}
                </>
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to="activeSurgeDeployments"
                >
                    {strings.activeSurgeDeploymentsTab}
                </NavigationTab>
                <NavigationTab
                    to="surgeOverviewLayout"
                    parentRoute
                >
                    {strings.surgeOverviewTab}
                </NavigationTab>
                <NavigationTab
                    to="surgeOperationalToolbox"
                >
                    {strings.operationalToolboxTab}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueLayout"
                >
                    {strings.surgeCatalogueTab}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Surge';
