import { Image } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import pyramidImage from '#assets/images/surge-im-pyramid.png';
import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const simsLink: LinkData[] = [
        {
            title: strings.catalogueIMServicesSimsLink,
            href: 'https://rcrcsims.org/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const userLibraryLink: LinkData[] = [
        {
            title: strings.catalogueIMUserLibraryLink,
            href: 'https://go-user-library.ifrc.org/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const koboToolboxLink: LinkData[] = [
        {
            title: strings.catalogueIMIFRCToolboxLink,
            href: 'https://www.ifrc.org/ifrc-kobo',
            external: true,
            withLinkIcon: true,
        },
    ];

    const deepLink: LinkData[] = [
        {
            title: strings.catalogueIMDEEPLink,
            href: 'https://deephelp.zendesk.com/auth/v2/login/signin?return_to=https%3A%2F%2Fdeephelp.zendesk.com%2Fhc%2Fen-us%2Farticles%2F360041904812-4-DEEP-Using-the-DEEP-Platform-&theme=hc&locale=en-us&brand_id=360000501911&auth_origin=360000501911%2Cfalse%2Ctrue/',
            external: true,
            withLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueIMCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ea_YRhCI_IJHkhISEh5zH2YBCUtMAdWUqiC8JH7g1Jj8AQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueIMHumanitarianInformation,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EYUNi8qR395Oq3Ng3SHbsXMBUbS4XdfVw03tECGEb828Nw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueIMPrimaryData,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EdB7tgvjH5dApy5PcFNZcx0BzGKQJfS2nP-L3CFKRdr5Ow',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueIMMapping,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ER92aBZKBpxHrH61MJf4hLEBxwEnqzfqjLVR7cscPlxDKA',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.catalogueIMIM,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EgH4I6LxIMBFtkWGT8ROqegBc1rVqsgiPkxvVy_a-8qKZw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueIMAssessment,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbmgwMFvUHtFkkc26GZhAo0BIuwI2UWSkrFyehAq7ZfT6g',
            external: true,
            withLinkIcon: true,
        },
    ];

    const satelliteData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementSatelliteImagery',
            withLinkIcon: true,
        },
    ];

    const roleData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementRolesResponsibility',
            withLinkIcon: true,
        },
    ];

    const ifrcRegionalData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementRegionalOfficeSupport',
            withLinkIcon: true,
        },
    ];

    const ifrcGenevaData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementGenevaSupport',
            withLinkIcon: true,
        },
    ];

    const compositionData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementComposition',
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueIMTitle}
            description={(
                <>
                    <div>{strings.catalogueIMDetailTextOne}</div>
                    <div>{strings.catalogueIMDetailTextTwo}</div>
                    <div>{strings.catalogueIMDetailTextThree}</div>
                    <div>{strings.catalogueIMDetailTextFour}</div>
                    <Image
                        src={pyramidImage}
                        alt="Information Management"
                    />
                </>
            )}
        >
            <SurgeCardContainer
                heading={strings.catalogueIMRapidResponsePersonnel}
            >
                <CatalogueInfoCard
                    title={strings.catalogueIMRoleProfile}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMTechnical}
                    data={frameworkData}
                    description={strings.catalogueIMTechnicalDescription}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueIMServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.catalogueIMServicesSims}
                    data={simsLink}
                    description={strings.catalogueIMServicesDetails}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMServicesSatelliteImagery}
                    data={satelliteData}
                    description={strings.catalogueIMServicesSatelliteImageryDescription}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueIMAdditionalResourcesTitle}
            >
                <CatalogueInfoCard
                    title={strings.catalogueIMRole}
                    data={roleData}
                    description={strings.catalogueIMRoleDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMRegionalOffice}
                    data={ifrcRegionalData}
                    description={strings.catalogueIMRegionalOfficeDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMIFRCGeneva}
                    data={ifrcGenevaData}
                    description={strings.catalogueIMIFRCGenevaDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMComposition}
                    data={compositionData}
                    description={strings.catalogueIMCompositionDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMUserLibrary}
                    data={userLibraryLink}
                    description={strings.catalogueIMUserLibraryDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMIFRCToolbox}
                    data={koboToolboxLink}
                    description={strings.catalogueIMIFRCToolboxDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueIMDEEP}
                    data={deepLink}
                    description={strings.catalogueIMDeepDescription}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationManagement';
