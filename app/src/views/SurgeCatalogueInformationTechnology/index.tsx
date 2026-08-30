import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueITCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EdRtpzYtoFhNnrXHDiEc74ABKv7njX3cz1-jPl1SxWqWSg',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueITOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETEdR5wmWSdHqw2o2nJRMeYBN9M7VZBZJ5blIgn67vFdzQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueDSCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/IQDtrX8gMjdPQ4CMfMroIj9VAQgZdzBve91RXBjev0Ir7BY',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueDSOfficer,
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

    const serviceCatalogue: LinkData[] = [
        {
            title: strings.catalogueITLearnMore,
            href: 'https://ifrcorg.sharepoint.com/:x:/s/IFRCSharing/IQCpBcABvCW2QL8fMGKx8LgJAaNW93UtuO5ClLNovfwWxFA',
            external: true,
            withLinkIcon: true,
        },
    ];

    const jobAids: LinkData[] = [
        {
            title: strings.catalogueITLearnMore,
            href: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/IgAn2xGtgTc4QauHXK-0Su09AQbWhFUJJL58mUrrp4GNWrg',
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
                <b>{strings.catalogueITTDetailBold}</b>
                {strings.catalogueITTDetail}
            </p>
            <p>
                <b>{strings.catalogueITDDetailBold}</b>
                {strings.catalogueITDDetail}
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
                <CatalogueInfoCard
                    title={strings.catalogueITServiceCatalogue}
                    data={serviceCatalogue}
                />
                <CatalogueInfoCard
                    title={strings.catalogueITJobAids}
                    data={jobAids}
                />
            </SurgeCardContainer>

        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationTechnology';
