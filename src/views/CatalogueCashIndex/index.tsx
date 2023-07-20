import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        catalogueCVA: catalogueCVARoute,
    } = useContext(RouteContext);

    const cvaServicesData: LinkData[] = [
        {
            title: strings.cvaTitleShort,
            to: generatePath(catalogueCVARoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const cashInEmergencyToolkitData: LinkData[] = [
        {
            title: strings.cashInEmergencyToolkitTitle,
            to: 'https://www.cash-hub.org/guidance-and-tools/cash-in-emergencies-toolkit',
            withExternalLinkIcon: true,
        },
    ];

    const cashHubData: LinkData[] = [
        {
            title: strings.cashHubTitle,
            to: 'https://cash-hub.org/',
            withExternalLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.cashAndVoucherAssitanceCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EY4PZ_4Zt01AkY8aAyTD_84BJIYbk78-E9lu310swDYeZg',
            withExternalLinkIcon: true,
        },
        {
            title: strings.cashAndVoucherAssitanceOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb-QC0lSSSVKkcqqGs1uER4BSlltRKy-prrfR0AAxg4cpQ',
            withExternalLinkIcon: true,
        },
        {
            title: strings.cashAndVoucherAssitanceImOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ec5qjRdtWQRDkIgNhvtPbHIByntzDCXX1dyPLVQhojvMsQ',
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalFrameworkCVA,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUuruzZd9bZDmMjeTqWsKHMBgXywwtj586i7nN6LNI9pow',
            withExternalLinkIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueCashTitle}
            className={styles.catalogueCash}
            childrenContainerClassName={styles.content}
        >
            <div>
                {strings.cashDetails}
            </div>
            <Container
                heading={strings.cashRapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.cashServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.cvaTitle}
                    data={cvaServicesData}
                />
                <div />
            </Container>
            <Container
                heading={strings.cashAdditionalResourcesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueCashIndex';
