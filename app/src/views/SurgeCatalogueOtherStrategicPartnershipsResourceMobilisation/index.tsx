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

    const roleProfiles: LinkData[] = [
        {
            title: strings.linkOne,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbNoFYfsY0lIk8nJpabCzgkBCaEmXftIVcLjcQu2rvm7EA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.linkTwo,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EaYOwWRnsulCntS67s2NMAAB2YOyhxyD_0Z9nDeDiYakqw',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.partnershipHeading}
        >
            <SurgeContentContainer
                heading={strings.otherOverview}
            >
                <div>{strings.otherOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeCardContainer
                heading={strings.catalogueRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueRoleTitle}
                    data={roleProfiles}
                />
            </SurgeCardContainer>

        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherStrategicPartnershipsResourceMobilisation';
