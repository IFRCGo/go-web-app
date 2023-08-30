import { useContext, useMemo } from 'react';
import { generatePath } from 'react-router-dom';

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
        logisticsEmergency: logisticsEmergencyRoute,
        logisticsNationalSocieties: logisticsNationalSocietiesRoute,
    } = useContext(RouteContext);

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueLogisticsSupplyChainCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Supply%20Chain%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsSupplyERUTeamLeader,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Logistics%20ERU%20Team%20Leader%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueAirOpsOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Airops%20Officer%20%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueCashLogisticsOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Cash%20Logistics%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueFleetOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Fleet%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Logistics%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueMedicalLogisticsOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Medical%20Logistics%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.cataloguePipelineOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Logistics%20Pipeline%20Management%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueProcurementOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Procurement%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsSupplyChainAdminOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Supply%20Chain%20Admin%20Officer%20%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueWarehouseOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FRapid%20Response%20Profile%20Warehouse%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
    ];

    const technicalCompetency: LinkData[] = [
        {
            title: strings.catalogueLogisticsFramework,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs%2FIFRC%20Logistics%20Technical%20Competency%20Framework%20v%205%20%28003%29%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Flogs&p=true&ga=1',
            withExternalLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueLogisticsLogistic,
            to: generatePath(logisticsEmergencyRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const nationalSocieties: LinkData[] = [
        {
            title: strings.catalogueLogisticsNS,
            to: generatePath(logisticsNationalSocietiesRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const logisticsStandards: LinkData[] = useMemo(() => ([
        {
            title: strings.catalogueLogisticsStandardTitle,
            to: 'https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/logistics-standards-and-tools/lso/',
            withExternalLinkIcon: true,
        },
    ]), [strings]);

    const standardsProducts: LinkData[] = useMemo(() => ([
        {
            title: strings.catalogueLogisticsStandardProductsDetailLink,
            to: 'https://itemscatalogue.redcross.int/',
            withExternalLinkIcon: true,
        },
    ]), [strings]);

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueLogisticsTitle}
            className={styles.logistics}
            childrenContainerClassName={styles.content}
        >
            <div>{strings.catalogueLogisticsDetail}</div>
            <Container
                heading={strings.catalogueLogisticsRoleHeading}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLogisticsRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    description={strings.catalogueCompetencyFrameworkDescription}
                    title={strings.catalogueCompetencyFramework}
                    data={technicalCompetency}
                />
            </Container>
            <Container
                heading={strings.catalogueLogisticsServices}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLogisticsEmergencyResponseUnit}
                    data={emergencyResponseData}
                    description={strings.catalogueLogisticsEmergencyDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLogisticsServices}
                    data={nationalSocieties}
                    description={strings.catalogueLogisticsServicesDetail}
                />
            </Container>
            <Container
                heading={strings.catalogueAdditionalResources}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueLogisticsStandard}
                    data={logisticsStandards}
                />
                <CatalogueInfoCard
                    title={strings.catalogueLogisticsStandardProducts}
                    data={standardsProducts}
                    description={strings.catalogueLogisticsStandardProductsDetail}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueLogisticsIndex';
