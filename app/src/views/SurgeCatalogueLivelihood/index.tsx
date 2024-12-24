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
            title: strings.catalogueLivelihoodCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfES4Wzw9FhMuuheDrmLAgUB6hOMdb4Q_PxRvZNHI4PS9g',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueLivelihoodOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed_cp5Q9QVhBvX4Z2Awb0tYBirpsEI4ApLByl_X3HBX8eA',
            external: true,
            withLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'surgeCatalogueLivelihoodServices',
            withLinkIcon: true,
        },
    ];

    const resourceCenterData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.livelihoodscentre.org/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const toolboxData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.livelihoodscentre.org/toolbox-intro/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const indicatorData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.livelihoodscentre.org/indi/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const householdData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.livelihoodscentre.org/documents/20720/100145/HES_Guidelines+3.0+(2014)/92cb5220-9278-4cd2-9fa7-1f5af063f3b7/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const guidelinesData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.livelihoodscentre.org/documents/20720/100145/IFRC+Livelihoods+Guidelines_EN.PDF/9d230644-9b02-4249-8252-0d37e79ad346',
            external: true,
            withLinkIcon: true,
        },
    ];

    const foodSecurityData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.ifrc.org/Global/global-fsa-guidelines-en.pdf',
            external: true,
            withLinkIcon: true,
        },
    ];

    const centerData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            href: 'https://www.livelihoodscentre.org/list-training',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalCompetencyFrameworkItemTitle,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETttjfpzsjdDrxWaSf7hP3ABQ4zRPhN1zDrNWS5drKTNJw',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueLivelihoodTitle}
            description={strings.catalogueLivelihoodDetail}
        >
            <SurgeCardContainer
                heading={strings.catalogueLivelihoodRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalCompetencyFramework}
                    data={frameworkData}
                    description={strings.technicalCompetencyFrameworkDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueLivelihoodServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodServicesRapidResponse}
                    data={emergencyResponseData}
                    description={strings.catalogueLivelihoodServicesTitle}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueAdditionalResources}
            >
                <CatalogueInfoCard
                    title={strings.catalogueIFRCLivelihoodsResourceCenter}
                    data={resourceCenterData}
                    description={strings.catalogueIFRCLivelihoodsResourceCenterDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodsToolbox}
                    data={toolboxData}
                    description={strings.catalogueLivelihoodsToolboxDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodsIndicators}
                    data={indicatorData}
                    description={strings.catalogueLivelihoodsIndicatorsDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueHouseholdEconomicsSecurity}
                    data={householdData}
                    description={strings.catalogueHouseholdEconomicsSecurityDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodsGuidelines}
                    data={guidelinesData}
                    description={strings.catalogueLivelihoodsGuidelinesDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodsFoodSecurity}
                    data={foodSecurityData}
                    description={strings.catalogueLivelihoodsFoodSecurityDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodsResource}
                    data={centerData}
                    description={strings.catalogueLivelihoodsResourceDescription}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueLivelihood';
