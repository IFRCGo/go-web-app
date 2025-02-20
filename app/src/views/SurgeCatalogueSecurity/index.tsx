import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const securityRoleProfiles : LinkData[] = [
        {
            title: strings.catalogueSecurityCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfKdzU-bjxtGsCcf-d4FEQYBNrd7PpGbogU3IFxWSISX7A',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueSecurityOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ET_mtrUE-8BHqSGRgt302CYB8OY8rh1mYOwDmLybD3v1mg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const securityTechnical: LinkData[] = [
        {
            title: strings.catalogueSecurityTitle,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EYV496KJyh9BnYymU2B3d9kBvX_9Zo1wHkOJnynT9CTTBQ',
            external: true,
            withLinkIcon: true,
        },
    ];

    const securityRapidResponse: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueSecurityManagement',
            withLinkIcon: true,
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

Component.displayName = 'SurgeCatalogueSecurity';
