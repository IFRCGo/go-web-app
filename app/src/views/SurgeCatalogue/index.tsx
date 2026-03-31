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
    RisksIcon,
    SafetyAndSecurityIcon,
    ShelterIcon,
    ShieldCrossFillIcon,
    WaterSanitationAndHygieneIcon,
} from '@ifrc-go/icons';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import TabPage from '#components/TabPage';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <TabPage>
            <div className={styles.surgeCatalogue}>
                <NavigationTabList
                    className={styles.tabList}
                    styleVariant="vertical"
                >
                    <NavigationTab
                        to="surgeCatalogueOverview"
                    >
                        {strings.catalogueServiceOverview}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueAdministration"
                        parentRoute
                        before={<EditLineTwoIcon className={styles.icon} />}
                    >
                        {strings.catalogueAdministration}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueCash"
                        parentRoute
                        before={<CashTransferIcon className={styles.icon} />}
                    >
                        {strings.catalogueCash}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherCivilMilitaryRelations"
                        parentRoute
                        before={<CivilMilitaryCoordinationIcon className={styles.icon} />}
                    >
                        {strings.catalogueCMR}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueCommunication"
                        parentRoute
                        before={<PublicInformationIcon className={styles.icon} />}
                    >
                        {strings.catalogueCommunication}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueCommunityEngagement"
                        parentRoute
                        before={<PartnershipIcon className={styles.icon} />}
                    >
                        {strings.catalogueCommunityEngagement}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherDisasterRiskReduction"
                        parentRoute
                        before={<DisasterRiskReductionIcon className={styles.icon} />}
                    >
                        {strings.catalogueDDR}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherUAV"
                        parentRoute
                        before={<DroneTwoIcon className={styles.icon} />}
                    >
                        {strings.catalogueUAV}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueEmergencyNeedsAssessment"
                        parentRoute
                        before={<CoordinatedAssessementIcon className={styles.icon} />}
                    >
                        {strings.catalogueEmergency}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherGreenResponse"
                        parentRoute
                        before={<GreenResponseIcon className={styles.icon} />}
                    >
                        {strings.catalogueGR}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueHealth"
                        parentRoute
                        before={<HealthIcon className={styles.icon} />}
                    >
                        {strings.catalogueHealth}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherHumanitarianDiplomacy"
                        parentRoute
                        before={<ShieldCrossFillIcon className={styles.icon} />}
                    >
                        {strings.catalogueHD}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherHumanResources"
                        parentRoute
                        before={<HumanResourcesIcon className={styles.icon} />}
                    >
                        {strings.catalogueHR}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueInformationManagement"
                        parentRoute
                        before={<AnalysisIcon className={styles.icon} />}
                    >
                        {strings.catalogueInformationManagement}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueInformationTechnology"
                        parentRoute
                        before={<EmergencyTelecommunicationsIcon className={styles.icon} />}
                    >
                        {strings.catalogueInformationTechnologyTelecom}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherInternationalDisasterResponseLaw"
                        parentRoute
                        before={<LawIcon className={styles.icon} />}
                    >
                        {strings.catalogueIDRL}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueLivelihood"
                        parentRoute
                        before={<LivelihoodIcon className={styles.icon} />}
                    >
                        {strings.catalogueLivelihoodsAndBasicNeeds}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueLogistics"
                        parentRoute
                        before={<LogisticsIcon className={styles.icon} />}
                    >
                        {strings.catalogueLogistics}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherMigration"
                        parentRoute
                        before={<MigrationIcon className={styles.icon} />}
                    >
                        {strings.catalogueMigration}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherNationalSocietyDevelopment"
                        parentRoute
                        before={<NationalSocietyDevelopmentIcon className={styles.icon} />}
                    >
                        {strings.catalogueNSD}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOperationsManagement"
                        parentRoute
                        before={<GroupIcon className={styles.icon} />}
                    >
                        {strings.catalogueOperations}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueBasecamp"
                        parentRoute
                        before={<BasecampIcon className={styles.icon} />}
                    >
                        {strings.catalogueBasecamp}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCataloguePmer"
                        parentRoute
                        before={<MonitoringIcon className={styles.icon} />}
                    >
                        {strings.cataloguePMER}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherPreparednessEffectiveResponse"
                        parentRoute
                        before={<PreparednessIcon className={styles.icon} />}
                    >
                        {strings.cataloguePER}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCataloguePgi"
                        parentRoute
                        before={<ProtectionIcon className={styles.icon} />}
                    >
                        {strings.catalogueProtection}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherRecovery"
                        parentRoute
                        before={<RecoveryIcon className={styles.icon} />}
                    >
                        {strings.catalogueRecovery}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueRelief"
                        parentRoute
                        before={<NonFoodItemsIcon className={styles.icon} />}
                    >
                        {strings.catalogueRelief}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueRiskManagement"
                        parentRoute
                        before={<RisksIcon className={styles.icon} />}
                    >
                        {strings.catalogueRiskManagement}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueSecurity"
                        parentRoute
                        before={<SafetyAndSecurityIcon className={styles.icon} />}
                    >
                        {strings.catalogueSecurity}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueShelter"
                        parentRoute
                        before={<ShelterIcon className={styles.icon} />}
                    >
                        {strings.catalogueShelter}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueOtherStrategicPartnershipsResourceMobilisation"
                        parentRoute
                        before={<PartnershipIcon className={styles.icon} />}
                    >
                        {strings.catalogueSPRD}
                    </NavigationTab>
                    <NavigationTab
                        to="surgeCatalogueWash"
                        parentRoute
                        before={<WaterSanitationAndHygieneIcon className={styles.icon} />}
                    >
                        {strings.catalogueWater}
                    </NavigationTab>
                </NavigationTabList>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </TabPage>
    );
}

Component.displayName = 'SurgeCatalogue';
