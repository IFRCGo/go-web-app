import { Navigate } from 'react-router-dom';
import {
    wrapRoute,
    unwrapRoute,
} from '#utils/routes';
import type {
    MyInputIndexRouteObject,
    MyInputNonIndexRouteObject,
    MyOutputIndexRouteObject,
    MyOutputNonIndexRouteObject,
} from '#utils/routes';

import { Component as RootLayout } from '#views/RootLayout';

import Auth from '../Auth';
import PageError from '../PageError';

type ExtendedProps = {
    title: string,
    visibility: 'is-authenticated' | 'is-not-authenticated' | 'anything',
};
interface CustomWrapRoute {
    <T>(
        myRouteOptions: MyInputIndexRouteObject<T, ExtendedProps>
    ): MyOutputIndexRouteObject<ExtendedProps>
    <T>(
        myRouteOptions: MyInputNonIndexRouteObject<T, ExtendedProps>
    ): MyOutputNonIndexRouteObject<ExtendedProps>
}
const customWrapRoute: CustomWrapRoute = wrapRoute;

// NOTE: We should not use layout or index routes in links

const rootLayout = customWrapRoute({
    path: '/',
    errorElement: <PageError />,
    component: {
        eagerLoad: true,
        render: RootLayout,
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: '',
        visibility: 'anything',
    },
});

const login = customWrapRoute({
    parent: rootLayout,
    path: 'login',
    component: {
        render: () => import('#views/Login'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Login',
        visibility: 'is-not-authenticated',
    },
});

const register = customWrapRoute({
    parent: rootLayout,
    path: 'register',
    component: {
        render: () => import('#views/Register'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Register',
        visibility: 'is-not-authenticated',
    },
});

const home = customWrapRoute({
    parent: rootLayout,
    index: true,
    component: {
        render: () => import('#views/Home'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Home',
        visibility: 'anything',
    },
});

type DefaultRegionsChild = 'operations';
const regionsLayout = customWrapRoute({
    parent: rootLayout,
    path: 'regions/:regionId',
    forwardPath: 'operations' satisfies DefaultRegionsChild,
    component: {
        render: () => import('#views/Region'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Region',
        visibility: 'anything',
    },
});

const regionIndex = customWrapRoute({
    parent: regionsLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'operations' satisfies DefaultRegionsChild,
            replace: true,
        },
    },
    context: {
        title: 'Region index',
        visibility: 'anything',
    },
});

const regionOperations = customWrapRoute({
    parent: regionsLayout,
    path: 'operations' satisfies DefaultRegionsChild,
    component: {
        render: () => import('#views/RegionOperations'),
        props: {},
    },
    context: {
        title: 'Region Operations',
        visibility: 'anything',
    },
});

const regionThreeW = customWrapRoute({
    parent: regionsLayout,
    path: 'three-w',
    component: {
        render: () => import('#views/RegionThreeW'),
        props: {},
    },
    context: {
        title: 'Region 3W',
        visibility: 'anything',
    },
});

type DefaultRegionRiskWatchChild = 'seasonal';
const regionRiskWatchLayout = customWrapRoute({
    parent: regionsLayout,
    path: 'risk-watch',
    forwardPath: 'seasonal' satisfies DefaultRegionRiskWatchChild,
    component: {
        render: () => import('#views/RegionRiskWatch'),
        props: {},
    },
    context: {
        title: 'Region Risk Watch',
        visibility: 'anything',
    },
});

const regionRiskIndex = customWrapRoute({
    parent: regionRiskWatchLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'seasonal' satisfies DefaultRegionRiskWatchChild,
            replace: true,
        },
    },
    context: {
        title: 'Region Risk index',
        visibility: 'anything',
    },
});

const regionImminentRiskWatch = customWrapRoute({
    parent: regionRiskWatchLayout,
    path: 'imminent',
    component: {
        render: () => import('#views/RegionRiskWatchImminent'),
        props: {},
    },
    context: {
        title: 'Region Risk Watch - Imminent',
        visibility: 'anything',
    },
});

const regionSeasonalRiskWatch = customWrapRoute({
    parent: regionRiskWatchLayout,
    path: 'seasonal' satisfies DefaultRegionRiskWatchChild,
    component: {
        render: () => import('#views/RegionRiskWatchSeasonal'),
        props: {},
    },
    context: {
        title: 'Region Risk Watch - Seasonal',
        visibility: 'anything',
    },
});

const regionPreparedness = customWrapRoute({
    parent: regionsLayout,
    path: 'preparedness',
    component: {
        render: () => import('#views/RegionPreparedness'),
        props: {},
    },
    context: {
        title: 'Region Preparedness',
        visibility: 'anything',
    },
});

const regionProfile = customWrapRoute({
    parent: regionsLayout,
    path: 'profile',
    component: {
        render: () => import('#views/RegionProfile'),
        props: {},
    },
    context: {
        title: 'Region Profile',
        visibility: 'anything',
    },
});

const regionAdditionalInfo = customWrapRoute({
    parent: regionsLayout,
    path: 'additional-info',
    component: {
        render: () => import('#views/RegionAdditionalInfo'),
        props: {},
    },
    context: {
        title: 'Region Additional Info',
        visibility: 'anything',
    },
});

type DefaultCountriesChild = 'operations';
const countriesLayout = customWrapRoute({
    parent: rootLayout,
    path: 'countries/:countryId',
    forwardPath: 'operations' satisfies DefaultCountriesChild,
    component: {
        render: () => import('#views/Country'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Country',
        visibility: 'anything',
    },
});

const countryIndex = customWrapRoute({
    parent: countriesLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'operations' satisfies DefaultCountriesChild,
            replace: true,
        },
    },
    context: {
        title: 'Country index',
        visibility: 'anything',
    },
});

