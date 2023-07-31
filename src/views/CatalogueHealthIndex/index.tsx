import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        healthEruClinic: healthEruClinicRoute,
        healthEruHospital: healthEruHospitalRoute,
        healthSurgical: healthSurgicalRoute,
        healthMaternalNewbornClinic: healthMaternalNewbornClinicRoute,
        healthEmergencyClinic: healthEmergencyClinicRoute,
        healthEmergencyChloreaTreatment: healthEmergencyChloreaTreatmentRoute,
        healthCCMC: healthCCMCRoute,
        healthCBS: healthCBSRoute,
        healthBurials: healthBurialsRoute,
        healthCCMM: healthCCMMRoute,
        healthPSS: healthPSSRoute,
    } = useContext(RouteContext);

    const clinic: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthEruClinicRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const hospital: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthEruHospitalRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const surgical: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthSurgicalRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const maternalNewbornClinic: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthMaternalNewbornClinicRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const emergencyClinic: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthEmergencyClinicRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const emergencyChloreaTreatment: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthEmergencyChloreaTreatmentRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const healthCCMC: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthCCMCRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const healthCBS: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthCBSRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const healthBurials: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthBurialsRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const healthCCMM: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthCCMMRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const healthPSS: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(healthPSSRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.healthCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUT_voU9qbNMm4qju7cLpSYBHUbqfjOAjqnkE9Tgj2_XKA',
            withExternalLinkIcon: true,
        },
        {
            title: strings.medicalCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed8efoyRbQtHkU6XR5daOuMBxj9n_DqaE_gADCuspNUTmQ',
            withExternalLinkIcon: true,
        },
        {
            title: strings.publicHealthCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQQznuV_sHtGi7HH1PJ96Q0BWaetAeQgBdZlNg9vFsXOhw',
            withExternalLinkIcon: true,
        },
        {
            title: strings.publicHealthOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQI_KH-MiBVIiYUuCTZdN0wB3RvRGeSRoUdJtzt1DKK8YA',
            withExternalLinkIcon: true,
        },
        {
            title: strings.safeBurialCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EdiLb6_d41JKiiD_TjSNK1kBfVHb_j4F4WDox7lKbxmLxg',
            withExternalLinkIcon: true,
        },
        {
            title: strings.psychoSocialCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXnFbcXuGx9Ji7Po-Krtap8B_FneBhqcx-lq1NZupfZA7Q',
            withExternalLinkIcon: true,
        },
        {
            title: strings.psychoSocialOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EcVhELHbH-VDv8qHNK_03B4BbEJ-FiAL-TIswYju_mNMUg',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communityOutreachOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUmGi0NkR7BMrpiRyCG-JA8Bvgkd_iGRNcgCsspKZ3WzSA',
            withExternalLinkIcon: true,
        },
        {
            title: strings.psychoSocialSupportOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETfznq8SFXJCmfMt7C3145wBjPPorxLNryy9t4YDXgM9VQ',
            withExternalLinkIcon: true,
        },
        {
            title: strings.healthInformationManagement,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXjPQtXpM7tGpAk6QSaMCAkBMQjlA4EVwZRJT1_zPGVKFw',
            withExternalLinkIcon: true,
        },
    ];

    const eruRoleProfiles: LinkData[] = [
        {
            title: strings.eruClinicalCare,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ElDuDGQxA49PmjfwgXVsJUMBxWdRfhpKt8caXnaTF6NdJA',
            withExternalLinkIcon: true,
        },
        {
            title: strings.eruPublicHealth,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETuQ0_ZUXEhEhG4cNFvlQxMBdgYsR3juNpBsB_O5PY608w',
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalCompetencyFrameworkItemOneTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETuQ0_ZUXEhEhG4cNFvlQxMBdgYsR3juNpBsB_O5PY608w',
            withExternalLinkIcon: true,
        },
        {
            title: strings.technicalCompetencyFrameworkItemTwoTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Eb-Q-qToQQxAj6mZZ6RXs74BJXbj1-8PUODAscOIVxVv8g',
            withExternalLinkIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueHealthTitle}
            className={styles.catalogueHealth}
            childrenContainerClassName={styles.content}
        >
            <div>
                {strings.healthDetails}
            </div>
            <Container
                heading={strings.healthRapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.healthServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.healthServicesEruClinicTitle}
                    data={clinic}
                    description={strings.healthServicesEruClinicDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthServicesEruHospitalTitle}
                    data={hospital}
                    description={strings.healthServicesEruHospitalDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthServicesEruSurgicalTitle}
                    data={surgical}
                    description={strings.healthServicesEruSurgicalDetails}
                />
                <CatalogueInfoCard
                    title={strings.maternalNewbornClinicTitle}
                    data={maternalNewbornClinic}
                    description={strings.maternalNewbornClinicTitleDetails}
                />
                <CatalogueInfoCard
                    title={strings.emergencyClinicTitle}
                    data={emergencyClinic}
                    description={strings.emergencyClinicDetails}
                />
                <CatalogueInfoCard
                    title={strings.emergencyChloreaTreatmentTitle}
                    data={emergencyChloreaTreatment}
                    description={strings.emergencyChloreaTreatmentDetails}
                />
                <CatalogueInfoCard
                    title={strings.healthCCMCTitle}
                    data={healthCCMC}
                />
                <CatalogueInfoCard
                    title={strings.healthCBSTitle}
                    data={healthCBS}
                />
                <CatalogueInfoCard
                    title={strings.healthBurialsTitle}
                    data={healthBurials}
                />
                <CatalogueInfoCard
                    title={strings.healthCCMMTitle}
                    data={healthCCMM}
                />
                <CatalogueInfoCard
                    title={strings.healthPSSTitle}
                    data={healthPSS}
                    description={strings.healthPSSDetails}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueHealthIndex';
