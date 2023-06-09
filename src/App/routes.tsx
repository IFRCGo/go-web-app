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

import Auth from './Auth';

import PageError from './PageError';

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

const root = customWrapRoute({
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
    path: 'login',
    component: {
        render: () => import('#views/Login'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Login',
        visibility: 'is-not-authenticated',
    },
});

const register = customWrapRoute({
    path: 'register',
    component: {
        render: () => import('#views/Register'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Register',
        visibility: 'is-not-authenticated',
    },
});

const home = customWrapRoute({
    index: true,
    component: {
        render: () => import('#views/Home'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Home',
        visibility: 'anything',
    },
});

const region = customWrapRoute({
    path: 'regions/:regionId',
    component: {
        render: () => import('#views/Region'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Region',
        visibility: 'anything',
    },
});

const regionOperations = customWrapRoute({
    path: 'operations',
    component: {
        render: () => import('#views/RegionOperations'),
        props: {},
    },
    parent: region,
    context: {
        title: 'Region Operations',
        visibility: 'anything',
    },
});

const regionIndex = customWrapRoute({
    parent: region,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: regionOperations.path as string,
            replace: true,
        },
    },
    context: {
        title: 'Region index',
        visibility: 'anything',
    },
});

const regionThreeW = customWrapRoute({
    path: 'three-w',
    component: {
        render: () => import('#views/RegionThreeW'),
        props: {},
    },
    parent: region,
    context: {
        title: 'Region 3W',
        visibility: 'anything',
    },
});

const regionRiskWatch = customWrapRoute({
    path: 'risk-watch',
    component: {
        render: () => import('#views/RegionRiskWatch'),
        props: {},
    },
    parent: region,
    context: {
        title: 'Region Risk Watch',
        visibility: 'anything',
    },
});

const regionPreparedness = customWrapRoute({
    path: 'preparedness',
    component: {
        render: () => import('#views/RegionPreparedness'),
        props: {},
    },
    parent: region,
    context: {
        title: 'Region Preparedness',
        visibility: 'anything',
    },
});

const regionProfile = customWrapRoute({
    path: 'profile',
    component: {
        render: () => import('#views/RegionProfile'),
        props: {},
    },
    parent: region,
    context: {
        title: 'Region Profile',
        visibility: 'anything',
    },
});

const country = customWrapRoute({
    path: 'countries/:countryId',
    component: {
        render: () => import('#views/Country'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Country',
        visibility: 'anything',
    },
});

const countryOperations = customWrapRoute({
    path: 'operations',
    component: {
        render: () => import('#views/CountryOperations'),
        props: {},
    },
    parent: country,
    context: {
        title: 'Country Operations',
        visibility: 'anything',
    },
});

const countryIndex = customWrapRoute({
    parent: country,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: countryOperations.path as string,
            replace: true,
        },
    },
    context: {
        title: 'Country index',
        visibility: 'anything',
    },
});

const countryThreeW = customWrapRoute({
    path: 'three-w',
    component: {
        render: () => import('#views/CountryThreeW'),
        props: {},
    },
    parent: country,
    context: {
        title: 'Country 3W',
        visibility: 'anything',
    },
});

const countryRiskWatch = customWrapRoute({
    path: 'risk-watch',
    component: {
        render: () => import('#views/CountryRiskWatch'),
        props: {},
    },
    parent: country,
    context: {
        title: 'Country Risk Watch',
        visibility: 'anything',
    },
});

const countryPreparedness = customWrapRoute({
    path: 'preparedness',
    component: {
        render: () => import('#views/CountryPreparedness'),
        props: {},
    },
    parent: country,
    context: {
        title: 'Country Preparedness',
        visibility: 'anything',
    },
});

const countryPlan = customWrapRoute({
    path: 'plan',
    component: {
        render: () => import('#views/CountryPlan'),
        props: {},
    },
    parent: country,
    context: {
        title: 'Country Plan',
        visibility: 'anything',
    },
});

const countryAdditionalData = customWrapRoute({
    path: 'additional-data',
    component: {
        render: () => import('#views/CountryAdditionalData'),
        props: {},
    },
    parent: country,
    context: {
        title: 'Country Additional Data',
        visibility: 'anything',
    },
});

const emergencies = customWrapRoute({
    path: 'emergencies',
    component: {
        render: () => import('#views/Emergencies'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Emergencies',
        visibility: 'anything',
    },
});

const emergency = customWrapRoute({
    path: 'emergencies/:emergencyId',
    component: {
        render: () => import('#views/Emergency'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Emergency',
        visibility: 'anything',
    },
});

const emergencyDetails = customWrapRoute({
    path: 'details',
    component: {
        render: () => import('#views/EmergencyDetails'),
        props: {},
    },
    parent: emergency,
    context: {
        title: 'Emergency Details',
        visibility: 'anything',
    },
});

const emergencyIndex = customWrapRoute({
    parent: emergency,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: emergencyDetails.path as string,
            replace: true,
        },
    },
    context: {
        title: 'Emergency index',
        visibility: 'anything',
    },
});
const emergencyReportsAndDocuments = customWrapRoute({
    path: 'reports',
    component: {
        render: () => import('#views/EmergencyReportAndDocument'),
        props: {},
    },
    parent: emergency,
    context: {
        title: 'Emergency Reports/Documents',
        visibility: 'anything',
    },
});
const emergencyActivities = customWrapRoute({
    path: 'activities',
    component: {
        render: () => import('#views/EmergencyActivities'),
        props: {},
    },
    parent: emergency,
    context: {
        title: 'Emergency Activities',
        visibility: 'anything',
    },
});
const emergencySurge = customWrapRoute({
    path: 'surge',
    component: {
        render: () => import('#views/EmergencySurge'),
        props: {},
    },
    parent: emergency,
    context: {
        title: 'Emergency Surge',
        visibility: 'anything',
    },
});

const surge = customWrapRoute({
    path: 'surge',
    component: {
        render: () => import('#views/Surge'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Surge',
        visibility: 'anything',
    },
});

const surgeOverview = customWrapRoute({
    path: 'overview',
    component: {
        render: () => import('#views/SurgeOverview'),
        props: {},
    },
    parent: surge,
    context: {
        title: 'Surge Overview',
        visibility: 'anything',
    },
});

const surgeOperationalToolbox = customWrapRoute({
    path: 'operational-toolbox',
    component: {
        render: () => import('#views/SurgeOperationalToolbox'),
        props: {},
    },
    parent: surge,
    context: {
        title: 'Surge Operational Toolbox',
        visibility: 'anything',
    },
});

const surgeCatalogue = customWrapRoute({
    path: 'catalogue',
    component: {
        render: () => import('#views/SurgeCatalogue'),
        props: {},
    },
    parent: surge,
    context: {
        title: 'Surge Services Catalogue',
        visibility: 'anything',
    },
});

const surgeIndex = customWrapRoute({
    parent: surge,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: surgeOverview.path as string,
            replace: true,
        },
    },
    context: {
        title: 'Surge index',
        visibility: 'anything',
    },
});

