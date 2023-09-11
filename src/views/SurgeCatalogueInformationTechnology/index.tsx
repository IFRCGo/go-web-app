import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueITCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EdRtpzYtoFhNnrXHDiEc74ABKv7njX3cz1-jPl1SxWqWSg',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueITOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETEdR5wmWSdHqw2o2nJRMeYBN9M7VZBZJ5blIgn67vFdzQ',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueITLearnMore,
            to: 'surgeCatalogueInformationTechnologyEruItTelecom',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueITTitle}
            description={strings.catalogueITDetail}
        >
            <SurgeCardContainer
                heading={strings.catalogueITRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueITRoleTitle}
                    data={roleProfiles}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueITServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueITServicesTitle}
                    data={emergencyResponseData}
                    description={strings.catalogueITServicesDetail}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationTechnology';
