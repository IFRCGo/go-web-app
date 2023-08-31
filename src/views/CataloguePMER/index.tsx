import CatalogueInfoCard,
{
    type LinkData,
} from '#components/CatalogueInfoCard';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const rapidResponsePersonnel: LinkData[] = [
        {
            title: strings.cataloguePMERCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EagyYJ2dxJtJodnkN7u-KGABUEDjjQR8iGbFP3_BNl3Fgw',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.cataloguePMEROfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ESQt4ETNFoJKlgdxpZsN-0ABhzfPBsBZzWHGnn1Cl923JA',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const services: LinkData[] = [
        {
            title: strings.cataloguePMEREPoA,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EagyYJ2dxJtJodnkN7u-KGABUEDjjQR8iGbFP3_BNl3Fgw',
            withForwardIcon: true,
        },
    ];

    const evaluation: LinkData[] = [
        {
            title: strings.cataloguePMERRTE,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EagyYJ2dxJtJodnkN7u-KGABUEDjjQR8iGbFP3_BNl3Fgw',
            withForwardIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.cataloguePMERTitle}
        >
            <div>{strings.cataloguePMERDetail}</div>
            <Container
                heading={strings.cataloguePMERRapidHeading}
                withHeaderBorder
            >
                <CatalogueInfoCard
                    title={strings.cataloguePMERRoleHeading}
                    data={rapidResponsePersonnel}
                />
            </Container>
            <Container
                heading={strings.cataloguePMERServicesHeading}
                withHeaderBorder
            >
                <CatalogueInfoCard
                    title={strings.cataloguePMERPlanningHeading}
                    data={services}
                />
                <CatalogueInfoCard
                    title={strings.cataloguePMEREvaluation}
                    data={evaluation}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'CataloguePMER';
