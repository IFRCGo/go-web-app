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
            title: strings.cataloguePGICoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi%2FRapid%20Response%20Profile%20Protection%2C%20Gender%20and%20Inclusion%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.cataloguePGIOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi%2FRapid%20Response%20Profile%20Protection%2C%20Gender%20and%20Inclusion%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const technicalProfiles: LinkData[] = [
        {
            title: strings.cataloguePGI,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbXcICqULRhBss7nNlI-YUwB0JMTv-_fqTQlUpT2H0Cr7g',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const rapidResponseData: LinkData[] = [
        {
            title: strings.catalogueProtectionGender,
            to: 'protectionGender',
            withForwardIcon: true,
        },
    ];

    const standardData: LinkData[] = [
        {
            title: strings.catalogueProtectionLearnMore,
            to: 'https://www.ifrc.org/document/minimum-standards-pgi-emergencies',
            external: true,
            withForwardIcon: true,
        },
    ];

    const roofData: LinkData[] = [
        {
            title: strings.catalogueProtectionLearnMore,
            to: 'https://www.ifrc.org/media/48958',
            external: true,
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueProtection}
        >
            <SurgeCardContainer
                heading={strings.catalogueRapidResponsePersonnel}
            >
                <CatalogueInfoCard
                    title={strings.catalogueProtectionRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    description={strings.catalogueTechnicalDescription}
                    title={strings.catalogueTechnical}
                    data={technicalProfiles}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueProtectionServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueProtectionRapidResponse}
                    data={rapidResponseData}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueAdditionalResources}
            >
                <CatalogueInfoCard
                    title={strings.catalogueStandard}
                    data={standardData}
                    description={strings.catalogueStandardDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueAllUnderOneRoof}
                    data={roofData}
                    description={strings.catalogueAllUnderOneRoofDescription}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'CatalogueProtection';
