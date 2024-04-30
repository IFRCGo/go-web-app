import { Outlet } from 'react-router-dom';
import {
    AnalysisIcon,
    BasecampIcon,
    CashTransferIcon,
    CoordinatedAssessementIcon,
    EmergencyTelecommunicationsIcon,
    GroupIcon,
    HealthIcon,
    LivelihoodIcon,
    LogisticsIcon,
    MonitoringIcon,
    MoreOptionsIcon,
    NonFoodItemsIcon,
    PartnershipIcon,
    ProtectionIcon,
    PublicInformationIcon,
    SafetyAndSecurityIcon,
    ShelterIcon,
    WaterSanitationAndHygieneIcon,
} from '@ifrc-go/icons';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';

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
                    to="surgeCatalogueOtherCivilMilitaryRelations"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueCMR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherDisasterRiskReduction"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueDDR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherHumanResources"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueHR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherInternationalDisasterResponseLaw"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueIDRL}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherMigration"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueMigration}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherNationalSocietyDevelopment"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueNSD}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherPartnershipResourceDevelopment"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.cataloguePRD}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherPreparednessEffectiveResponse"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.cataloguePER}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherRecovery"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueRecovery}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherGreenResponse"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueGR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherUAV"
                    parentRoute
                >
                    <MoreOptionsIcon className={styles.icon} />
                    {strings.catalogueUAV}
                </NavigationTab>
            </NavigationTabList>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

Component.displayName = 'SurgeCatalogue';
