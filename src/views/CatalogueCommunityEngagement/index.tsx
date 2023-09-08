import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.communityEngagementCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXAstfnsq_pCm5CuEyvJvysBVi-gibREICY9z0SUdu2dTQ',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.communityEngagementAccountabilityOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb48pk6Vcg1HgFH8ozFenTsB-xZemh857EM83RmEEshYUw',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.communityEngagementOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVvAq-WQHhBAn9sQ7cdrBQgB3lsiYM49ACcIStzrBO1KUA',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalFrameworkCEA,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ee1IPzmxf_1BoQProDcc86oBacCbOpO2uycPa0Y5qoRElA',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const ceaData: LinkData[] = [
        {
            title: strings.ifrcCEA,
            to: 'https://www.ifrc.org/CEA',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const ceaHubData: LinkData[] = [
        {
            title: strings.ceaHubData,
            to: 'https://www.communityengagementhub.org/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const ceaServicesData: LinkData[] = [
        {
            title: strings.ceaTitle,
            to: 'communityEngagement',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.communityEngagementTitle}
        >
            <SurgeCardContainer
                heading={strings.communityEngagementRapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.communityEngagementRoleProfiles}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalCompetencyFramework}
                    data={frameworkData}
                    description={strings.technicalCompetencyFrameworkDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.communityEngagementServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.rapidResponseTitle}
                    data={ceaServicesData}
                    description={strings.rapidResponseDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.communityEngagementAdditionalResourcesTitle}
            >
                <CatalogueInfoCard
                    title={strings.ceaTitle}
                    data={ceaData}
                    description={strings.ceaDetails}
                />
                <CatalogueInfoCard
                    title={strings.communityEngagementHubTitle}
                    data={ceaHubData}
                    description={strings.communityEngagementHubDetails}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'CatalogueCommunityEngagement';
