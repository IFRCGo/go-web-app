import { Outlet } from 'react-router-dom';
import {
    AnalysisIcon,
    BasecampIcon,
    CashTransferIcon,
    CivilMilitaryCoordinationIcon,
    CoordinatedAssessementIcon,
    DisasterRiskReductionIcon,
    DroneTwoIcon,
    EditLineTwoIcon,
    EmergencyTelecommunicationsIcon,
    GreenResponseIcon,
    GroupIcon,
    HealthIcon,
    HumanResourcesIcon,
    LawIcon,
    LivelihoodIcon,
    LogisticsIcon,
    MigrationIcon,
    MonitoringIcon,
    NationalSocietyDevelopmentIcon,
    NonFoodItemsIcon,
    PartnershipIcon,
    PreparednessIcon,
    ProtectionIcon,
    PublicInformationIcon,
    RecoveryIcon,
    SafetyAndSecurityIcon,
    ShelterIcon,
    ShieldCrossFillIcon,
    WaterSanitationAndHygieneIcon,
} from '@ifrc-go/icons';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
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
                    to="surgeCatalogueAdministration"
                    parentRoute
                >
                    <EditLineTwoIcon className={styles.icon} />
                    {strings.catalogueAdministration}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueCash"
                    parentRoute
                >
                    <CashTransferIcon className={styles.icon} />
                    {strings.catalogueCash}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherCivilMilitaryRelations"
                    parentRoute
                >
                    <CivilMilitaryCoordinationIcon className={styles.icon} />
                    {strings.catalogueCMR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueCommunication"
                    parentRoute
                >
                    <PublicInformationIcon className={styles.icon} />
                    {strings.catalogueCommunication}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueCommunityEngagement"
                    parentRoute
                >
                    <PartnershipIcon className={styles.icon} />
                    {strings.catalogueCommunityEngagement}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherDisasterRiskReduction"
                    parentRoute
                >
                    <DisasterRiskReductionIcon className={styles.icon} />
                    {strings.catalogueDDR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherUAV"
                    parentRoute
                >
                    <DroneTwoIcon className={styles.icon} />
                    {strings.catalogueUAV}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueEmergencyNeedsAssessment"
                    parentRoute
                >
                    <CoordinatedAssessementIcon className={styles.icon} />
                    {strings.catalogueEmergency}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherGreenResponse"
                    parentRoute
                >
                    <GreenResponseIcon className={styles.icon} />
                    {strings.catalogueGR}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueHealth"
                    parentRoute
                >
                    <HealthIcon className={styles.icon} />
                    {strings.catalogueHealth}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherHumanitarianDiplomacy"
                    parentRoute
                >
                    <ShieldCrossFillIcon className={styles.icon} />
                    {strings.catalogueHD}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherHumanResources"
                    parentRoute
                >
                    <HumanResourcesIcon className={styles.icon} />
                    {strings.catalogueHR}
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
                    to="surgeCatalogueOtherInternationalDisasterResponseLaw"
                    parentRoute
                >
                    <LawIcon className={styles.icon} />
                    {strings.catalogueIDRL}
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
                    to="surgeCatalogueOtherMigration"
                    parentRoute
                >
                    <MigrationIcon className={styles.icon} />
                    {strings.catalogueMigration}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherNationalSocietyDevelopment"
                    parentRoute
                >
                    <NationalSocietyDevelopmentIcon className={styles.icon} />
                    {strings.catalogueNSD}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOperationsManagement"
                    parentRoute
                >
                    <GroupIcon className={styles.icon} />
                    {strings.catalogueOperations}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueBasecamp"
                    parentRoute
                >
                    <BasecampIcon className={styles.icon} />
                    {strings.catalogueBasecamp}
                </NavigationTab>
                <NavigationTab
                    to="surgeCataloguePmer"
                    parentRoute
                >
                    <MonitoringIcon className={styles.icon} />
                    {strings.cataloguePMER}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherPreparednessEffectiveResponse"
                    parentRoute
                >
                    <PreparednessIcon className={styles.icon} />
                    {strings.cataloguePER}
                </NavigationTab>
                <NavigationTab
                    to="surgeCataloguePgi"
                    parentRoute
                >
                    <ProtectionIcon className={styles.icon} />
                    {strings.catalogueProtection}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueOtherRecovery"
                    parentRoute
                >
                    <RecoveryIcon className={styles.icon} />
                    {strings.catalogueRecovery}
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
                    to="surgeCatalogueOtherStrategicPartnershipsResourceMobilisation"
                    parentRoute
                >
                    <PartnershipIcon className={styles.icon} />
                    {strings.catalogueSPRD}
                </NavigationTab>
                <NavigationTab
                    to="surgeCatalogueWash"
                    parentRoute
                >
                    <WaterSanitationAndHygieneIcon className={styles.icon} />
                    {strings.catalogueWater}
                </NavigationTab>
            </NavigationTabList>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

Component.displayName = 'SurgeCatalogue';
