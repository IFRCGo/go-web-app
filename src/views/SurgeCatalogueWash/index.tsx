import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.washCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ea1oxcI_tcdGqisMk7IDnawBRBn5eDX9kKbW8ciNO6AgHw',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.washOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EftnI72a0LtPqfT6ukpqEv8Bqi8DN83FTw9oFXhYIkC1EA',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.washOfficerPromotion,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EaOPwYRaFehOmcfw5Tnaq5MBppJ1wZ7VwkxeRjN-G0-DKA',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.washOfficerSanitation,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWM7iFH2papCtEWNJZtHZaQB44rAuE8d6l3M8G4_BmCGiw',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalWash,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Efan8Jv59RBLsNVfYvdCQTUBiG3ddAPkJkwxQq1PYyrlXw',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const equipmentKit1Data: LinkData[] = [
        {
            title: strings.technicalEquipmentOneLink,
            to: 'surgeCatalogueWashKit2',
            withForwardIcon: true,
        },
    ];

    const equipmentKit5Data: LinkData[] = [
        {
            title: strings.technicalEquipmentFive,
            to: 'surgeCatalogueWashKit5',
            withForwardIcon: true,
        },
    ];

    const equipmentM15Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM15Link,
            to: 'surgeCatalogueWashKitM15Eru',
            withForwardIcon: true,
        },
    ];

    const equipmentM20Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM20Link,
            to: 'surgeCatalogueWashKitMsm20Eru',
            withForwardIcon: true,
        },
    ];

    const equipmentM40Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM40Link,
            to: 'surgeCatalogueWashKitM40Eru',
            withForwardIcon: true,
        },
    ];

    const equipmentSupplyData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterSupplyLink,
            to: 'surgeCatalogueWashWaterSupplyRehabilitation',
            withForwardIcon: true,
        },
    ];

    const equipmentTreatmentData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterTreatmentLink,
            to: 'surgeCatalogueWashHwts',
            withForwardIcon: true,
        },
    ];

    const additionalData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'https://watsanmissionassistant.org/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueWaterTitle}
            description={strings.catalogueWaterDescription}
        >
            <SurgeCardContainer
                heading={strings.rapidResponse}
            >
                <CatalogueInfoCard
                    title={strings.rapidTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalFramework}
                    data={frameworkData}
                    description={strings.technicalFrameworkDetail}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.technicalServices}
            >
                <CatalogueInfoCard
                    title={strings.technicalEquipmentOne}
                    data={equipmentKit1Data}
                    description={strings.technicalEquipmentOneDetail}
                />
                <CatalogueInfoCard
                    title={strings.technicalEquipmentOne}
                    data={equipmentKit5Data}
                    description={strings.technicalEquipmentFiveDetail}
                />
                <CatalogueInfoCard
                    title={strings.technicalERU}
                    data={equipmentM15Data}
                    description={strings.technicalEquipmentM15Detail}
                />
                <CatalogueInfoCard
                    title={strings.technicalERU}
                    data={equipmentM20Data}
                    description={strings.technicalERUM20Detail}
                />
                <CatalogueInfoCard
                    title={strings.technicalERU}
                    data={equipmentM40Data}
                    description={strings.technicalERUM40Detail}
                />
                <CatalogueInfoCard
                    title={strings.technicalERU}
                    data={equipmentSupplyData}
                    description={strings.technicalWaterSupplyDetail}
                />
                <CatalogueInfoCard
                    title={strings.technicalERU}
                    data={equipmentTreatmentData}
                    description={strings.technicalWaterTreatmentDetail}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.additionalResources}
            >
                <CatalogueInfoCard
                    title={strings.additionWatsan}
                    data={additionalData}
                    description={strings.additionWatsanDetail}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueWash';
