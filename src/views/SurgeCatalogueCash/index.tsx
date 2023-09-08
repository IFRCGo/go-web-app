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
            to: 'cashAndVoucherAssistance',
            withForwardIcon: true,
        },
    ];

    const cashInEmergencyToolkitData: LinkData[] = [
        {
            title: strings.cashInEmergencyToolkitTitle,
            to: 'https://www.cash-hub.org/guidance-and-tools/cash-in-emergencies-toolkit',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const cashHubData: LinkData[] = [
        {
            title: strings.cashHubTitle,
            to: 'https://cash-hub.org/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.cashAndVoucherAssistanceCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EY4PZ_4Zt01AkY8aAyTD_84BJIYbk78-E9lu310swDYeZg',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.cashAndVoucherAssistanceOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb-QC0lSSSVKkcqqGs1uER4BSlltRKy-prrfR0AAxg4cpQ',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.cashAndVoucherAssistanceImOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ec5qjRdtWQRDkIgNhvtPbHIByntzDCXX1dyPLVQhojvMsQ',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalFrameworkCVA,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUuruzZd9bZDmMjeTqWsKHMBgXywwtj586i7nN6LNI9pow',
            external: true,
            withExternalLinkIcon: true,
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
