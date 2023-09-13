import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const eruSmall: LinkData[] = [
        {
            title: strings.basecampEruSmallTitle,
            to: 'surgeCatalogueBasecampEruSmall',
            withLinkIcon: true,
        },
    ];

    const eruMedium: LinkData[] = [
        {
            title: strings.basecampEruMediumTitle,
            to: 'surgeCatalogueBasecampEruMedium',
            withLinkIcon: true,
        },
    ];

    const eruLarge: LinkData[] = [
        {
            title: strings.basecampEruLargeTitle,
            to: 'surgeCatalogueBasecampEruLarge',
            withLinkIcon: true,
        },
    ];

    const facilityManagement: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueBasecampFacilityManagement',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueBasecampTitle}
            description={strings.basecampDetails}
        >
            <SurgeCardContainer
                heading={strings.basecampServicesTitle}
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
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueBasecamp';
