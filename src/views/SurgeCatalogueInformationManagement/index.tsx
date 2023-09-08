import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import Image from '#components/Image';
import useTranslation from '#hooks/useTranslation';
import pyramidImage from '#assets/images/surge-im-pyramid.png';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const simsLink: LinkData[] = [
        {
            title: strings.catalogueIMServicesSimsLink,
            to: 'https://rcrcsims.org/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const userLibraryLink: LinkData[] = [
        {
            title: strings.catalogueIMUserLibraryLink,
            to: 'https://go-user-library.ifrc.org/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const koboToolboxLink: LinkData[] = [
        {
            title: strings.catalogueIMIFRCToolboxLink,
            to: 'https://www.ifrc.org/ifrc-kobo',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const deepLink: LinkData[] = [
        {
            title: strings.catalogueIMDEEPLink,
            to: 'https://deephelp.zendesk.com/auth/v2/login/signin?return_to=https%3A%2F%2Fdeephelp.zendesk.com%2Fhc%2Fen-us%2Farticles%2F360041904812-4-DEEP-Using-the-DEEP-Platform-&theme=hc&locale=en-us&brand_id=360000501911&auth_origin=360000501911%2Cfalse%2Ctrue/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueIMCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20IM%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueIMHumanitarianInformation,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20Humanitarian%20Information%20Analysis%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueIMPrimaryData,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20Primary%20Data%20Collection%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueIMMapping,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20Mapping%20and%20Visualization%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.catalogueIMAssessment,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fassessment%2FAssessment%20technical%20competency%20framework%20March%202020%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fassessment&p=true&ga=1/',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const satelliteData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementSatelliteImagery',
            withForwardIcon: true,
        },
    ];

    const roleData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementRolesResponsibility',
            withForwardIcon: true,
        },
    ];

    const ifrcRegionalData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementSupport',
            withForwardIcon: true,
        },
    ];

    const ifrcGenevaData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementOperationSupport',
            withForwardIcon: true,
        },
    ];

    const compositionData: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueInformationManagementComposition',
            withForwardIcon: true,
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
