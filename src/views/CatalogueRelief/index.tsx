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

    const reliefTechnical: LinkData[] = [
        {
            title: strings.catalogueReliefTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfyJmGf6d9NEniDFNg3KqAMBK9J0_iE2Ff-hAdR4HGJKgw',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const reliefEmergency: LinkData[] = [
        {
            title: strings.eruReliefTitle,
            to: 'catalogueERURelief',
            withForwardIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueReliefTitle}
            className={styles.catalogueRelief}
            childrenContainerClassName={styles.content}
        >
            <div>{strings.catalogueReliefDescription}</div>
            <Container
                heading={strings.rapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.reliefTechnicalTitle}
                    description={strings.reliefTechnicalDescription}
                    data={reliefTechnical}
                />
                <div />
            </Container>
            <Container
                heading={strings.reliefServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.reliefEmergencyTitle}
                    data={reliefEmergency}
                />
                <div />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueRelief';
