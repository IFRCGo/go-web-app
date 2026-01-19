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
            title: strings.catalogueITCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/IQDtrX8gMjdPQ4CMfMroIj9VAQgZdzBve91RXBjev0Ir7BY',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueITOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/IQDoLWIUDOKdRIsqiiBaS_kLASSE6xwghl5ppP1WbXQJVeg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.catalogueITTechnical,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/IQDLuy0m_QmhSpBry1BRyOVlAefldFleoJ3iS0p8kkdfH3w',
            external: true,
            withLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueITLearnMore,
            to: 'surgeCatalogueInformationTechnologyEruItTelecom',
            withLinkIcon: true,
        },
    ];

    const rolesResponsibilities: LinkData[] = [
        {
            title: strings.catalogueITLearnMore,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/IQCgKsew7QmAR4hyhgzth85EAe9viC7zXFpjvbwwieorq9E',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueITTitle}
            description={strings.catalogueITIntro}
        >
            <p>
                <b>{strings.catalogueITTDetail.slice(0, 34)}</b>
                {strings.catalogueITTDetail.slice(34)}
            </p>
            <p>
                <b>{strings.catalogueITDDetail.slice(0, 14)}</b>
                {strings.catalogueITDDetail.slice(14)}
            </p>
            <SurgeCardContainer
                heading={strings.catalogueITRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueITRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.catalogueITTechnical}
                    data={frameworkData}
                    description={strings.catalogueITTechnicalDescription}
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
            <SurgeCardContainer
                heading={strings.catalogueITAdditionalResourcesTitle}
            >
                <CatalogueInfoCard
                    title={strings.catalogueITRole}
                    data={rolesResponsibilities}
                    description={strings.catalogueITRoleDescription}
                />
            </SurgeCardContainer>

        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationTechnology';
