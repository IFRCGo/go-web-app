import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import CatalogueInfoCard,
{
    type LinkData,
} from '#components/CatalogueInfoCard';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
        <Container
            headingLevel={2}
            heading={strings.catalogueSecurityTitle}
            className={styles.catalogueSecurity}
            childrenContainerClassName={styles.content}
        >
            <div>{strings.catalogueSecurityDescription}</div>
            <Container
                heading={strings.rapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.securityServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.securityRapidResponseTitle}
                    data={securityRapidResponse}
                />
                <div />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueSecurity';