const countryOperations = customWrapRoute({
    parent: countriesLayout,
    path: 'operations' satisfies DefaultCountriesChild,
    component: {
        render: () => import('#views/CountryOperations'),
        props: {},
    },
    context: {
        title: 'Country Operations',
        visibility: 'anything',
    },
});

type DefaultCountryThreeWChild = 'projects';
const countriesThreeWLayout = customWrapRoute({
    parent: countriesLayout,
    path: 'three-w',
    forwardPath: 'projects' satisfies DefaultCountryThreeWChild,
    component: {
        render: () => import('#views/CountryThreeW'),
        props: {},
    },
    context: {
        title: 'Country 3W',
        visibility: 'anything',
    },
});

const countryThreeWIndex = customWrapRoute({
    parent: countriesThreeWLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'projects' satisfies DefaultCountryThreeWChild,
            replace: true,
        },
    },
    context: {
        title: 'Country 3W index',
        visibility: 'anything',
    },
});

const countryThreeWProjects = customWrapRoute({
    parent: countriesThreeWLayout,
    path: 'projects' satisfies DefaultCountryThreeWChild,
    component: {
        render: () => import('#views/CountryThreeWProjects'),
        props: {},
    },
    context: {
        title: 'Country 3W Projects',
        visibility: 'anything',
    },
});

const countryThreeWNationalSocietyProjects = customWrapRoute({
    parent: countriesThreeWLayout,
    path: 'ns-projects',
    component: {
        render: () => import('#views/CountryThreeWNationalSocietyProjects'),
        props: {},
    },
    context: {
        title: 'Country 3W National Society Project',
        visibility: 'anything',
    },
});

const countryRiskWatch = customWrapRoute({
    parent: countriesLayout,
    path: 'risk-watch',
    component: {
        render: () => import('#views/CountryRiskWatch'),
        props: {},
    },
    context: {
        title: 'Country Risk Watch',
        visibility: 'anything',
    },
});

const countryPreparedness = customWrapRoute({
    parent: countriesLayout,
    path: 'preparedness',
    component: {
        render: () => import('#views/CountryPreparedness'),
        props: {},
    },
    context: {
        title: 'Country Preparedness',
        visibility: 'anything',
    },
});

const countryPlan = customWrapRoute({
    parent: countriesLayout,
    path: 'plan',
    component: {
        render: () => import('#views/CountryPlan'),
        props: {},
    },
    context: {
        title: 'Country Plan',
        visibility: 'anything',
    },
});

const countryAdditionalData = customWrapRoute({
    parent: countriesLayout,
    path: 'additional-data',
    component: {
        render: () => import('#views/CountryAdditionalData'),
        props: {},
    },
    context: {
        title: 'Country Additional Data',
        visibility: 'anything',
    },
});

const emergencies = customWrapRoute({
    parent: rootLayout,
    path: 'emergencies',
    component: {
        render: () => import('#views/Emergencies'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergencies',
        visibility: 'anything',
    },
});

type DefaultEmergenciesChild = 'details';
const emergenciesLayout = customWrapRoute({
    parent: rootLayout,
    path: 'emergencies/:emergencyId',
    forwardPath: 'details' satisfies DefaultEmergenciesChild,
    component: {
        render: () => import('#views/Emergency'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency',
        visibility: 'anything',
    },
});

const emergencyIndex = customWrapRoute({
    parent: emergenciesLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'details' satisfies DefaultEmergenciesChild,
            replace: true,
        },
    },
    context: {
        title: 'Emergency index',
        visibility: 'anything',
    },
});

const emergencyDetails = customWrapRoute({
    parent: emergenciesLayout,
    path: 'details' satisfies DefaultEmergenciesChild,
    component: {
        render: () => import('#views/EmergencyDetails'),
        props: {},
    },
    context: {
        title: 'Emergency Details',
        visibility: 'anything',
    },
});

const emergencyReportsAndDocuments = customWrapRoute({
    parent: emergenciesLayout,
    path: 'reports',
    component: {
        render: () => import('#views/EmergencyReportAndDocument'),
        props: {},
    },
    context: {
        title: 'Emergency Reports/Documents',
        visibility: 'anything',
    },
});

const emergencyActivities = customWrapRoute({
    parent: emergenciesLayout,
    path: 'activities',
    component: {
        render: () => import('#views/EmergencyActivities'),
        props: {},
    },
    context: {
        title: 'Emergency Activities',
        visibility: 'anything',
    },
});
const emergencySurge = customWrapRoute({
    parent: emergenciesLayout,
    path: 'surge',
    component: {
        render: () => import('#views/EmergencySurge'),
        props: {},
    },
    context: {
        title: 'Emergency Surge',
        visibility: 'anything',
    },
});

const emergencyAdditionalTab = customWrapRoute({
    parent: emergenciesLayout,
    path: 'additional-tab/:routeName',
    component: {
        render: () => import('#views/EmergencyAdditionalTab'),
        props: {},
    },
    context: {
        title: 'Emergency Additional Tab',
        visibility: 'anything',
    },
});

type DefaultSurgeChild = 'overview';
const surgeLayout = customWrapRoute({
    parent: rootLayout,
    path: 'surge',
    forwardPath: 'overview' satisfies DefaultSurgeChild,
    component: {
        render: () => import('#views/Surge'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Surge',
        visibility: 'anything',
    },
});

const surgeIndex = customWrapRoute({
    parent: surgeLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'overview' satisfies DefaultSurgeChild,
            replace: true,
        },
    },
    context: {
        title: 'Surge index',
        visibility: 'anything',
    },
});

const surgeOverview = customWrapRoute({
    parent: surgeLayout,
    path: 'overview' satisfies DefaultSurgeChild,
    component: {
        render: () => import('#views/SurgeOverview'),
        props: {},
    },
    context: {
        title: 'Surge Overview',
        visibility: 'anything',
    },
});

