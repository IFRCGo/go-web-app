import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const civilMilitaryData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherCivilMilitaryRelations',
            withForwardIcon: true,
        },
    ];

    const disasterRiskData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherDisasterRiskReduction',
            withForwardIcon: true,
        },
    ];

    const humanResourcesData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherHumanResources',
            withForwardIcon: true,
        },
    ];

    const internationalDisasterData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherInternationalDisasterResponseLaw',
            withForwardIcon: true,
        },
    ];

    const migrationData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherMigration',
            withForwardIcon: true,
        },
    ];

    const nsDevelopmentData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherNationalSocietyDevelopment',
            withForwardIcon: true,
        },
    ];

    const partnershipData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherPartnershipResourceDevelopment',
            withForwardIcon: true,
        },
    ];

    const preparednessData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherPreparednessEffectiveResponse',
            withForwardIcon: true,
        },
    ];

    const recoveryData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherRecovery',
            withForwardIcon: true,
        },
    ];

    const greenData: LinkData[] = [
        {
            title: strings.otherLearnMore,
            to: 'surgeCatalogueOtherGreenResponse',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.otherTitle}
        >
            <div>{strings.otherDetail}</div>
            <SurgeCardContainer
                heading={strings.otherAdditionalServicesHeading}
            >
                <CatalogueInfoCard
                    title={strings.otherCivilMilitaryRelations}
                    data={civilMilitaryData}
                    description={strings.otherCivilMilitaryRelationsDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherDisaster}
                    data={disasterRiskData}
                    description={strings.otherDisasterDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherHuman}
                    data={humanResourcesData}
                    description={strings.otherHumanDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherInternational}
                    data={internationalDisasterData}
                    description={strings.otherInternationalDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherMigration}
                    data={migrationData}
                    description={strings.otherMigrationDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherNSDevelopment}
                    data={nsDevelopmentData}
                    description={strings.otherNSDevelopmentDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherPartnership}
                    data={partnershipData}
                    description={strings.otherPartnershipDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherPreparedness}
                    data={preparednessData}
                    description={strings.otherPreparednessDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherRecovery}
                    data={recoveryData}
                    description={strings.otherRecoveryDetail}
                />
                <CatalogueInfoCard
                    title={strings.otherGreen}
                    data={greenData}
                    description={strings.otherGreenDetail}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOther';
