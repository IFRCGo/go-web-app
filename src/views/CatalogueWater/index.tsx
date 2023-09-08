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
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash%2FRapid%20Response%20Profile%20WASH%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.washOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash%2FRapid%20Response%20Profile%20WASH%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.washOfficerPromotion,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash%2FRapid%20Response%20Profile%20WASH%20Officer%20%2D%20Hygiene%20Promotion%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.washOfficerSanitation,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash%2FRapid%20Response%20Profile%20WASH%20Officer%20%2D%20Sanitation%20Engineer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalWash,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash%2FIFRC%20WASH%20Competency%20Framework%20March%202020%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fwash&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const equipmentKit1Data: LinkData[] = [
        {
            title: strings.technicalEquipmentOneLink,
            to: 'washKit2',
            withForwardIcon: true,
        },
    ];

    const equipmentKit5Data: LinkData[] = [
        {
            title: strings.technicalEquipmentFive,
            to: 'washKit5',
            withForwardIcon: true,
        },
    ];

    const equipmentM15Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM15Link,
            to: 'washM15',
            withForwardIcon: true,
        },
    ];

    const equipmentM20Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM20Link,
            to: 'washM20',
            withForwardIcon: true,
        },
    ];

    const equipmentM40Data: LinkData[] = [
        {
            title: strings.technicalEquipmentM40Link,
            to: 'washM40',
            withForwardIcon: true,
        },
    ];

    const equipmentSupplyData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterSupplyLink,
            to: 'waterSupply',
            withForwardIcon: true,
        },
    ];

    const equipmentTreatmentData: LinkData[] = [
        {
            title: strings.technicalEquipmentWaterTreatmentLink,
            to: 'waterTreatment',
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

Component.displayName = 'CatalogueWater';
