import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const cvaServicesData: LinkData[] = [
        {
            title: strings.cvaServicesLinkTitle,
            to: 'surgeCatalogueCashRapidResponse',
            withLinkIcon: true,
        },
    ];

    const cashInEmergencyToolkitData: LinkData[] = [
        {
            title: strings.cashInEmergencyToolkitTitle,
            href: 'https://www.cash-hub.org/guidance-and-tools/cash-in-emergencies-toolkit',
            external: true,
            withLinkIcon: true,
        },
    ];

    const cashHubData: LinkData[] = [
        {
            title: strings.cashHubTitle,
            href: 'https://cash-hub.org/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.cashAndVoucherAssistanceCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EY4PZ_4Zt01AkY8aAyTD_84BJIYbk78-E9lu310swDYeZg',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.cashAndVoucherAssistanceOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb-QC0lSSSVKkcqqGs1uER4BSlltRKy-prrfR0AAxg4cpQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.cashAndVoucherAssistanceImOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ec5qjRdtWQRDkIgNhvtPbHIByntzDCXX1dyPLVQhojvMsQ',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalFrameworkCVA,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUuruzZd9bZDmMjeTqWsKHMBgXywwtj586i7nN6LNI9pow',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueCashTitle}
            description={strings.cashDetails}
        >
            <SurgeCardContainer
                heading={strings.cashRapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.cashRoleProfiles}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalCompetencyFramework}
                    data={frameworkData}
                    description={strings.technicalCompetencyFrameworkDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.cashServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.cvaRapidResponse}
                    data={cvaServicesData}
                />
                <div />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.cashAdditionalResourcesTitle}
            >
                <CatalogueInfoCard
                    title={strings.cashInEmergencyToolkitTitle}
                    data={cashInEmergencyToolkitData}
                    description={strings.cashInEmergencyToolkitDetails}
                />
                <CatalogueInfoCard
                    title={strings.cashHubTitle}
                    data={cashHubData}
                    description={strings.cashHubDetails}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueCash';
