import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const securityRoleProfiles : LinkData[] = [
        {
            title: strings.catalogueSecurityCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfKdzU-bjxtGsCcf-d4FEQYBNrd7PpGbogU3IFxWSISX7A',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueSecurityOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ET_mtrUE-8BHqSGRgt302CYB8OY8rh1mYOwDmLybD3v1mg',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const securityTechnical: LinkData[] = [
        {
            title: strings.catalogueSecurityTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EYV496KJyh9BnYymU2B3d9kBvX_9Zo1wHkOJnynT9CTTBQ',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const securityRapidResponse: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'securityManagement',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueSecurityTitle}
            description={strings.catalogueSecurityDescription}
        >
            <SurgeCardContainer
                heading={strings.rapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.securityRoleProfilesTitle}
                    data={securityRoleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.securityTechnicalTitle}
                    description={strings.securityTechnicalDescription}
                    data={securityTechnical}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.securityServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.securityRapidResponseTitle}
                    data={securityRapidResponse}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'CatalogueSecurity';
