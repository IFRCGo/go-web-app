import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles = useMemo<LinkData[]>(() => [
        {
            title: strings.hrLinkOneCoord,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQ2XIVDyiHFGh8G27WHDgnEBxS_tdNbtzfFw6nV6HXRaag',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.hrLinkTwoOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETtWcMNEWz9LoNsUSQQSyiYBPTLLuZyur7y74Ho8l0ctxA',
            external: true,
            withLinkIcon: true,
        },
    ], [strings]);

    const frameworkData = useMemo<LinkData[]>(() => [
        {
            title: strings.hrCategoriesCompetencies,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVfz7uqjMHtFjE1JD8bd8TEBoWP_f-qIjBRQ-pkwKKDZkQ',
            external: true,
            withLinkIcon: true,
        },
    ], [strings]);

    return (
        <SurgeCatalogueContainer
            heading={strings.hrHeading}
        >
            <SurgeContentContainer
                heading={strings.hrOverview}
            >
                <div>{strings.hrOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeCardContainer
                heading={strings.rapidResponse}
            >
                <CatalogueInfoCard
                    title={strings.roleProfiles}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.hrTechnical}
                    data={frameworkData}
                    description={strings.hrTechnicalDescription}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherHumanResources';
