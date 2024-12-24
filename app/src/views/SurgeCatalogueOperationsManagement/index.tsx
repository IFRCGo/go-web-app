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
            title: strings.catalogueOperationHead,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXmRSeiCej5FlHSHdKs_n6IBvNwGxdq8CgtcLJylpx6bLw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueOperationsManager,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWrzsdwVG6pEhbhNv5PlsDEBLSaG5q6YFqPKFTBGlKHQoQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueDeputyOperationsManager,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVvCVFM_cU1Ouwt6iymFoM0Bmj2JPD6NM0UpBm8hXsrirA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueFieldCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ESBim_zWozdBh09lcTgzHPYBhIWBQ0PSGwttOhirgja1XA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueCoordinatorOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbdT87auio1KuOgx6Ibkb4MBxM7Al1a36Jm_RR0DGA_vnQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueRecoveryCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVN6HhU7YJxOilcAxOGWiLwBxyAZhqJlgYmMw7OFdPPD2w',
            external: true,
            withLinkIcon: true,
        },
    ];

    const servicesData: LinkData[] = [
        {
            title: strings.catalogueOperationLearnMore,
            to: 'surgeCatalogueOperationManagementHeops',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueOperationTitle}
        >
            <SurgeCardContainer
                heading={strings.catalogueOperationRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueOperationRoleTitle}
                    data={roleProfiles}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.catalogueRapidResponse}
                    data={servicesData}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOperationsManagement';
