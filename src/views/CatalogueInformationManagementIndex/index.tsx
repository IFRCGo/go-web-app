import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import pyramidLogo from '#assets/images/pyramid.png';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        informationManagementSatelliteImagery: informationManagementSatelliteImageryRoute,
        informationManagementRoles: informationManagementRolesRoute,
        informationManagementSupport: informationManagementSupportRoute,
        informationManagementOperationsSupport: informationManagementOperationsSupportRoute,
        informationManagementComposition: informationManagementCompositionRoute,
    } = useContext(RouteContext);

    const simsLink: LinkData[] = [
        {
            title: strings.catalogueIMServicesSimsLink,
            to: 'https://rcrcsims.org/',
            withExternalLinkIcon: true,
        },
    ];

    const userLibraryLink: LinkData[] = [
        {
            title: strings.catalogueIMUserLibraryLink,
            to: 'https://go-user-library.ifrc.org/',
            withExternalLinkIcon: true,
        },
    ];

    const koboToolboxLink: LinkData[] = [
        {
            title: strings.catalogueIMIFRCToolboxLink,
            to: 'https://www.ifrc.org/ifrc-kobo',
            withExternalLinkIcon: true,
        },
    ];

    const deepLink: LinkData[] = [
        {
            title: strings.catalogueIMDEEPLink,
            to: 'https://deephelp.zendesk.com/auth/v2/login/signin?return_to=https%3A%2F%2Fdeephelp.zendesk.com%2Fhc%2Fen-us%2Farticles%2F360041904812-4-DEEP-Using-the-DEEP-Platform-&theme=hc&locale=en-us&brand_id=360000501911&auth_origin=360000501911%2Cfalse%2Ctrue/',
            withExternalLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueIMCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20IM%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueIMHumanitarianInformation,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20Humanitarian%20Information%20Analysis%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueIMPrimaryData,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20Primary%20Data%20Collection%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueIMMapping,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim%2FRapid%20Response%20Profile%20Mapping%20and%20Visualization%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fim&p=true&ga=1/',
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.catalogueIMAssessment,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fassessment%2FAssessment%20technical%20competency%20framework%20March%202020%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fassessment&p=true&ga=1/',
            withExternalLinkIcon: true,
        },
    ];

    const satelliteData: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(informationManagementSatelliteImageryRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const roleData: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(informationManagementRolesRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const ifrcRegionalData: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(informationManagementSupportRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const ifrcGenevaData: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(informationManagementOperationsSupportRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const compositionData: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(informationManagementCompositionRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueIMTitle}
            className={styles.informationManagement}
            childrenContainerClassName={styles.content}
        >
            <div>{strings.catalogueIMDetailTextOne}</div>
            <div>{strings.catalogueIMDetailTextTwo}</div>
            <div>{strings.catalogueIMDetailTextThree}</div>
            <div>{strings.catalogueIMDetailTextFour}</div>
            <img
                className={styles.logo}
                src={pyramidLogo}
                alt="Information Management"
                width="120"
            />
            <Container
                heading={strings.catalogueIMRapidResponsePersonnel}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.catalogueIMServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.catalogueIMAdditionalResourcesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueInformationManagementIndex';
