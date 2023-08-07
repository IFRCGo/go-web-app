import { useContext } from 'react';
import { Outlet, generatePath } from 'react-router-dom';
import {
    BasecampIcon,
    CashTransferIcon,
    CoordinatedAssessementIcon,
    HealthIcon,
    PartnershipIcon,
    PublicInformationIcon,
    AnalysisIcon,
} from '@ifrc-go/icons';

import RouteContext from '#contexts/route';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        catalogueOverview: catalogueServiceRoute,
        catalogueEmergency: catalogueEmergencyRoute,
        catalogueBasecamp: catalogueBasecampRoute,
        catalogueCash: catalogueCashRoute,
        catalogueCommunityEngagement: catalogueCommunityEngagementRoute,
        catalogueCommunication: catalogueCommunicationRoute,
        catalogueHealth: catalogueHealthRoute,
        catalogueInformationManagement: catalogueInformationManagementRoute,
    } = useContext(RouteContext);

    const strings = useTranslation(i18n);

    return (
        <div className={styles.surgeCatalogue}>
            <NavigationTabList
                className={styles.tabList}
                variant="vertical"
            >
                <NavigationTab
                    to={generatePath(
                        catalogueServiceRoute.absolutePath,
                    )}
                >
                    {strings.catalogueServiceOverview}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueEmergencyRoute.absolutePath,
                    )}
                >
                    <CoordinatedAssessementIcon className={styles.icon} />
                    {strings.catalogueEmergency}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueBasecampRoute.absolutePath,
                    )}
                >
                    <BasecampIcon className={styles.icon} />
                    {strings.catalogueBasecamp}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueCashRoute.absolutePath,
                    )}
                >
                    <CashTransferIcon className={styles.icon} />
                    {strings.catalogueCash}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueCommunityEngagementRoute.absolutePath,
                    )}
                >
                    <PartnershipIcon className={styles.icon} />
                    {strings.catalogueCommunityEngagement}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueCommunicationRoute.absolutePath,
                    )}
                >
                    <PublicInformationIcon className={styles.icon} />
                    {strings.catalogueCommunication}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueHealthRoute.absolutePath,
                    )}
                >
                    <HealthIcon className={styles.icon} />
                    {strings.catalogueHealth}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueInformationManagementRoute.absolutePath,
                    )}
                >
                    <AnalysisIcon className={styles.icon} />
                    {strings.catalogueInformationManagement}
                </NavigationTab>
            </NavigationTabList>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

Component.displayName = 'SurgeCatalogue';
