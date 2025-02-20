import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const rapidResponsePersonnel: LinkData[] = [
        {
            title: strings.cataloguePMERCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EagyYJ2dxJtJodnkN7u-KGABUEDjjQR8iGbFP3_BNl3Fgw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.cataloguePMEROfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ESQt4ETNFoJKlgdxpZsN-0ABhzfPBsBZzWHGnn1Cl923JA',
            external: true,
            withLinkIcon: true,
        },
    ];

    const services: LinkData[] = [
        {
            title: strings.cataloguePMEREPoA,
            to: 'surgeCataloguePmerEmergencyPlanAction',
            withLinkIcon: true,
        },
    ];

    const evaluation: LinkData[] = [
        {
            title: strings.cataloguePMERRTE,
            to: 'surgeCataloguePmerRealTimeEvaluation',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.cataloguePMERTitle}
            description={strings.cataloguePMERDetail}
        >
            <SurgeCardContainer
                heading={strings.cataloguePMERRapidHeading}
            >
                <CatalogueInfoCard
                    title={strings.cataloguePMERRoleHeading}
                    data={rapidResponsePersonnel}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.cataloguePMERServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.cataloguePMERPlanningHeading}
                    data={services}
                />
                <CatalogueInfoCard
                    title={strings.cataloguePMEREvaluation}
                    data={evaluation}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCataloguePmer';
