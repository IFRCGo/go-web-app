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
        title: 'Surge Catalogue index',
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
    // TODO: rename to `three-w` and manage conflicting routes
    path: 'global-three-w',
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

const catalogueOverview = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'overview' satisfies DefaultSurgeCatalogueChild,
    component: {
        render: () => import('#views/CatalogueService'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Surge Services Catalogue',
        visibility: 'anything',
    },
});

const catalogueEmergency = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'emergency',
    component: {
        render: () => import('#views/CatalogueEmergency'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Catalogue',
        visibility: 'anything',
    },
});

const assessmentCell = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'emergency/assessment-cell',
    component: {
        render: () => import('#views/AssessmentCell'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Assessment Cell',
        visibility: 'anything',
    },
});

const catalogueBasecamp = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp',
    component: {
        render: () => import('#views/CatalogueBasecamp'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecampe Catalogue',
        visibility: 'anything',
    },
});

const basecampEruSmall = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-small',
    component: {
        render: () => import('#views/BasecampEruSmall'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Small',
        visibility: 'anything',
    },
});

const basecampEruMedium = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-medium',
    component: {
        render: () => import('#views/BasecampEruMedium'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Medium',
        visibility: 'anything',
    },
});

const basecampEruLarge = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-large',
    component: {
        render: () => import('#views/BasecampEruLarge'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Large',
        visibility: 'anything',
    },
});

const basecampFacilityManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/facility-management',
    component: {
        render: () => import('#views/BasecampFacilityManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp Facility Management',
        visibility: 'anything',
    },
});

const catalogueCash = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'cash',
    component: {
        render: () => import('#views/CatalogueCash'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cash and Vouchers Assistance Catalogue',
        visibility: 'anything',
    },
});

const cashAndVoucherAssistance = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'cash/cva',
    component: {
        render: () => import('#views/CashAndVoucherAssistance'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cash and Vouchers Assistance',
        visibility: 'anything',
    },
});

const catalogueCommunityEngagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'community',
    component: {
        render: () => import('#views/CatalogueCommunityEngagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Engagement and Accountability (CEA)',
        visibility: 'anything',
    },
});

const communityEngagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'community/community-engagement-accountability',
    component: {
        render: () => import('#views/CommunityEngagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Engagement and Accountability (CEA)',
        visibility: 'anything',
    },
});

const catalogueCommunication = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication',
    component: {
        render: () => import('#views/CatalogueCommunication'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication',
        visibility: 'anything',
    },
});

const communicationErtOne = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-1',
    component: {
        render: () => import('#views/CommunicationErtOne'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 1',
        visibility: 'anything',
    },
});

const communicationErtTwo = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-2',
    component: {
        render: () => import('#views/CommunicationErtTwo'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 2',
        visibility: 'anything',
    },
});

const communicationErtThree = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-3',
    component: {
        render: () => import('#views/CommunicationErtThree'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 3',
        visibility: 'anything',
    },
});

const catalogueHealth = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health',
    component: {
        render: () => import('#views/CatalogueHealth'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Health',
        visibility: 'anything',
    },

});

const healthEruClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-clinic',
    component: {
        render: () => import('#views/HealthEruClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Red Cross Red Crescent Emergency Clinic',
        visibility: 'anything',
    },
});

const healthEruHospital = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-hospital',
    component: {
        render: () => import('#views/HealthEruHospital'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Red Cross Red Crescent Emergency Hospital',
        visibility: 'anything',
    },
});

const healthSurgical = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-surgical',
    component: {
        render: () => import('#views/HealthSurgical'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Health Surgical',
        visibility: 'anything',
    },
});

const healthMaternalNewbornClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/maternal-newborn-clinic',
    component: {
        render: () => import('#views/HealthMaternalNewbornClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Maternal NewBorn Health Clinic',
        visibility: 'anything',
    },
});

const healthEmergencyClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/emergency-clinic',
    component: {
        render: () => import('#views/HealthEmergencyClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Mobile Clinic',
        visibility: 'anything',
    },
});

const healthEmergencyChloreaTreatment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/emergency-chlorea-treatment',
    component: {
        render: () => import('#views/HealthEmergencyChloreaTreatment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit Chlorea Treatment Center',
        visibility: 'anything',
    },
});

const healthCCMC = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-case-management-chlorea',
    component: {
        render: () => import('#views/HealthCCMC'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Case Management of Chlorea',
        visibility: 'anything',
    },
});

const healthCBS = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-based-surveillance',
    component: {
        render: () => import('#views/HealthCBS'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Based Surveillance',
        visibility: 'anything',
    },
});

const healthBurials = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/safe-dignified-burials',
    component: {
        render: () => import('#views/HealthBurials'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Safe and Dignified Burials',
        visibility: 'anything',
    },
});

