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
    LivelihoodIcon,
    LogisticsIcon,
    GroupIcon,
    ProtectionIcon,
    MonitoringIcon,
    ShelterIcon,
    WaterSanitationAndHygieneIcon,
    NonFoodItemsIcon,
    SafetyAndSecurityIcon,
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
                    to="surgeCatalogueOverview"
                >
                    {strings.catalogueServiceOverview}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueEmergencyNeedsAssessment"
                    parentRoute
                >
                    <CoordinatedAssessementIcon className={styles.icon} />
                    {strings.catalogueEmergency}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueBasecamp"
                    parentRoute
                >
                    <BasecampIcon className={styles.icon} />
                    {strings.catalogueBasecamp}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueCash"
                    parentRoute
                >
                    <CashTransferIcon className={styles.icon} />
                    {strings.catalogueCash}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueCommunityEngagement"
                    parentRoute
                >
                    <PartnershipIcon className={styles.icon} />
                    {strings.catalogueCommunityEngagement}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueCommunication"
                    parentRoute
                >
                    <PublicInformationIcon className={styles.icon} />
                    {strings.catalogueCommunication}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueHealth"
                    parentRoute
                >
                    <HealthIcon className={styles.icon} />
                    {strings.catalogueHealth}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueInformationManagement"
                    parentRoute
                >
                    <AnalysisIcon className={styles.icon} />
                    {strings.catalogueInformationManagement}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueInformationTechnology"
                    parentRoute
                >
                    <EmergencyTelecommunicationsIcon className={styles.icon} />
                    {strings.catalogueInformationTechnologyTelecom}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueLivelihood"
                    parentRoute
                >
                    <LivelihoodIcon className={styles.icon} />
                    {strings.catalogueLivelihoodsAndBasicNeeds}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueLogistics"
                    parentRoute
                >
                    <LogisticsIcon className={styles.icon} />
                    {strings.catalogueLogistics}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOperationsManagement"
                    parentRoute
                >
                    <GroupIcon className={styles.icon} />
                    {strings.catalogueOperations}
                </NavigationTab>
                <NavigationTab
                    to="surgeCataloguePgi"
                    parentRoute
                >
                    <ProtectionIcon className={styles.icon} />
                    {strings.catalogueProtection}
                </NavigationTab>
                <NavigationTab
                    to="surgeCataloguePmer"
                    parentRoute
                >
                    <MonitoringIcon className={styles.icon} />
                    {strings.cataloguePMER}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueShelter"
                    parentRoute
                >
                    <ShelterIcon className={styles.icon} />
                    {strings.catalogueShelter}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueWash"
                    parentRoute
                >
                    <WaterSanitationAndHygieneIcon className={styles.icon} />
                    {strings.catalogueWater}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueRelief"
                    parentRoute
                >
                    <NonFoodItemsIcon className={styles.icon} />
                    {strings.catalogueRelief}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueSecurity"
                    parentRoute
                >
                    <SafetyAndSecurityIcon className={styles.icon} />
                    {strings.catalogueSecurity}
                </NavigationTab>
            </NavigationTabList>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

Component.displayName = 'SurgeCatalogue';
