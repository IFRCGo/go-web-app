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
            title: strings.catalogueITCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt%2FRapid%20Response%20Profile%20IT%20and%20Telecom%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueITOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt%2FRapid%20Response%20Profile%20IT%20and%20Telecom%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueITLearnMore,
            to: 'surgeCatalogueInformationTechnologyEruItTelecom',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueITTitle}
            description={strings.catalogueITDetail}
        >
            <SurgeCardContainer
                heading={strings.catalogueITRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueITRoleTitle}
                    data={roleProfiles}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueITServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueITServicesTitle}
                    data={emergencyResponseData}
                    description={strings.catalogueITServicesDetail}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationTechnology';
