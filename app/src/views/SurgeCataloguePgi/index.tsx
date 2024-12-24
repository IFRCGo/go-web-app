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
            title: strings.cataloguePGICoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EU4km4Q5WBFIltLi-YiN4oQBPyI_sGUoOKNL_thTbCc-BQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.cataloguePGIOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXAvSIocmO9HuTVxaSKchzQBajb88vIfI9_2K_Od2HN-kg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const technicalProfiles: LinkData[] = [
        {
            title: strings.cataloguePGI,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbXcICqULRhBss7nNlI-YUwB0JMTv-_fqTQlUpT2H0Cr7g',
            external: true,
            withLinkIcon: true,
        },
    ];

    const rapidResponseData: LinkData[] = [
        {
            title: strings.catalogueProtectionGender,
            to: 'surgeCataloguePgiServices',
            withLinkIcon: true,
        },
    ];

    const standardData: LinkData[] = [
        {
            title: strings.catalogueProtectionLearnMore,
            href: 'https://www.ifrc.org/document/minimum-standards-pgi-emergencies',
            external: true,
            withLinkIcon: true,
        },
    ];

    const roofData: LinkData[] = [
        {
            title: strings.catalogueProtectionLearnMore,
            href: 'https://www.ifrc.org/media/48958',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueProtection}
        >
            <SurgeCardContainer
                heading={strings.catalogueRapidResponsePersonnel}
            >
                <CatalogueInfoCard
                    title={strings.catalogueProtectionRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    description={strings.catalogueTechnicalDescription}
                    title={strings.catalogueTechnical}
                    data={technicalProfiles}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueProtectionServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueProtectionRapidResponse}
                    data={rapidResponseData}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueAdditionalResources}
            >
                <CatalogueInfoCard
                    title={strings.catalogueStandard}
                    data={standardData}
                    description={strings.catalogueStandardDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueAllUnderOneRoof}
                    data={roofData}
                    description={strings.catalogueAllUnderOneRoofDescription}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCataloguePgi';
