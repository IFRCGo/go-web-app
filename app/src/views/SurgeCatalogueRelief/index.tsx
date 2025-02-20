import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const reliefTechnical: LinkData[] = [
        {
            title: strings.catalogueReliefTitle,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfyJmGf6d9NEniDFNg3KqAMBK9J0_iE2Ff-hAdR4HGJKgw',
            external: true,
            withLinkIcon: true,
        },
    ];

    const reliefEmergency: LinkData[] = [
        {
            title: strings.eruReliefTitle,
            to: 'surgeCatalogueReliefEru',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueReliefTitle}
            description={strings.catalogueReliefDescription}
        >
            <SurgeCardContainer
                heading={strings.rapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.reliefTechnicalTitle}
                    description={strings.reliefTechnicalDescription}
                    data={reliefTechnical}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.reliefServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.reliefEmergencyTitle}
                    data={reliefEmergency}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueRelief';
