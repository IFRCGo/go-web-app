import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        livelihoodServices: livelihoodServicesRoute,
    } = useContext(RouteContext);

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueLivelihoodCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/_layouts/15/AccessDenied.aspx?Source=https%3A%2F%2Fifrcorg.sharepoint.com%2Fsites%2FIFRCSharing%2FShared%2520Documents%2FForms%2FAllItems.aspx%3Fid%3D%252Fsites%252FIFRCSharing%252FShared%2520Documents%252FGLOBAL%2520SURGE%252FCatalogue%2520of%2520Surge%2520services%2520%2528final%2529%252Flivelihoods%252FRapid%2520Response%2520Profile%2520Livelihoods%2520and%2520Basic%2520Needs%2520Coordinator%252Epdf%26parent%3D%252Fsites%252FIFRCSharing%252FShared%2520Documents%252FGLOBAL%2520SURGE%252FCatalogue%2520of%2520Surge%2520services%2520%2528final%2529%252Flivelihoods%26p%3Dtrue%26ga%3D1&Type=list&correlation=a244d5a0-60ad-7000-32a6-7f3dd4d91a1f',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueLivelihoodOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flivelihoods%2FRapid%20Response%20Profile%20Livelihoods%20and%20Basic%20Needs%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flivelihoods&p=true&ga=1',
            withExternalLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: generatePath(livelihoodServicesRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const resourceCenterData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://www.livelihoodscentre.org/',
            withExternalLinkIcon: true,
        },
    ];

    const toolboxData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://www.livelihoodscentre.org/toolbox-intro/',
            withExternalLinkIcon: true,
        },
    ];

    const indicatorData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://www.livelihoodscentre.org/indi/',
            withExternalLinkIcon: true,
        },
    ];

    const householdData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://www.livelihoodscentre.org/documents/20720/100145/HES_Guidelines+3.0+(2014)/92cb5220-9278-4cd2-9fa7-1f5af063f3b7/',
            withExternalLinkIcon: true,
        },
    ];

    const guidelinesData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://www.livelihoodscentre.org/documents/20720/100145/IFRC+Livelihoods+Guidelines_EN.PDF/9d230644-9b02-4249-8252-0d37e79ad346',
            withExternalLinkIcon: true,
        },
    ];

    const foodSecurityData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://go-stage.ifrc.org/deployments/catalogue/livelihoods',
            withExternalLinkIcon: true,
        },
    ];

    const centerData: LinkData[] = [
        {
            title: strings.catalogueLivelihoodLearnMore,
            to: 'https://www.livelihoodscentre.org/list-training',
            withExternalLinkIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueLivelihoodTitle}
            className={styles.livelihood}
            childrenContainerClassName={styles.content}
        >
            <div>{strings.catalogueLivelihoodDetail}</div>
            <Container
                heading={strings.catalogueLivelihoodRoleHeading}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodRoleTitle}
                    data={roleProfiles}
                />
            </Container>
            <Container
                heading={strings.catalogueLivelihoodServicesHeading}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLivelihoodServicesRapidResponse}
                    data={emergencyResponseData}
                    description={strings.catalogueLivelihoodServicesTitle}
                />
            </Container>
            <Container
                heading={strings.catalogueAdditionalResources}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueLivelihoodIndex';
