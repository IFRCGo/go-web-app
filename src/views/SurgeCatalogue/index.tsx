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
    EmergencyTelecommunicationsIcon,
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
        catalogueInformationTechnology: catalogueInformationTechnologyRoute,
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
                    parentRoute
                >
                    <CoordinatedAssessementIcon className={styles.icon} />
                    {strings.catalogueEmergency}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueBasecampRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <BasecampIcon className={styles.icon} />
                    {strings.catalogueBasecamp}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueCashRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <CashTransferIcon className={styles.icon} />
                    {strings.catalogueCash}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueCommunityEngagementRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <PartnershipIcon className={styles.icon} />
                    {strings.catalogueCommunityEngagement}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueCommunicationRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <PublicInformationIcon className={styles.icon} />
                    {strings.catalogueCommunication}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueHealthRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <HealthIcon className={styles.icon} />
                    {strings.catalogueHealth}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueInformationManagementRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <AnalysisIcon className={styles.icon} />
                    {strings.catalogueInformationManagement}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueInformationTechnologyRoute.absolutePath,
                    )}
                    parentRoute
                >
                    <EmergencyTelecommunicationsIcon className={styles.icon} />
                    {strings.catalogueInformationTechnologyTelecom}
                </NavigationTab>
            </NavigationTabList>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

Component.displayName = 'SurgeCatalogue';
