import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const eruSmall: LinkData[] = [
        {
            title: strings.basecampEruSmallTitle,
            to: 'basecampEruSmall',
            withForwardIcon: true,
        },
    ];

    const eruMedium: LinkData[] = [
        {
            title: strings.basecampEruMediumTitle,
            to: 'basecampEruMedium',
            withForwardIcon: true,
        },
    ];

    const eruLarge: LinkData[] = [
        {
            title: strings.basecampEruLargeTitle,
            to: 'basecampEruLarge',
            withForwardIcon: true,
        },
    ];

    const facilityManagement: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'basecampFacilityManagement',
            withForwardIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueBasecampTitle}
            className={styles.catalogueBasecamp}
            childrenContainerClassName={styles.content}
        >
            <div>
                {strings.basecampDetails}
            </div>
            <Container
                heading={strings.basecampServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.basecampEruSmallTitle}
                    data={eruSmall}
                    description={strings.eruSmallDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampEruMediumTitle}
                    data={eruMedium}
                    description={strings.eruMediumDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampEruLargeTitle}
                    data={eruLarge}
                    description={strings.eruLargeDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampFacilityManagementTitle}
                    data={facilityManagement}
                    description={strings.basecampFacilityManagementDetails}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueBasecamp';
