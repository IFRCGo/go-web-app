import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const clinic: LinkData[] = [
        {
            title: strings.healthServicesEruClinicDetailsLink,
            to: 'surgeCatalogueHealthEruClinic',
            withLinkIcon: true,
        },
    ];

    const hospital: LinkData[] = [
        {
            title: strings.healthServicesEruHospitalTitleLink,
            to: 'surgeCatalogueHealthEruHospital',
            withLinkIcon: true,
        },
    ];

    const surgical: LinkData[] = [
        {
            title: strings.healthServicesEruSurgicalTitleLink,
            to: 'surgeCatalogueHealthEruSurgical',
            withLinkIcon: true,
        },
    ];

    const maternalNewbornClinic: LinkData[] = [
        {
            title: strings.maternalNewbornClinicTitleLink,
            to: 'surgeCatalogueHealthMaternalNewbornClinic',
            withLinkIcon: true,
        },
    ];

    const emergencyClinic: LinkData[] = [
        {
            title: strings.emergencyClinicTitleLink,
            to: 'surgeCatalogueHealthEmergencyClinic',
            withLinkIcon: true,
        },
    ];

    const emergencyChloreaTreatment: LinkData[] = [
        {
            title: strings.emergencyCholeraTreatmentTitleLink,
            to: 'surgeCatalogueHealthEruChloreaTreatment',
            withLinkIcon: true,
        },
    ];

    const healthCCMC: LinkData[] = [
        {
            title: strings.healthCCMCLink,
            to: 'surgeCatalogueHealthCommunityCaseManagementChlorea',
            withLinkIcon: true,
        },
    ];

    const healthCBS: LinkData[] = [
        {
            title: strings.healthCBSLink,
            to: 'surgeCatalogueHealthCommunityBasedSurveillance',
            withLinkIcon: true,
        },
    ];

    const healthBurials: LinkData[] = [
        {
            title: strings.healthBurialsTitle,
            to: 'surgeCatalogueHealthSafeDignifiedBurials',
            withLinkIcon: true,
        },
    ];

    const healthCCMM: LinkData[] = [
        {
            title: strings.communityCaseLink,
            to: 'surgeCatalogueHealthCommunityManagementMalnutrition',
            withLinkIcon: true,
        },
    ];

    const healthPSS: LinkData[] = [
        {
            title: strings.pssModuleLink,
            to: 'surgeCatalogueHealthEruPsychosocialSupport',
            withLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.healthCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUT_voU9qbNMm4qju7cLpSYBHUbqfjOAjqnkE9Tgj2_XKA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.medicalCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed8efoyRbQtHkU6XR5daOuMBxj9n_DqaE_gADCuspNUTmQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.publicHealthCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQQznuV_sHtGi7HH1PJ96Q0BWaetAeQgBdZlNg9vFsXOhw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.publicHealthOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQI_KH-MiBVIiYUuCTZdN0wB3RvRGeSRoUdJtzt1DKK8YA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.safeBurialCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EdiLb6_d41JKiiD_TjSNK1kBfVHb_j4F4WDox7lKbxmLxg',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.psychoSocialCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXnFbcXuGx9Ji7Po-Krtap8B_FneBhqcx-lq1NZupfZA7Q',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.psychoSocialOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EcVhELHbH-VDv8qHNK_03B4BbEJ-FiAL-TIswYju_mNMUg',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communityOutreachOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUmGi0NkR7BMrpiRyCG-JA8Bvgkd_iGRNcgCsspKZ3WzSA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.psychoSocialSupportOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETfznq8SFXJCmfMt7C3145wBjPPorxLNryy9t4YDXgM9VQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.healthInformationManagement,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXjPQtXpM7tGpAk6QSaMCAkBMQjlA4EVwZRJT1_zPGVKFw',
            external: true,
            withLinkIcon: true,
        },
    ];

    const eruRoleProfiles: LinkData[] = [
        {
            title: strings.eruClinicalCare,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ElDuDGQxA49PmjfwgXVsJUMBxWdRfhpKt8caXnaTF6NdJA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.eruPublicHealth,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EmuhNZ7JWjNHtwmW6cCWrFYBjklsiPNM4vqHc2PYUOIE2w',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalCompetencyFrameworkItemOneTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETuQ0_ZUXEhEhG4cNFvlQxMBdgYsR3juNpBsB_O5PY608w',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.technicalCompetencyFrameworkItemTwoTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb-Q-qToQQxAj6mZZ6RXs74BJXbj1-8PUODAscOIVxVv8g',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueHealthTitle}
            description={strings.healthDetails}
        >
            <SurgeCardContainer
                heading={strings.healthRapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.healthRoleProfiles}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.healthERURoleProfiles}
                    data={eruRoleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalCompetencyFramework}
                    data={frameworkData}
                    description={strings.technicalCompetencyFrameworkDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.healthServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.healthServicesEruClinicTitle}
                    data={clinic}
                    description={strings.healthServicesEruClinicDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthServicesEruClinicTitle}
                    data={hospital}
                    description={strings.healthServicesEruHospitalDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthClinical}
                    data={surgical}
                    description={strings.healthServicesEruSurgicalDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthClinical}
                    data={maternalNewbornClinic}
                    description={strings.maternalNewbornClinicTitleDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthClinical}
                    data={emergencyClinic}
                    description={strings.emergencyClinicDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthServicesEruClinicTitle}
                    data={emergencyChloreaTreatment}
                    description={strings.emergencyCholeraTreatmentDetails}
                />
                <CatalogueInfoCard
                    title={strings.publicHealth}
                    data={healthCCMC}
                />
                <CatalogueInfoCard
                    title={strings.publicHealth}
                    data={healthCBS}
                />
                <CatalogueInfoCard
                    title={strings.publicHealth}
                    data={healthBurials}
                />
                <CatalogueInfoCard
                    title={strings.publicHealth}
                    data={healthCCMM}
                />
                <CatalogueInfoCard
                    title={strings.nonClinicalTitle}
                    data={healthPSS}
                    description={strings.healthPSSDetails}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealth';
