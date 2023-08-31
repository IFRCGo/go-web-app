import { Outlet } from 'react-router-dom';
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

import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <div className={styles.surgeCatalogue}>
            <NavigationTabList
                className={styles.tabList}
                variant="vertical"
            >
                <NavigationTab
                    to="catalogueOverview"
                >
                    {strings.catalogueServiceOverview}
                </NavigationTab>
                <NavigationTab
                    to="catalogueEmergency"
                    parentRoute
                >
                    <CoordinatedAssessementIcon className={styles.icon} />
                    {strings.catalogueEmergency}
                </NavigationTab>
                <NavigationTab
                    to="catalogueBasecamp"
                    parentRoute
                >
                    <BasecampIcon className={styles.icon} />
                    {strings.catalogueBasecamp}
                </NavigationTab>
                <NavigationTab
                    to="catalogueCash"
                    parentRoute
                >
                    <CashTransferIcon className={styles.icon} />
                    {strings.catalogueCash}
                </NavigationTab>
                <NavigationTab
                    to="catalogueCommunityEngagement"
                    parentRoute
                >
                    <PartnershipIcon className={styles.icon} />
                    {strings.catalogueCommunityEngagement}
                </NavigationTab>
                <NavigationTab
                    to="catalogueCommunication"
                    parentRoute
                >
                    <PublicInformationIcon className={styles.icon} />
                    {strings.catalogueCommunication}
                </NavigationTab>
                <NavigationTab
                    to="catalogueHealth"
                    parentRoute
                >
                    <HealthIcon className={styles.icon} />
                    {strings.catalogueHealth}
                </NavigationTab>
                <NavigationTab
                    to="catalogueInformationManagement"
                    parentRoute
                >
                    <AnalysisIcon className={styles.icon} />
                    {strings.catalogueInformationManagement}
                </NavigationTab>
                <NavigationTab
                    to="catalogueInformationTechnology"
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