const surgeOperationalToolbox = customWrapRoute({
    parent: surgeLayout,
    path: 'operational-toolbox',
    component: {
        render: () => import('#views/SurgeOperationalToolbox'),
        props: {},
    },
    context: {
        title: 'Surge Operational Toolbox',
        visibility: 'anything',
    },
});

type DefaultSurgeCatalogueChild = 'overview';
const surgeCatalogueLayout = customWrapRoute({
    parent: surgeLayout,
    path: 'catalogue',
    forwardPath: 'overview' satisfies DefaultSurgeCatalogueChild,
    component: {
        render: () => import('#views/SurgeCatalogue'),
        props: {},
    },
    context: {
        title: 'Surge Services Catalogue',
        visibility: 'anything',
    },
});

const catalogueIndex = customWrapRoute({
    parent: surgeCatalogueLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'overview' satisfies DefaultSurgeCatalogueChild,
            replace: true,
        },
    },
    context: {
        title: 'Surge Catalogue Index',
        visibility: 'anything',
    },
});

const surgeCatalogueOverview = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'overview' satisfies DefaultSurgeCatalogueChild,
    component: {
        render: () => import('#views/SurgeCatalogueOverview'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Surge Services Catalogue',
        visibility: 'anything',
    },
});

const surgeCatalogueEmergencyNeedsAssessment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'emergency-needs-assessment',
    component: {
        render: () => import('#views/SurgeCatalogueEmergencyNeedsAssessment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Catalogue',
        visibility: 'anything',
    },
});

const surgeCatalogueEmergencyNeedsAssessmentCell = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'emergency-needs-assessment/cell',
    component: {
        render: () => import('#views/SurgeCatalogueEmergencyNeedsAssessmentCell'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Assessment Cell',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecamp = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp',
    component: {
        render: () => import('#views/SurgeCatalogueBasecamp'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecampe Catalogue',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampEruSmall = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-small',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampEruSmall'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Small',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampEruMedium = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-medium',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampEruMedium'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Medium',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampEruLarge = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-large',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampEruLarge'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Large',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampFacilityManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/facility-management',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampFacilityManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp Facility Management',
        visibility: 'anything',
    },
});

const surgeCatalogueCash = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'cash',
    component: {
        render: () => import('#views/SurgeCatalogueCash'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cash and Vouchers Assistance',
        visibility: 'anything',
    },
});

const surgeCatalogueCashRapidResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'cash/rapid-response',
    component: {
        render: () => import('#views/SurgeCatalogueCashRapidResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cash and Vouchers Assistance - Rapid Response',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunityEngagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'community',
    component: {
        render: () => import('#views/SurgeCatalogueCommunityEngagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Engagement and Accountability (CEA)',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunityEngagementRapidResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'community/rapid-response',
    component: {
        render: () => import('#views/SurgeCatalogueCommunityEngagementRapidResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Engagement and Accountability (CEA) - Rapid Response',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunication = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication',
    component: {
        render: () => import('#views/SurgeCatalogueCommunication'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunicationErtOne = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-1',
    component: {
        render: () => import('#views/SurgeCatalogueCommunicationErtOne'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 1',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunicationErtTwo = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-2',
    component: {
        render: () => import('#views/SurgeCatalogueCommunicationErtTwo'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 2',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunicationErtThree = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-3',
    component: {
        render: () => import('#views/SurgeCatalogueCommunicationErtThree'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 3',
        visibility: 'anything',
    },
});

const surgeCatalogueHealth = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health',
    component: {
        render: () => import('#views/SurgeCatalogueHealth'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Health',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-clinic',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Red Cross Red Crescent Emergency Clinic',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruHospital = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-hospital',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruHospital'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Red Cross Red Crescent Emergency Hospital',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruSurgical = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-surgical',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruSurgical'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Health Surgical',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthMaternalNewbornClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/maternal-newborn-clinic',
    component: {
        render: () => import('#views/SurgeCatalogueHealthMaternalNewbornClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Maternal NewBorn Health Clinic',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEmergencyClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/emergency-clinic',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEmergencyClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Mobile Clinic',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruChloreaTreatment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-chlorea-treatment',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruChloreaTreatment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit Chlorea Treatment Center',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthCommunityCaseManagementChlorea = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-case-management-chlorea',
    component: {
        render: () => import('#views/SurgeCatalogueHealthCommunityCaseManagementChlorea'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Case Management of Chlorea',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthCommunityBasedSurveillance = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-based-surveillance',
    component: {
        render: () => import('#views/SurgeCatalogueHealthCommunityBasedSurveillance'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Based Surveillance',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthSafeDignifiedBurials = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/safe-dignified-burials',
    component: {
        render: () => import('#views/SurgeCatalogueHealthSafeDignifiedBurials'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Safe and Dignified Burials',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthCommunityManagementMalnutrition = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-management-malnutrition',
    component: {
        render: () => import('#views/SurgeCatalogueHealthCommunityManagementMalnutrition'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Case Management of Malnutrition',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruPsychosocialSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-psychosocial-support',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruPsychosocialSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit Psychosocial Support',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management',
        visibility: 'anything',
    },

});

const surgeCatalogueInformationManagementSatelliteImagery = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/satellite-imagery',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementSatelliteImagery'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Satellite Imagery',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagementRolesResponsibility = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/roles-responsibility',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementRolesResponsibility'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Roles and Responsibilities',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagementSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/support',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management Support',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagementOperationSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/operation-support',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementOperationSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management Support for Operations',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagementComposition = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/composition',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementComposition'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Composition of IM Resources',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationTechnology = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-technology',
    component: {
        render: () => import('#views/SurgeCatalogueInformationTechnology'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Technology',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationTechnologyEruItTelecom = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-technology/eru-it-telecom',
    component: {
        render: () => import('#views/SurgeCatalogueInformationTechnologyEruItTelecom'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Technology Service',
        visibility: 'anything',
    },
});

const surgeCatalogueLivelihood = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'livelihood',
    component: {
        render: () => import('#views/SurgeCatalogueLivelihood'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Livelihoods and Basic Needs',
        visibility: 'anything',
    },
});

const surgeCatalogueLivelihoodServices = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'livelihood/services',
    component: {
        render: () => import('#views/SurgeCatalogueLivelihoodServices'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Livelihood Service',
        visibility: 'anything',
    },
});

const surgeCatalogueLogistics = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics',
    component: {
        render: () => import('#views/SurgeCatalogueLogistics'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Logistics',
        visibility: 'anything',
    },
});

const surgeCatalogueLogisticsEru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics/eru',
    component: {
        render: () => import('#views/SurgeCatalogueLogisticsEru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit',
        visibility: 'anything',
    },
});

const surgeCatalogueLogisticsLpscmNs = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics/lpscm-ns',
    component: {
        render: () => import('#views/SurgeCatalogueLogisticsLpscmNs'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'LPSCM for National Societies',
        visibility: 'anything',
    },
});

const surgeCatalogueOperationsManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'operations-management',
    component: {
        render: () => import('#views/SurgeCatalogueOperationsManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Operations Management',
        visibility: 'anything',
    },
});

const surgeCatalogueOperationManagementHeops = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'operations-management/heops',
    component: {
        render: () => import('#views/SurgeCatalogueOperationsManagementHeops'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Head of Emergency Operations (HEOPS)',
        visibility: 'anything',
    },
});

const surgeCataloguePgi = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pgi',
    component: {
        render: () => import('#views/SurgeCataloguePgi'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Protection, Gender and inclusion (PGI)',
        visibility: 'anything',
    },
});

const surgeCataloguePgiServices = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pgi/services',
    component: {
        render: () => import('#views/SurgeCataloguePgiServices'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Protection Gender and Inclusion - Services',
        visibility: 'anything',
    },
});

const surgeCataloguePmer = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pmer',
    component: {
        render: () => import('#views/SurgeCataloguePmer'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Planning, Monitoring, Evaluation And Reporting (PMER)',
        visibility: 'anything',
    },
});

const surgeCataloguePmerEmergencyPlanAction = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pmer/emergency-plan-action',
    component: {
        render: () => import('#views/SurgeCataloguePmerEmergencyPlanAction'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency plan of action EPOA monitoring evaluation plan',
        visibility: 'anything',
    },
});

const surgeCataloguePmerRealTimeEvaluation = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pmer/real-time-evaluation',
    component: {
        render: () => import('#views/SurgeCataloguePmerRealTimeEvaluation'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Real time evaluation RTE and guidance',
        visibility: 'anything',
    },
});

const surgeCatalogueShelter = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'shelter',
    component: {
        render: () => import('#views/SurgeCatalogueShelter'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Shelter',
        visibility: 'anything',
    },
});

const surgeCatalogueShelterCoordinatorTeam = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'shelter/coordinator-team',
    component: {
        render: () => import('#views/SurgeCatalogueShelterCoordinatorTeam'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Shelter Surge Coordinator',
        visibility: 'anything',
    },
});

const surgeCatalogueShelterTechnicalTeam = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'shelter/technical-team',
    component: {
        render: () => import('#views/SurgeCatalogueShelterTechnicalTeam'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Shelter Technical Team',
        visibility: 'anything',
    },
});

const surgeCatalogueWash = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash',
    component: {
        render: () => import('#views/SurgeCatalogueWash'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Water, Sanitation and Hygiene (WASH)',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKit2 = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/kit-2',
    component: {
        render: () => import('#views/SurgeCatalogueWashKit2'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'WASH Kit-2',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKit5 = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/kit-5',
    component: {
        render: () => import('#views/SurgeCatalogueWashKit5'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'WASH Kit-5',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKitM15Eru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/m15-eru',
    component: {
        render: () => import('#views/SurgeCatalogueWashKitM15Eru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'WASH Kit-M15 ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKitMsm20Eru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/msm20-eru',
    component: {
        render: () => import('#views/SurgeCatalogueWashKitMsm20Eru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Wash Kit-MSM20 ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKitM40Eru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/m40-eru',
    component: {
        render: () => import('#views/SurgeCatalogueWashKitM40Eru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Wash Kit-M40 ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueWashWaterSupplyRehabilitation = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/water-supply-rehabilitation',
    component: {
        render: () => import('#views/SurgeCatalogueWashWaterSupplyRehabilitation'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Water Supply Rehabilitation',
        visibility: 'anything',
    },
});

const surgeCatalogueWashHwts = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/hwts',
    component: {
        render: () => import('#views/SurgeCatalogueWashHwts'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Household Water Treatment and Safe Storage (HWTS)',
        visibility: 'anything',
    },
});

const surgeCatalogueRelief = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'relief',
    component: {
        render: () => import('#views/SurgeCatalogueRelief'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Relief',
        visibility: 'anything',
    },
});

const surgeCatalogueReliefEru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'relief/eru',
    component: {
        render: () => import('#views/SurgeCatalogueReliefEru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Relief ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueSecurity = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'security',
    component: {
        render: () => import('#views/SurgeCatalogueSecurity'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Security',
        visibility: 'anything',
    },
});

const surgeCatalogueSecurityManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'security/management',
    component: {
        render: () => import('#views/SurgeCatalogueSecurityManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Security Management',
        visibility: 'anything',
    },
});

const surgeCatalogueOther = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other',
    component: {
        render: () => import('#views/SurgeCatalogueOther'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherCivilMilitaryRelations = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/civil-military-relations',
    component: {
        render: () => import('#views/SurgeCatalogueOtherCivilMilitaryRelations'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherDisasterRiskReduction = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/disaster-risk-reduction',
    component: {
        render: () => import('#views/SurgeCatalogueOtherDisasterRiskReduction'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherHumanResources = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/human-resources',
    component: {
        render: () => import('#views/SurgeCatalogueOtherHumanResources'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherInternationalDisasterResponseLaw = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/international-disaster-response-law',
    component: {
        render: () => import('#views/SurgeCatalogueOtherInternationalDisasterResponseLaw'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherMigration = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/migration',
    component: {
        render: () => import('#views/SurgeCatalogueOtherMigration'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherNationalSocietyDevelopment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/national-society-development',
    component: {
        render: () => import('#views/SurgeCatalogueOtherNationalSocietyDevelopment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherPartnershipResourceDevelopment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/partnership-resource-development',
    component: {
        render: () => import('#views/SurgeCatalogueOtherPartnershipResourceDevelopment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherPreparednessEffectiveResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/preparedness-effective-response',
    component: {
        render: () => import('#views/SurgeCatalogueOtherPreparednessEffectiveResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherRecovery = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/recovery',
    component: {
        render: () => import('#views/SurgeCatalogueOtherRecovery'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherGreenResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/green-response',
    component: {
        render: () => import('#views/SurgeCatalogueOtherGreenResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Other',
        visibility: 'anything',
    },
});

type DefaultPreparednessChild = 'global-summary';
const preparednessLayout = customWrapRoute({
    parent: rootLayout,
    path: 'preparedness',
    forwardPath: 'global-summary' satisfies DefaultPreparednessChild,
    component: {
        render: () => import('#views/Preparedness'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness',
        visibility: 'anything',
    },
});

const preparednessIndex = customWrapRoute({
    parent: preparednessLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'global-summary' satisfies DefaultPreparednessChild,
            replace: true,
        },
    },
    context: {
        title: 'Preparedness index',
        visibility: 'anything',
    },
});

const preparednessGlobalSummary = customWrapRoute({
    parent: preparednessLayout,
    path: 'global-summary' satisfies DefaultPreparednessChild,
    component: {
        render: () => import('#views/PreparednessGlobalSummary'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness - Global Summary',
        visibility: 'anything',
    },
});

const preparednessGlobalPerformance = customWrapRoute({
    parent: preparednessLayout,
    path: 'global-performance',
    component: {
        render: () => import('#views/PreparednessGlobalPerformance'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness - Global Performace',
        visibility: 'anything',
    },
});

const preparednessGlobalCatalogue = customWrapRoute({
    parent: preparednessLayout,
    path: 'catalogue-learning',
    component: {
        render: () => import('#views/PreparednessCatalogueResources'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness - Catalogue of learning',
        visibility: 'anything',
    },
});

const preparednessGlobalOperational = customWrapRoute({
    parent: preparednessLayout,
    path: 'operational-learning',
    component: {
        render: () => import('#views/PreparednessOperationalLearning'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness - Operational learning',
        visibility: 'anything',
    },
});

const globalThreeW = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects',
    component: {
        render: () => import('#views/GlobalThreeW'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Global Three W',
        visibility: 'anything',
    },
});

const newThreeWProject = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/new',
    component: {
        render: () => import('#views/ThreeWProjectForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New 3w project',
        visibility: 'is-authenticated',
    },
});

const threeWProjectDetail = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/:projectId/',
    component: {
        render: () => import('#views/ThreeWProjectDetail'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ThreeW Project Detail',
        visibility: 'anything',
    },
});

const threeWProjectEdit = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/:projectId/edit',
    component: {
        render: () => import('#views/ThreeWProjectForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Edit 3W project',
        visibility: 'is-authenticated',
    },
});

const newThreeWActivity = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/activities/new',
    component: {
        render: () => import('#views/ThreeWActivityForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New 3W activity',
        visibility: 'is-authenticated',
    },
});

const threeWActivityDetail = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/activities/:activityId',
    component: {
        render: () => import('#views/ThreeWActivityDetail'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ThreeW Activity Detail',
        visibility: 'anything',
    },
});

const threeWActivityEdit = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/activities/:activityId/edit',
    component: {
        render: () => import('#views/ThreeWActivityForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Edit 3W Activity',
        visibility: 'is-authenticated',
    },
});

type DefaultRiskWatchChild = 'seasonal';
const riskWatchLayout = customWrapRoute({
    parent: rootLayout,
    path: 'risk-watch',
    forwardPath: 'seasonal' satisfies DefaultRiskWatchChild,
    component: {
        render: () => import('#views/RiskWatch'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Risk',
        visibility: 'anything',
    },
});

const riskWatchIndex = customWrapRoute({
    parent: riskWatchLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'seasonal' satisfies DefaultRiskWatchChild,
            replace: true,
        },
    },
    context: {
        title: 'Risk watch index',
        visibility: 'anything',
    },
});

const riskWatchSeasonal = customWrapRoute({
    parent: riskWatchLayout,
    path: 'seasonal' satisfies DefaultRiskWatchChild,
    component: {
        render: () => import('#views/RiskWatchSeasonal'),
        props: {},
    },
    context: {
        title: 'Risk Watch - Seasonal',
        visibility: 'anything',
    },
});

const riskWatchImminent = customWrapRoute({
    parent: riskWatchLayout,
    path: 'imminent',
    component: {
        render: () => import('#views/RiskWatchImminent'),
        props: {},
    },
    context: {
        title: 'Risk Watch - Seasonal',
        visibility: 'anything',
    },
});

type DefaultAccountChild = 'account-information';
const accountLayout = customWrapRoute({
    parent: rootLayout,
    path: 'account',
    forwardPath: 'account-information' satisfies DefaultAccountChild,
    component: {
        render: () => import('#views/Account'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Account',
        visibility: 'is-authenticated',
    },
});

const accountIndex = customWrapRoute({
    parent: accountLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'account-information' satisfies DefaultAccountChild,
            replace: true,
        },
    },
    context: {
        title: 'Account index',
        visibility: 'anything',
    },
});

const accountInformation = customWrapRoute({
    parent: accountLayout,
    path: 'account-information' satisfies DefaultAccountChild,
    component: {
        render: () => import('#views/AccountInformation'),
        props: {},
    },
    context: {
        title: 'Account Information',
        visibility: 'is-authenticated',
    },
});

const accountNotifications = customWrapRoute({
    parent: accountLayout,
    path: 'notifications',
    component: {
        render: () => import('#views/AccountNotifications'),
        props: {},
    },
    context: {
        title: 'Account Notifications',
        visibility: 'is-authenticated',
    },
});

const accountPerForms = customWrapRoute({
    parent: accountLayout,
    path: 'per-forms',
    component: {
        render: () => import('#views/AccountPerForms'),
        props: {},
    },
    context: {
        title: 'Account PER Forms',
        visibility: 'is-authenticated',
    },
});

const accountDrefApplications = customWrapRoute({
    parent: accountLayout,
    path: 'dref-applications',
    component: {
        render: () => import('#views/AccountDrefApplications'),
        props: {},
    },
    context: {
        title: 'Account DREF Applications',
        visibility: 'is-authenticated',
    },
});

const accountThreeWForms = customWrapRoute({
    parent: accountLayout,
    path: 'three-w-forms',
    component: {
        render: () => import('#views/AccountThreeWForms'),
        props: {},
    },
    context: {
        title: 'Account DREF Applications',
        visibility: 'is-authenticated',
    },
});

const resources = customWrapRoute({
    parent: rootLayout,
    path: 'resources',
    component: {
        render: () => import('#views/Resources'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Resources',
        visibility: 'anything',
    },
});

const search = customWrapRoute({
    parent: rootLayout,
    path: 'search',
    component: {
        render: () => import('#views/Search'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Search',
        visibility: 'anything',
    },
});

const allThreeWProject = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/all',
    component: {
        render: () => import('#views/AllThreeWProject'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All 3W',
        visibility: 'anything',
    },
});

const allThreeWActivity = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/activities/all',
    component: {
        render: () => import('#views/AllThreeWActivity'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All 3W',
        visibility: 'anything',
    },
});

// FIXME: We should instead use allThreeW with search parameter
const countryAllThreeW = customWrapRoute({
    parent: rootLayout,
    path: 'countries/:countryId/three-w/projects/all',
    component: {
        render: () => import('#views/CountryAllThreeW'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All 3W Projects in the Country',
        visibility: 'anything',
    },
});

// FIXME: We should instead use allThreeW with search parameter
const countryAllThreeWNationalSocietyProjects = customWrapRoute({
    parent: rootLayout,
    path: 'countries/:countryId/three-w/ns-projects/all',
    component: {
        render: () => import('#views/CountryAllThreeWNationalSocietyProjects'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All 3W Projects by the Country National Society',
        visibility: 'anything',
    },
});

const allAppeals = customWrapRoute({
    parent: rootLayout,
    path: 'appeals/all',
    component: {
        render: () => import('#views/AllAppeals'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Appeals',
        visibility: 'anything',
    },
});

const allEmergencies = customWrapRoute({
    parent: rootLayout,
    path: 'emergencies/all',
    component: {
        render: () => import('#views/AllEmergencies'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Emergencies',
        visibility: 'anything',
    },
});

const allFieldReports = customWrapRoute({
    parent: rootLayout,
    path: 'field-reports/all',
    component: {
        render: () => import('#views/AllFieldReports'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Field Reports',
        visibility: 'anything',
    },
});

const allFlashUpdates = customWrapRoute({
    parent: rootLayout,
    path: 'flash-updates/all',
    component: {
        render: () => import('#views/AllFlashUpdates'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Flash Updates',
        visibility: 'anything',
    },
});

const flashUpdateFormNew = customWrapRoute({
    parent: rootLayout,
    path: 'flash-updates/new',
    component: {
        render: () => import('#views/FlashUpdateForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Flash Update',
        visibility: 'is-authenticated',
    },
});

const flashUpdateFormEdit = customWrapRoute({
    parent: rootLayout,
    path: 'flash-updates/:flashUpdateId/edit',
    component: {
        render: () => import('#views/FlashUpdateForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Flash Update Edit',
        visibility: 'is-authenticated',
    },
});

const flashUpdateFormDetails = customWrapRoute({
    parent: rootLayout,
    path: 'flash-updates/:flashUpdateId',
    component: {
        render: () => import('#views/FlashUpdateDetails'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Flash Update Details',
        visibility: 'anything',
    },
});

const allSurgeAlerts = customWrapRoute({
    parent: rootLayout,
    path: 'alerts/all',
    component: {
        render: () => import('#views/AllSurgeAlerts'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Surge Alerts',
        visibility: 'anything',
    },
});

const allDeployedPersonnel = customWrapRoute({
    parent: rootLayout,
    path: 'personnel/all',
    component: {
        render: () => import('#views/AllDeployedPersonnel'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Deployed Personnel',
        visibility: 'anything',
    },
});

const allDeployedEmergencyResponseUnits = customWrapRoute({
    parent: rootLayout,
    path: 'eru/all',
    component: {
        render: () => import('#views/AllDeployedEmergencyResponseUnits'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Deployed Emergency Response Units',
        visibility: 'anything',
    },
});

const newDrefApplicationForm = customWrapRoute({
    parent: rootLayout,
    path: 'dref-applications/new',
    component: {
        render: () => import('#views/DrefApplicationForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Dref Application Form',
        visibility: 'is-authenticated',
    },
});

const drefApplicationForm = customWrapRoute({
    parent: rootLayout,
    path: 'dref-applications/:drefId/edit',
    component: {
        render: () => import('#views/DrefApplicationForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Dref Application Form',
        visibility: 'is-authenticated',
    },
});

const drefApplicationExport = customWrapRoute({
    path: 'dref-applications/:drefId/export',
    component: {
        render: () => import('#views/DrefApplicationExport'),
        props: {},
    },
    parent: rootLayout,
    wrapperComponent: Auth,
    context: {
        title: 'Dref Application Export',
        visibility: 'is-authenticated',
    },
});

const drefOperationalUpdateForm = customWrapRoute({
    parent: rootLayout,
    path: 'dref-operational-updates/:opsUpdateId/edit',
    component: {
        render: () => import('#views/DrefOperationalUpdateForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Dref Operational Update Form',
        visibility: 'is-authenticated',
    },
});

const drefOperationalUpdateExport = customWrapRoute({
    path: 'dref-operational-updates/:opsUpdateId/export',
    component: {
        render: () => import('#views/DrefOperationalUpdateExport'),
        props: {},
    },
    parent: rootLayout,
    wrapperComponent: Auth,
    context: {
        title: 'Dref Operational Update Export',
        visibility: 'is-authenticated',
    },
});
const drefFinalReportForm = customWrapRoute({
    parent: rootLayout,
    path: 'dref-final-reports/:finalReportId/edit',
    component: {
        render: () => import('#views/DrefFinalReportForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Dref Final Report Form',
        visibility: 'is-authenticated',
    },
});

const drefFinalReportExport = customWrapRoute({
    path: 'dref-final-reports/:finalReportId/export',
    component: {
        render: () => import('#views/DrefFinalReportExport'),
        props: {},
    },
    parent: rootLayout,
    wrapperComponent: Auth,
    context: {
        title: 'Dref Final Report Export',
        visibility: 'is-authenticated',
    },
});

const fieldReportFormNew = customWrapRoute({
    parent: rootLayout,
    path: 'field-report/new',
    component: {
        render: () => import('#views/FieldReportForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Field Report Form',
        visibility: 'is-authenticated',
    },
});

const fieldReportFormEdit = customWrapRoute({
    parent: rootLayout,
    path: 'field-reports/:fieldReportId/edit',
    component: {
        render: () => import('#views/FieldReportForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Edit Field Report Form',
        visibility: 'is-authenticated',
    },
});

const fieldReportDetails = customWrapRoute({
    parent: rootLayout,
    path: 'field-reports/:fieldReportId',
    component: {
        render: () => import('#views/FieldReportDetails'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Field Report Details',
        visibility: 'anything',
    },
});

type DefaultPerProcessChild = 'new';
const perProcessLayout = customWrapRoute({
    parent: rootLayout,
    path: 'per-process',
    forwardPath: 'new' satisfies DefaultPerProcessChild,
    component: {
        render: () => import('#views/PerProcessForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Per Process',
        visibility: 'is-authenticated',
    },
});

const perProcessFormIndex = customWrapRoute({
    parent: perProcessLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'new' satisfies DefaultPerProcessChild,
            replace: true,
        },
    },
    context: {
        title: 'Per Process',
        visibility: 'anything',
    },
});

const newPerOverviewForm = customWrapRoute({
    parent: perProcessLayout,
    path: 'new' satisfies DefaultPerProcessChild,
    component: {
        render: () => import('#views/PerOverviewForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process',
        visibility: 'is-authenticated',
    },
});

const perOverviewForm = customWrapRoute({
    parent: perProcessLayout,
    path: ':perId/overview',
    component: {
        render: () => import('#views/PerOverviewForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process',
        visibility: 'is-authenticated',
    },
});

const perAssessmentForm = customWrapRoute({
    parent: perProcessLayout,
    path: ':perId/assessment',
    component: {
        render: () => import('#views/PerAssessmentForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process Form',
        visibility: 'is-authenticated',
    },
});

const perPrioritizationForm = customWrapRoute({
    parent: perProcessLayout,
    path: ':perId/prioritization',
    component: {
        render: () => import('#views/PerPrioritizationForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process Form',
        visibility: 'is-authenticated',
    },
});

const perWorkPlanForm = customWrapRoute({
    parent: perProcessLayout,
    path: ':perId/work-plan',
    component: {
        render: () => import('#views/PerWorkPlanForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process Form',
        visibility: 'is-authenticated',
    },
});

const wrappedRoutes = {
    rootLayout,
    login,
    register,
    home,
    regionsLayout,
    regionIndex,
    regionOperations,
    regionThreeW,
    regionRiskWatchLayout,
    regionRiskIndex,
    regionImminentRiskWatch,
    regionSeasonalRiskWatch,
    regionPreparedness,
    regionProfile,
    regionAdditionalInfo,
    countriesLayout,
    countryIndex,
    countryOperations,
    countriesThreeWLayout,
    countryThreeWProjects,
    countryThreeWNationalSocietyProjects,
    countryThreeWIndex,
    countryRiskWatch,
    countryPreparedness,
    countryPlan,
    countryAdditionalData,
    emergencies,
    emergenciesLayout,
    emergencyDetails,
    emergencyIndex,
    emergencyReportsAndDocuments,
    emergencyActivities,
    emergencySurge,
    emergencyAdditionalTab,
    surgeLayout,
    surgeOverview,
    surgeOperationalToolbox,
    surgeCatalogueLayout,
    surgeIndex,
    preparednessLayout,
    preparednessGlobalSummary,
    preparednessGlobalPerformance,
    preparednessGlobalCatalogue,
    preparednessGlobalOperational,
    preparednessIndex,
    perProcessFormIndex,
    globalThreeW,
    newThreeWProject,
    threeWProjectEdit,
    threeWActivityEdit,
    threeWActivityDetail,
    newThreeWActivity,
    accountLayout,
    accountIndex,
    accountInformation,
    accountNotifications,
    accountPerForms,
    accountDrefApplications,
    accountThreeWForms,
    resources,
    search,
    countryAllThreeW,
    countryAllThreeWNationalSocietyProjects,
    allThreeWProject,
    allThreeWActivity,
    allAppeals,
    allEmergencies,
    allFieldReports,
    allSurgeAlerts,
    allFlashUpdates,
    allDeployedPersonnel,
    allDeployedEmergencyResponseUnits,
    newDrefApplicationForm,
    drefApplicationForm,
    drefApplicationExport,
    drefOperationalUpdateForm,
    drefOperationalUpdateExport,
    drefFinalReportForm,
    drefFinalReportExport,
    fieldReportFormNew,
    fieldReportFormEdit,
    fieldReportDetails,
    flashUpdateFormNew,
    flashUpdateFormDetails,
    flashUpdateFormEdit,
    riskWatchLayout,
    riskWatchIndex,
    riskWatchImminent,
    riskWatchSeasonal,
    perProcessLayout,
    perOverviewForm,
    newPerOverviewForm,
    perAssessmentForm,
    perPrioritizationForm,
    perWorkPlanForm,
    threeWProjectDetail,
    catalogueIndex,
    surgeCatalogueOverview,
    surgeCatalogueEmergencyNeedsAssessment,
    surgeCatalogueEmergencyNeedsAssessmentCell,
    surgeCatalogueBasecamp,
    surgeCatalogueBasecampEruSmall,
    surgeCatalogueBasecampEruMedium,
    surgeCatalogueBasecampEruLarge,
    surgeCatalogueBasecampFacilityManagement,
    surgeCatalogueCash,
    surgeCatalogueCashRapidResponse,
    surgeCatalogueCommunityEngagement,
    surgeCatalogueCommunityEngagementRapidResponse,
    surgeCatalogueCommunication,
    surgeCatalogueCommunicationErtOne,
    surgeCatalogueCommunicationErtTwo,
    surgeCatalogueCommunicationErtThree,
    surgeCatalogueHealth,
    surgeCatalogueHealthEruClinic,
    surgeCatalogueHealthEruHospital,
    surgeCatalogueHealthEruSurgical,
    surgeCatalogueHealthMaternalNewbornClinic,
    surgeCatalogueHealthEmergencyClinic,
    surgeCatalogueHealthEruChloreaTreatment,
    surgeCatalogueHealthCommunityCaseManagementChlorea,
    surgeCatalogueHealthCommunityBasedSurveillance,
    surgeCatalogueHealthSafeDignifiedBurials,
    surgeCatalogueHealthCommunityManagementMalnutrition,
    surgeCatalogueHealthEruPsychosocialSupport,
    surgeCatalogueInformationManagement,
    surgeCatalogueInformationManagementSatelliteImagery,
    surgeCatalogueInformationManagementRolesResponsibility,
    surgeCatalogueInformationManagementSupport,
    surgeCatalogueInformationManagementOperationSupport,
    surgeCatalogueInformationManagementComposition,
    surgeCatalogueInformationTechnology,
    surgeCataloguePmer,
    surgeCataloguePmerEmergencyPlanAction,
    surgeCataloguePmerRealTimeEvaluation,
    surgeCatalogueInformationTechnologyEruItTelecom,
    surgeCatalogueLivelihood,
    surgeCatalogueLivelihoodServices,
    surgeCatalogueSecurity,
    surgeCatalogueSecurityManagement,
    surgeCatalogueLogistics,
    surgeCatalogueLogisticsEru,
    surgeCatalogueLogisticsLpscmNs,
    surgeCatalogueOperationsManagement,
    surgeCatalogueOperationManagementHeops,
    surgeCataloguePgi,
    surgeCatalogueRelief,
    surgeCatalogueReliefEru,
    surgeCataloguePgiServices,
    surgeCatalogueShelter,
    surgeCatalogueShelterTechnicalTeam,
    surgeCatalogueShelterCoordinatorTeam,
    surgeCatalogueWash,
    surgeCatalogueWashKit2,
    surgeCatalogueWashKit5,
    surgeCatalogueWashKitM15Eru,
    surgeCatalogueWashKitMsm20Eru,
    surgeCatalogueWashKitM40Eru,
    surgeCatalogueWashWaterSupplyRehabilitation,
    surgeCatalogueWashHwts,
    surgeCatalogueOther,
    surgeCatalogueOtherCivilMilitaryRelations,
    surgeCatalogueOtherDisasterRiskReduction,
    surgeCatalogueOtherHumanResources,
    surgeCatalogueOtherInternationalDisasterResponseLaw,
    surgeCatalogueOtherMigration,
    surgeCatalogueOtherNationalSocietyDevelopment,
    surgeCatalogueOtherPartnershipResourceDevelopment,
    surgeCatalogueOtherPreparednessEffectiveResponse,
    surgeCatalogueOtherRecovery,
    surgeCatalogueOtherGreenResponse,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));

export default wrappedRoutes;

export type WrappedRoutes = typeof wrappedRoutes;
