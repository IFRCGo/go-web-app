import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const eruSmall: LinkData[] = [
        {
            title: strings.basecampEruSmallTitle,
            to: 'surgeCatalogueBasecampEruSmall',
            withLinkIcon: true,
        },
    ];

    const eruMedium: LinkData[] = [
        {
            title: strings.basecampEruMediumTitle,
            to: 'surgeCatalogueBasecampEruMedium',
            withLinkIcon: true,
        },
    ];

    const eruLarge: LinkData[] = [
        {
            title: strings.basecampEruLargeTitle,
            to: 'surgeCatalogueBasecampEruLarge',
            withLinkIcon: true,
        },
    ];

    const facilityManagement: LinkData[] = [
        {
            title: strings.basecampFacilityManagementTitle,
            to: 'surgeCatalogueBasecampFacilityManagement',
            withLinkIcon: true,
        },
    ];

    const office: LinkData[] = [
        {
            title: strings.basecampOfficeTitle,
            to: 'surgeCatalogueBasecampOffice',
            withLinkIcon: true,
        },
    ];

    const welcome: LinkData[] = [
        {
            title: strings.basecampWelcomeTitle,
            to: 'surgeCatalogueBasecampWelcome',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueBasecampTitle}
            description={strings.basecampDetails}
        >
            <p>
                {resolveToComponent(
                    strings.basecampLinkOneIntro,
                    {
                        link: (
                            <Link
                                href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETxoUV5FKsRAiORGfZkhU60B5k8ULQWzA0QrHFQplNQX4A"
                                external
                                withUnderline
                                withLinkIcon
                            >
                                {strings.basecampLinkOneText}
                            </Link>
                        ),
                    },
                )}
                <br />
                {resolveToComponent(
                    strings.basecampLinkTwoIntro,
                    {
                        link: (
                            <Link
                                href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQ9p02JRIBBDr2dLmommwNgBOBeDA4JvEUGwSb7E-bprKw"
                                external
                                withUnderline
                                withLinkIcon
                            >
                                {strings.basecampLinkTwoText}
                            </Link>
                        ),
                    },
                )}
            </p>
            <SurgeCardContainer
                heading={strings.basecampServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.basecampEruSmallTitle}
                    data={eruSmall}
                    description={strings.eruSmallDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampEruMediumTitle}
                    data={eruMedium}
                    description={strings.eruMediumDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampEruLargeTitle}
                    data={eruLarge}
                    description={strings.eruLargeDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampFacilityManagementTitle}
                    data={facilityManagement}
                    description={strings.basecampFacilityManagementDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampOfficeTitle}
                    data={office}
                    description={strings.basecampOfficeDetails}
                />
                <CatalogueInfoCard
                    title={strings.basecampWelcomeTitle}
                    data={welcome}
                    description={strings.basecampWelcomeDetails}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueBasecamp';
