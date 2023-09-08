import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const reliefTechnical: LinkData[] = [
        {
            title: strings.catalogueReliefTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfyJmGf6d9NEniDFNg3KqAMBK9J0_iE2Ff-hAdR4HGJKgw',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const reliefEmergency: LinkData[] = [
        {
            title: strings.eruReliefTitle,
            to: 'catalogueERURelief',
            withForwardIcon: true,
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
