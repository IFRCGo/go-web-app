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
            title: strings.communityEngagementCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZVuH1YHpyhBmk4FqGvLjGwBzn3NrfPHQSbFJ6saNUUdeA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communityEngagementOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ES9FRfhJCYhBglzjsHm84pYBKlo6qMx-kyQILQntuTt5aw',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalFrameworkCEA,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Edrjy2fp-NpKslCklWup1BkBI_JykrE0ouEDwoysoekCyg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const ceaData: LinkData[] = [
        {
            title: strings.ifrcCEA,
            href: 'https://www.ifrc.org/CEA',
            external: true,
            withLinkIcon: true,
        },
    ];

    const ceaHubData: LinkData[] = [
        {
            title: strings.ceaHubData,
            href: 'https://www.communityengagementhub.org/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const ceaServicesData: LinkData[] = [
        {
            title: strings.ceaLearnMore,
            to: 'surgeCatalogueCommunityEngagementRapidResponse',
            withLinkIcon: true,
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

Component.displayName = 'SurgeCatalogueCommunityEngagement';
