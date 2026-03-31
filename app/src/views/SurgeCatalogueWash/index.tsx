import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.washCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ea1oxcI_tcdGqisMk7IDnawBRBn5eDX9kKbW8ciNO6AgHw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.washOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EftnI72a0LtPqfT6ukpqEv8Bqi8DN83FTw9oFXhYIkC1EA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.washOfficerPromotion,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EaOPwYRaFehOmcfw5Tnaq5MBppJ1wZ7VwkxeRjN-G0-DKA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.washOfficerSanitation,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWM7iFH2papCtEWNJZtHZaQB44rAuE8d6l3M8G4_BmCGiw',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalWash,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Efan8Jv59RBLsNVfYvdCQTUBiG3ddAPkJkwxQq1PYyrlXw',
            external: true,
            withLinkIcon: true,
        },
    ];

    const equipmentKit1Data: LinkData[] = [
        {
            title: strings.technicalEquipmentOneLink,
            to: 'surgeCatalogueWashKit2',
            withLinkIcon: true,
        },
    ];

    const equipmentKit5Data: LinkData[] = [
        {
            title: strings.technicalEquipmentFive,
            to: 'surgeCatalogueWashKit5',
            withLinkIcon: true,
        },
    ];

    const equipmentM15Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM15Link,
            to: 'surgeCatalogueWashKitM15Eru',
            withLinkIcon: true,
        },
    ];

    const equipmentM20Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM20Link,
            to: 'surgeCatalogueWashKitMsm20Eru',
            withLinkIcon: true,
        },
    ];

    const equipmentM40Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM40Link,
            to: 'surgeCatalogueWashKitM40Eru',
            withLinkIcon: true,
        },
    ];

    const equipmentSupplyData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterSupplyLink,
            to: 'surgeCatalogueWashWaterSupplyRehabilitation',
            withLinkIcon: true,
        },
    ];

    const equipmentTreatmentData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterTreatmentLink,
            to: 'surgeCatalogueWashHwts',
            withLinkIcon: true,
        },
    ];

    const equipmentSludgeData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterSludgeLink,
            to: 'surgeCatalogueWashSludge',
            withLinkIcon: true,
        },
    ];

    const additionalData: LinkData[] = [
        {
            title: strings.learnMore,
            href: 'https://watsanmissionassistant.org/',
            external: true,
            withLinkIcon: true,
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
                <CatalogueInfoCard
                    title={strings.technicalERU}
                    data={equipmentSludgeData}
                    description={strings.technicalWaterSludgeDetail}
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
