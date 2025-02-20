import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueLogisticsSupplyChainCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETRk5roTyxpGu2HPqfkLbpMBbeOkEaT9s9DPYZ51Noy0UQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsDeputySupplyChainCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWBCntZoaDNDnXxHgLGqvLQBkHTO2hAV2OLPk4QJNbcYow',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsMobilisationOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ea7AHGC3QQJEtSNhELN-PHMBRotlp4b9neev2QX5TQgFPQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsSupplyERUTeamLeader,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfcAEr1nBFFNk3QP8ua2jgsBBaDL0_NuHQOFg7BZupd_PA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueAirOpsOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETM7ujekPvNJoWcbtS6RInABsV_dyosFDLoPWWt_MAUduQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueCashLogisticsOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZpGoAagDcdMg2ZNaMBU490BowF4HzWtRsB7R0ICoTCm0w',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueFleetOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EcGXWeVvcDhHmoN7oNC0_OYB58AaKzD_vCv_-Elio2bn0g',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EcO7pbdSG4tFsqiCFfPqs1cBdymaJMSB08kw7QWMyMeIgA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueMedicalLogisticsOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfqRwUiHJVFMvhyQyUa9E7ABceClyPx8tsqhMBL9skqDjQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.cataloguePipelineOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ET-zqWDMVgpAqlviy2ZNXNkBndCVtu0vj2cfFXVbSkc4wA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueProcurementOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUKgWdUOCLNAu0qEJmlUdUwBfnrU12iYljd4dB1VCifrLg',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueLogisticsSupplyChainAdminOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVisch-yFKNFjnr3YyQvsVYBN_lXDoGSsy_WDqT1Gr9_Ww',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.catalogueWarehouseOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ERrzk5zy9TNKp6GUOlJqJ0QBhVUFo18-n7sW4MwE5vKDFw',
            external: true,
            withLinkIcon: true,
        },
    ];

    const technicalCompetency: LinkData[] = [
        {
            title: strings.catalogueLogisticsFramework,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb3r3PF2eWpAk_tNLRQwyHoB_zJJRYshXYw9Kd3YSwrNjQ',
            external: true,
            withLinkIcon: true,
        },
    ];

    const emergencyResponseData: LinkData[] = [
        {
            title: strings.catalogueLogisticsLogistic,
            to: 'surgeCatalogueLogisticsEru',
            withLinkIcon: true,
        },
    ];

    const nationalSocieties: LinkData[] = [
        {
            title: strings.catalogueLogisticsNS,
            to: 'surgeCatalogueLogisticsLpscmNs',
            withLinkIcon: true,
        },
    ];

    const logisticsStandards: LinkData[] = useMemo(() => ([
        {
            title: strings.catalogueLogisticsStandardTitle,
            href: 'https://fednet.ifrc.org/en/resources/logistics/logistics-standards-and-tools/lso/',
            external: true,
            withLinkIcon: true,
        },
    ]), [
        strings.catalogueLogisticsStandardTitle,
    ]);

    const standardsProducts: LinkData[] = useMemo(() => ([
        {
            title: strings.catalogueLogisticsStandardProductsDetailLink,
            href: 'https://itemscatalogue.redcross.int/',
            external: true,
            withLinkIcon: true,
        },
    ]), [
        strings.catalogueLogisticsStandardProductsDetailLink,
    ]);

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueLogisticsTitle}
            description={strings.catalogueLogisticsDetail}
        >
            <SurgeCardContainer
                heading={strings.catalogueLogisticsRoleHeading}
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
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueLogisticsServices}
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
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueAdditionalResources}
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
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueLogistics';