const preparedness = customWrapRoute({
    path: 'preparedness',
    component: {
        render: () => import('#views/Preparedness'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness',
        visibility: 'anything',
    },
});

const threeW = customWrapRoute({
    path: 'three-w',
    component: {
        render: () => import('#views/GlobalThreeW'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Three W',
        visibility: 'anything',
    },
});

const riskWatch = customWrapRoute({
    path: 'risk-watch',
    component: {
        render: () => import('#views/GlobalRiskWatch'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Risk',
        visibility: 'anything',
    },
});

const account = customWrapRoute({
    path: 'account',
    component: {
        render: () => import('#views/Account'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Account',
        visibility: 'is-authenticated',
    },
});

const accountInformation = customWrapRoute({
    path: 'account-information',
    component: {
        render: () => import('#views/AccountInformation'),
        props: {},
    },
    parent: account,
    context: {
        title: 'Account Information',
        visibility: 'is-authenticated',
    },
});

const accountIndex = customWrapRoute({
    parent: account,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: accountInformation.path as string,
            replace: true,
        },
    },
    context: {
        title: 'Account index',
        visibility: 'anything',
    },
});

const accountNotifications = customWrapRoute({
    path: 'notifications',
    component: {
        render: () => import('#views/AccountNotifications'),
        props: {},
    },
    parent: account,
    context: {
        title: 'Account Notifications',
        visibility: 'is-authenticated',
    },
});

const accountPerForms = customWrapRoute({
    path: 'per-forms',
    component: {
        render: () => import('#views/AccountPerForms'),
        props: {},
    },
    parent: account,
    context: {
        title: 'Account PER Forms',
        visibility: 'is-authenticated',
    },
});

const accountDrefApplications = customWrapRoute({
    path: 'dref-applications',
    component: {
        render: () => import('#views/AccountDrefApplications'),
        props: {},
    },
    parent: account,
    context: {
        title: 'Account DREF Applications',
        visibility: 'is-authenticated',
    },
});

const accountThreeWForms = customWrapRoute({
    path: 'three-w-forms',
    component: {
        render: () => import('#views/AccountThreeWForms'),
        props: {},
    },
    parent: account,
    context: {
        title: 'Account DREF Applications',
        visibility: 'is-authenticated',
    },
});

const resources = customWrapRoute({
    path: 'resources',
    component: {
        render: () => import('#views/Resources'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Resources',
        visibility: 'anything',
    },
});

const search = customWrapRoute({
    path: 'search',
    component: {
        render: () => import('#views/Search'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Search',
        visibility: 'anything',
    },
});

const allThreeW = customWrapRoute({
    path: 'three-w/all',
    component: {
        render: () => import('#views/AllThreeW'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All 3W',
        visibility: 'anything',
    },
});

const allAppeals = customWrapRoute({
    path: 'appeals/all',
    component: {
        render: () => import('#views/AllAppeals'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Appeals',
        visibility: 'anything',
    },
});

const allEmergencies = customWrapRoute({
    path: 'emergencies/all',
    component: {
        render: () => import('#views/AllEmergencies'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Emergencies',
        visibility: 'anything',
    },
});

const allFieldReports = customWrapRoute({
    path: 'field-reports/all',
    component: {
        render: () => import('#views/AllFieldReports'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Field Reports',
        visibility: 'anything',
    },
});

const allFlashUpdates = customWrapRoute({
    path: 'flash-updates/all',
    component: {
        render: () => import('#views/AllFlashUpdates'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Flash Updates',
        visibility: 'anything',
    },
});

const allSurgeAlerts = customWrapRoute({
    path: 'alerts/all',
    component: {
        render: () => import('#views/AllSurgeAlerts'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Surge Alerts',
        visibility: 'anything',
    },
});

const allDeployedPersonnel = customWrapRoute({
    path: 'personnel/all',
    component: {
        render: () => import('#views/AllDeployedPersonnel'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Deployed Personnel',
        visibility: 'anything',
    },
});

const allDeployedEmergencyResponseUnits = customWrapRoute({
    path: 'eru/all',
    component: {
        render: () => import('#views/AllDeployedEmergencyResponseUnits'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'All Deployed Emergency Response Units',
        visibility: 'anything',
    },
});

const newDrefApplicationForm = customWrapRoute({
    path: 'dref-application/new',
    component: {
        render: () => import('#views/DrefApplicationForm'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Dref Application Form',
        visibility: 'is-authenticated',
    },
});

const drefApplicationForm = customWrapRoute({
    path: 'dref-application/:drefId/edit',
    component: {
        render: () => import('#views/DrefApplicationForm'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Dref Application Form',
        visibility: 'is-authenticated',
    },
});

const flashUpdateFormNew = customWrapRoute({
    path: 'flash-update/new',
    component: {
        render: () => import('#views/FlashUpdateForm'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Flash Update',
        visibility: 'is-authenticated',
    },
});

const fieldReportFormNew = customWrapRoute({
    path: 'field-report/new',
    component: {
        render: () => import('#views/FieldReportForm'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Field Report Form',
        visibility: 'is-authenticated',
    },
});

const perProcessForm = customWrapRoute({
    path: 'per-process',
    component: {
        render: () => import('#views/PerProcessForm'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process',
        visibility: 'is-authenticated',
    },
});

const newPerOverviewForm = customWrapRoute({
    path: 'new',
    component: {
        render: () => import('#views/PerOverviewForm'),
        props: {},
    },
    parent: perProcessForm,
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process',
        visibility: 'is-authenticated',
    },
});

const perOverviewForm = customWrapRoute({
    path: ':perId/overview',
    component: {
        render: () => import('#views/PerOverviewForm'),
        props: {},
    },
    parent: perProcessForm,
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process',
        visibility: 'is-authenticated',
    },
});

const perAssessmentForm = customWrapRoute({
    path: ':perId/assessment',
    component: {
        render: () => import('#views/PerAssessmentForm'),
        props: {},
    },
    parent: perProcessForm,
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process Form',
        visibility: 'is-authenticated',
    },
});

const perPrioritizationForm = customWrapRoute({
    path: ':perId/prioritization',
    component: {
        render: () => import('#views/PerPrioritizationForm'),
        props: {},
    },
    parent: perProcessForm,
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process Form',
        visibility: 'is-authenticated',
    },
});

const perWorkPlanForm = customWrapRoute({
    path: ':perId/work-plan',
    component: {
        render: () => import('#views/PerWorkPlanForm'),
        props: {},
    },
    parent: perProcessForm,
    wrapperComponent: Auth,
    context: {
        title: 'New Per Process Form',
        visibility: 'is-authenticated',
    },
});

const goUI = customWrapRoute({
    path: 'go-ui',
    component: {
        render: () => import('#views/GoUI'),
        props: {},
    },
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'GO UI',
        visibility: 'anything',
    },
});

const wrappedRoutes = {
    root,
    login,
    register,
    home,
    region,
    regionIndex,
    regionOperations,
    regionThreeW,
    regionRiskWatch,
    regionPreparedness,
    regionProfile,
    country,
    countryIndex,
    countryOperations,
    countryThreeW,
    countryRiskWatch,
    countryPreparedness,
    countryPlan,
    countryAdditionalData,
    emergencies,
    emergency,
    emergencyDetails,
    emergencyIndex,
    emergencyReportsAndDocuments,
    emergencyActivities,
    emergencySurge,
    surge,
    surgeOverview,
    surgeOperationalToolbox,
    surgeCatalogue,
    surgeIndex,
    preparedness,
    threeW,
    account,
    accountIndex,
    accountInformation,
    accountNotifications,
    accountPerForms,
    accountDrefApplications,
    accountThreeWForms,
    resources,
    search,
    allThreeW,
    allAppeals,
    allEmergencies,
    allFieldReports,
    allSurgeAlerts,
    allFlashUpdates,
    allDeployedPersonnel,
    allDeployedEmergencyResponseUnits,
    goUI,
    newDrefApplicationForm,
    drefApplicationForm,
    fieldReportFormNew,
    flashUpdateFormNew,
    riskWatch,
    perProcessForm,
    perOverviewForm,
    newPerOverviewForm,
    perAssessmentForm,
    perPrioritizationForm,
    perWorkPlanForm,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));

export default wrappedRoutes;

export type WrappedRoutes = typeof wrappedRoutes;