const healthCCMM = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-management-malnutrition',
    component: {
        render: () => import('#views/HealthCCMM'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Case Management of Malnutrition',
        visibility: 'anything',
    },
});

const healthPSS = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/psychosocial-support',
    component: {
        render: () => import('#views/HealthPSS'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit Psychosocial Support',
        visibility: 'anything',
    },
});

const catalogueInformationManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management',
    component: {
        render: () => import('#views/CatalogueInformationManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management',
        visibility: 'anything',
    },

});

const informationManagementSatelliteImagery = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/satellite-imagery',
    component: {
        render: () => import('#views/InformationManagementSatelliteImagery'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Satellite Imagery',
        visibility: 'anything',
    },
});

const informationManagementRoles = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/roles-responsibility',
    component: {
        render: () => import('#views/InformationManagementRoles'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Roles and Responsibilities',
        visibility: 'anything',
    },
});

const informationManagementSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/support',
    component: {
        render: () => import('#views/InformationManagementSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management Support',
        visibility: 'anything',
    },
});

const informationManagementOperationsSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/operation-support',
    component: {
        render: () => import('#views/InformationManagementOperationsSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management Support for Operations',
        visibility: 'anything',
    },
});

const informationManagementComposition = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/composition',
    component: {
        render: () => import('#views/InformationManagementComposition'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Composition of IM Resources',
        visibility: 'anything',
    },
});

const catalogueLogistics = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics',
    component: {
        render: () => import('#views/CatalogueLogistics'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Logistics',
        visibility: 'anything',
    },
});

const logisticsEmergency = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics/logistics-eru',
    component: {
        render: () => import('#views/LogisticsEmergency'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit',
        visibility: 'anything',
    },
});

const logisticsNationalSocieties = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics/lpscm-for-national-societies',
    component: {
        render: () => import('#views/LogisticsNationalSocieties'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'LPSCM for National Societies',
        visibility: 'anything',
    },
});

const catalogueOperations = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'operations',
    component: {
        render: () => import('#views/CatalogueOperations'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Operations Management',
        visibility: 'anything',
    },
});

const emergencyOperations = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'operations/head-of-emergency-operations-heops',
    component: {
        render: () => import('#views/EmergencyOperations'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Head of Emergency Operations (HEOPS)',
        visibility: 'anything',
    },
});

const catalogueInformationTechnology = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-technology',
    component: {
        render: () => import('#views/CatalogueInformationTechnology'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Technology',
        visibility: 'anything',
    },
});

const informationTechnologyServices = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-technology/information-technology-services',
    component: {
        render: () => import('#views/InformationTechnologyServices'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Technology Service',
        visibility: 'anything',
    },
});

const catalogueLivelihood = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'livelihood',
    component: {
        render: () => import('#views/CatalogueLivelihood'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Livelihoods and Basic Needs',
        visibility: 'anything',
    },
});

const livelihoodServices = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'livelihood/livelihoods-and-basic-needs',
    component: {
        render: () => import('#views/LivelihoodServices'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Livelihood Service',
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
    path: 'dref-application/new',
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
    path: 'dref-application/:drefId/edit',
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
    path: 'dref-application/:drefId/export',
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

const drefOperationalUpdateExport = customWrapRoute({
    path: 'dref-operational-update/:opsUpdateId/export',
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

const drefFinalReportExport = customWrapRoute({
    path: 'dref-final-report/:finalReportId/export',
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
    drefOperationalUpdateExport,
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
    catalogueOverview,
    catalogueIndex,
    catalogueEmergency,
    assessmentCell,
    catalogueBasecamp,
    basecampEruSmall,
    basecampEruMedium,
    basecampEruLarge,
    basecampFacilityManagement,
    catalogueCash,
    cashAndVoucherAssistance,
    catalogueCommunityEngagement,
    communityEngagement,
    catalogueCommunication,
    communicationErtOne,
    communicationErtTwo,
    communicationErtThree,
    catalogueHealth,
    healthEruClinic,
    healthEruHospital,
    healthSurgical,
    healthMaternalNewbornClinic,
    healthEmergencyClinic,
    healthEmergencyChloreaTreatment,
    healthCCMC,
    healthCBS,
    healthBurials,
    healthCCMM,
    healthPSS,
    catalogueInformationManagement,
    informationManagementSatelliteImagery,
    informationManagementRoles,
    informationManagementSupport,
    informationManagementOperationsSupport,
    informationManagementComposition,
    catalogueInformationTechnology,
    informationTechnologyServices,
    catalogueLivelihood,
    threeWProjectDetail,
    livelihoodServices,
    catalogueLogistics,
    logisticsEmergency,
    logisticsNationalSocieties,
    catalogueOperations,
    emergencyOperations,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));

export default wrappedRoutes;

export type WrappedRoutes = typeof wrappedRoutes;
