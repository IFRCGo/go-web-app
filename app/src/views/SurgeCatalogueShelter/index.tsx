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
            title: strings.catalogueShelterProgrammeCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EYHx8KJbzVxIqAwtECnKMFcBNXyLPfKyn73kN1mTPBCKJQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueShelterProgrammeLeader,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EY7PPODOBZtPjywd_TVgFEcBmd3r0IAQj-6FKEz4tO00zA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueShelterProgrammeTechnical,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUBrQE-_aatMvfUaBR69XWMBMuR6n3YEFoUgyhbsOayvhQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueClusterCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXP0VQ7Tpn1Er_QH8bOk-IYBdqlK7oVvx470Vi9v-7YNAg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const technicalData: LinkData[] = [
        {
            title: strings.catalogueShelterAndSettlement,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXP0VQ7Tpn1Er_QH8bOk-IYBdqlK7oVvx470Vi9v-7YNAg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const catalogueServiceShelter: LinkData[] = [
        {
            title: strings.catalogueServiceShelterLink,
            to: 'surgeCatalogueShelterCoordinatorTeam',
            withLinkIcon: true,
        },
    ];

    const catalogueServiceCoordinator: LinkData[] = [
        {
            title: strings.catalogueShelterProgrammingLink,
            to: 'surgeCatalogueShelterTechnicalTeam',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueShelterTitle}
            description={strings.catalogueShelterDetail}
        >
            <SurgeCardContainer
                heading={strings.catalogueShelterRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueShelterRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.catalogueShelterTechnicalFrameworkTitle}
                    data={technicalData}
                    description={strings.catalogueShelterTechnicalFrameworkDetail}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueShelterServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueServiceShelter}
                    data={catalogueServiceShelter}
                />
                <CatalogueInfoCard
                    title={strings.catalogueShelterProgramming}
                    data={catalogueServiceCoordinator}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueShelter';
