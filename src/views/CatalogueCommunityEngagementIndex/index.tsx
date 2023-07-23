import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        communityEngagement: communityEngagementRoute,
    } = useContext(RouteContext);

    const roleProfiles: LinkData[] = [
        {
            title: strings.communityEngagementCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXAstfnsq_pCm5CuEyvJvysBVi-gibREICY9z0SUdu2dTQ',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communityEngagementAccountabilityOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb48pk6Vcg1HgFH8ozFenTsB-xZemh857EM83RmEEshYUw',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communityEngagementOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVvAq-WQHhBAn9sQ7cdrBQgB3lsiYM49ACcIStzrBO1KUA',
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalFrameworkCEA,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ee1IPzmxf_1BoQProDcc86oBacCbOpO2uycPa0Y5qoRElA',
            withExternalLinkIcon: true,
        },
    ];

    const ceaData: LinkData[] = [
        {
            title: strings.ifrcCEA,
            to: 'https://www.ifrc.org/CEA',
            withExternalLinkIcon: true,
        },
    ];

    const ceaHubData: LinkData[] = [
        {
            title: strings.ceaHubData,
            to: 'https://www.communityengagementhub.org/',
            withExternalLinkIcon: true,
        },
    ];

    const ceaServicesData: LinkData[] = [
        {
            title: strings.ceaTitle,
            to: generatePath(communityEngagementRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.communityEngagementTitle}
            className={styles.communityEngagement}
            childrenContainerClassName={styles.content}
        >
            <Container
                heading={strings.communityEngagementRapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.communityEngagementServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.rapidResponseTitle}
                    data={ceaServicesData}
                    description={strings.rapidResponseDetails}
                />
                <div />
            </Container>
            <Container
                heading={strings.communityEngagementAdditionalResourcesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueCommunityEngagementIndex';
