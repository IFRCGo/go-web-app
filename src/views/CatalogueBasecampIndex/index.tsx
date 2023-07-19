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
        basecampEruSmall: basecampEruSmallRoute,
        basecampEruMedium: basecampEruMediumRoute,
        basecampEruLarge: basecampEruLargeRoute,
        basecampFacilityManagement: basecampFacilityManagementRoute,
    } = useContext(RouteContext);

    const eruSmall: LinkData[] = [
        {
            title: strings.basecampEruSmallTitle,
            to: generatePath(basecampEruSmallRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const eruMedium: LinkData[] = [
        {
            title: strings.basecampEruMediumTitle,
            to: generatePath(basecampEruMediumRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const eruLarge: LinkData[] = [
        {
            title: strings.basecampEruLargeTitle,
            to: generatePath(basecampEruLargeRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const facilityManagement: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(basecampFacilityManagementRoute.absolutePath),
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

Component.displayName = 'CatalogueBasecampIndex';
