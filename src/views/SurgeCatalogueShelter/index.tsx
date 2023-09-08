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
            title: strings.catalogueShelterProgrammeCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/_layouts/15/AccessDenied.aspx?Source=https%3A%2F%2Fifrcorg.sharepoint.com%2Fsites%2FIFRCSharing%2FShared%2520Documents%2FForms%2FAllItems.aspx%3Fid%3D%252Fsites%252FIFRCSharing%252FShared%2520Documents%252FGLOBAL%2520SURGE%252FCatalogue%2520of%2520Surge%2520services%2520%2528final%2529%252Fshelter%252FRapid%2520Response%2520Profile%2520Shelter%2520Programme%2520Coordinator%252Epdf%26parent%3D%252Fsites%252FIFRCSharing%252FShared%2520Documents%252FGLOBAL%2520SURGE%252FCatalogue%2520of%2520Surge%2520services%2520%2528final%2529%252Fshelter%26p%3Dtrue%26ga%3D1&Type=list&correlation=bd17d6a0-9078-7000-3982-6509de14755b',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueShelterProgrammeLeader,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter%2FRapid%20Response%20Profile%20Shelter%20Programme%20Team%20Leader%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueShelterProgrammeTechnical,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter%2FRapid%20Response%20Profile%20Shelter%20Programme%20Technical%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueClusterCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter%2FRapid%20Response%20Profile%20Shelter%20Cluster%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const technicalData: LinkData[] = [
        {
            title: strings.catalogueShelterAndSettlement,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter%2FShelter%20and%20Settlements%20Technical%20Competency%20Framework%20March%202020%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fshelter&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const catalogueServiceShelter: LinkData[] = [
        {
            title: strings.catalogueServiceShelterLink,
            to: 'shelterCoordinator',
            withForwardIcon: true,
        },
    ];

    const catalogueServiceCoordinator: LinkData[] = [
        {
            title: strings.catalogueShelterProgrammingLink,
            to: 'shelterTechnical',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueShelterTitle}
            description={strings.catalogueShelterDetail}
        >
            <SurgeCardContainer
                heading={strings.catalogueShelterRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueShelterRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.catalogueShelterTechnicalFrameworkTitle}
                    data={technicalData}
                    description={strings.catalogueShelterTechnicalFrameworkDetail}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueShelterServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueServiceShelter}
                    data={catalogueServiceShelter}
                />
                <CatalogueInfoCard
                    title={strings.catalogueShelterProgramming}
                    data={catalogueServiceCoordinator}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueShelter';
