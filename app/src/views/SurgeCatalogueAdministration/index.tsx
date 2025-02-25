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
            title: strings.administrationRoleProfileOne,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZBuZvMv9lFGiPaObl1N9CYBzrWJfMy6kC4WxfrfsnGyAw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.administrationRoleProfileTwo,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EV6AfXJjToZGlxfswDSc_0YB3VVqNlw4ZQRL4pO0KBsbOQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.administrationRoleProfileThree,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EW0VBtdVygNHoynmE_2RX1wBcv8CiS2D9zgeBeeiTrq-9A',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueAdministrationTitle}
        >
            <SurgeContentContainer
                heading={strings.catalogueAdministrationOverview}
            >
                <div>{strings.administrationDetails}</div>
                <div>{strings.administrationContexts}</div>
                <ul>
                    <li>{strings.administrationItemOne}</li>
                    <li>{strings.administrationItemTwo}</li>
                    <li>{strings.administrationItemThree}</li>
                    <li>{strings.administrationItemFour}</li>
                    <li>{strings.administrationItemFive}</li>
                    <li>{strings.administrationItemSix}</li>
                    <li>{strings.administrationItemSeven}</li>
                </ul>
                <div>{strings.administrationFootnote}</div>
            </SurgeContentContainer>
            <SurgeCardContainer
                heading={strings.administrationRapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.administrationRoleProfiles}
                    data={roleProfiles}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueAdministration';
