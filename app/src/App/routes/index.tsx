import {
    generatePath,
    Navigate,
    useParams,
} from 'react-router-dom';

import { unwrapRoute } from '#utils/routes';

import Auth from '../Auth';
import {
    customWrapRoute,
    rootLayout,
} from './common';
import countryRoutes from './CountryRoutes';
import regionRoutes from './RegionRoutes';
import SmartNavigate from './SmartNavigate';
import surgeRoutes from './SurgeRoutes';

const fourHundredFour = customWrapRoute({
    parent: rootLayout,
    path: '*',
    component: {
        render: () => import('#views/FourHundredFour'),
        props: {},
    },
    context: {
        title: '404',
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

const recoverAccount = customWrapRoute({
    parent: rootLayout,
    path: 'recover-account',
    component: {
        render: () => import('#views/RecoverAccount'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Recover Account',
        visibility: 'is-not-authenticated',
    },
});

const recoverAccountConfirm = customWrapRoute({
    parent: rootLayout,
    path: 'recover-account/:username/:token',
    component: {
        render: () => import('#views/RecoverAccountConfirm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Recover Account Confirm',
        visibility: 'is-not-authenticated',
    },
});

const resendValidationEmail = customWrapRoute({
    parent: rootLayout,
    path: 'resend-validation-email',
    component: {
        render: () => import('#views/ResendValidationEmail'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Resend Validation Email',
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
const cookiePolicy = customWrapRoute({
    parent: rootLayout,
    path: 'cookie-policy',
    component: {
        render: () => import('#views/CookiePolicy'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cookie Policy',
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

const emergencySlug = customWrapRoute({
    parent: rootLayout,
    path: 'emergencies/slug/:slug',
    component: {
        render: () => import('#views/EmergencySlug'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency',
        visibility: 'anything',
    },
});

const emergencyFollow = customWrapRoute({
    parent: rootLayout,
    path: 'emergencies/:emergencyId/follow',
    component: {
        render: () => import('#views/EmergencyFollow'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Follow Emergency',
        visibility: 'is-authenticated',
    },
});

const emergencyIndex = customWrapRoute({
    parent: emergenciesLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: SmartNavigate,
        props: {
            to: 'details' satisfies DefaultEmergenciesChild,
            replace: true,
            hashToRouteMap: {
                '#details': 'details',
                '#reports': 'reports',
                '#activities': 'activities',
                '#surge': 'surge',
            },
            // TODO: make this typesafe
            forwardUnmatchedHashTo: 'additional-info',
        },
    },
    context: {
        title: 'Emergency',
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
        title: 'Emergency Reports and Documents',
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

// TODO: remove this route
const emergencyAdditionalInfoOne = customWrapRoute({
    parent: emergenciesLayout,
    path: 'additional-info-1',
    component: {
        render: () => import('#views/EmergencyAdditionalTab'),
        props: {
            infoPageId: 1,
        },
    },
    context: {
        title: 'Emergency Additional Tab 1',
        visibility: 'anything',
    },
});
// TODO: remove this route
const emergencyAdditionalInfoTwo = customWrapRoute({
    parent: emergenciesLayout,
    path: 'additional-info-2',
    component: {
        render: () => import('#views/EmergencyAdditionalTab'),
        props: {
            infoPageId: 2,
        },
    },
    context: {
        title: 'Emergency Additional Tab 2',
        visibility: 'anything',
    },
});
// TODO: remove this route
const emergencyAdditionalInfoThree = customWrapRoute({
    parent: emergenciesLayout,
    path: 'additional-info-3',
    component: {
        render: () => import('#views/EmergencyAdditionalTab'),
        props: {
            infoPageId: 3,
        },
    },
    context: {
        title: 'Emergency Additional Tab 3',
        visibility: 'anything',
    },
});

const emergencyAdditionalInfo = customWrapRoute({
    parent: emergenciesLayout,
    path: 'additional-info/:tabId?',
    component: {
        render: () => import('#views/EmergencyAdditionalTab'),
        props: {},
    },
    context: {
        title: 'Emergency Additional Info Tab',
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
        render: SmartNavigate,
        props: {
            to: 'global-summary' satisfies DefaultPreparednessChild,
            replace: true,
            hashToRouteMap: {
                '#global-summary': 'global-summary',
                '#global-performance': 'global-performance',
                '#resources-catalogue': 'resources-catalogue',
                '#operational-learning': 'operational-learning',
            },
        },
    },
    context: {
        title: 'Preparedness',
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
        title: 'Preparedness - Global Performance',
        visibility: 'anything',
    },
});

const preparednessGlobalCatalogue = customWrapRoute({
    parent: preparednessLayout,
    path: 'resources-catalogue',
    component: {
        render: () => import('#views/PreparednessCatalogueResources'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness - Catalogue of Learning',
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
        title: 'Global 3W',
        visibility: 'anything',
    },
});

const newThreeWProject = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/new',
    component: {
        render: () => import('#views/ThreeWDecommission'),
        props: { variant: 'page' },
    },
    wrapperComponent: Auth,
    context: {
        title: 'New 3W Project',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const threeWProjectDetail = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/:projectId/',
    component: {
        render: () => import('#views/ThreeWDecommission'),
        props: { variant: 'page' },
    },
    wrapperComponent: Auth,
    context: {
        title: '3W Project Details',
        visibility: 'anything',
    },
});

const threeWProjectEdit = customWrapRoute({
    parent: rootLayout,
    path: 'three-w/projects/:projectId/edit',
    component: {
        render: () => import('#views/ThreeWDecommission'),
        props: { variant: 'page' },
    },
    wrapperComponent: Auth,
    context: {
        title: 'Edit 3W Project',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'New 3W Activity',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: '3W Activity Detail',
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
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Risk Watch',
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
        title: 'Risk Watch',
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
        title: 'Seasonal Risk Watch',
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
        title: 'Imminent Risk Watch',
        visibility: 'anything',
    },
});

type DefaultAccountChild = 'details';
const accountLayout = customWrapRoute({
    parent: rootLayout,
    path: 'account',
    forwardPath: 'details' satisfies DefaultAccountChild,
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
        render: SmartNavigate,
        props: {
            to: 'details' satisfies DefaultAccountChild,
            replace: true,
            hashToRouteMap: {
                '#account-information': 'details',
                '#notifications': 'notifications',
                '#per-forms': 'my-forms/per',
                '#my-dref-applications': 'my-forms/dref',
                '#three-w-forms': 'my-forms/three-w',
            },
        },
    },
    context: {
        title: 'Account',
        visibility: 'anything',
    },
});

const accountDetails = customWrapRoute({
    parent: accountLayout,
    path: 'details' satisfies DefaultAccountChild,
    component: {
        render: () => import('#views/AccountDetails'),
        props: {},
    },
    context: {
        title: 'Account Details',
        visibility: 'is-authenticated',
    },
});

const termsAndConditions = customWrapRoute({
    parent: rootLayout,
    path: 'terms-and-conditions',
    component: {
        render: () => import('#views/TermsAndConditions'),
        props: {},
    },
    context: {
        title: 'Terms And Conditions',
        visibility: 'anything',
    },
});
type DefaultAccountMyFormsChild = 'field-report';
const accountMyFormsLayout = customWrapRoute({
    parent: accountLayout,
    path: 'my-forms',
    forwardPath: 'field-report' satisfies DefaultAccountMyFormsChild,
    component: {
        render: () => import('#views/AccountMyFormsLayout'),
        props: {},
    },
    context: {
        title: 'Account - My Forms',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const accountMyFormsIndex = customWrapRoute({
    parent: accountMyFormsLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'field-report' satisfies DefaultAccountMyFormsChild,
            replace: true,
        },
    },
    context: {
        title: 'Account - My Forms',
        visibility: 'anything',
    },
});

const accountMyFormsFieldReport = customWrapRoute({
    parent: accountMyFormsLayout,
    path: 'field-report' satisfies DefaultAccountMyFormsChild,
    component: {
        render: () => import('#views/AccountMyFormsFieldReport'),
        props: {},
    },
    context: {
        title: 'Account - Field Report Forms',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const accountMyFormsPer = customWrapRoute({
    parent: accountMyFormsLayout,
    path: 'per',
    component: {
        render: () => import('#views/AccountMyFormsPer'),
        props: {},
    },
    context: {
        title: 'Account - PER Forms',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const accountMyFormsDref = customWrapRoute({
    parent: accountMyFormsLayout,
    path: 'dref',
    component: {
        render: () => import('#views/AccountMyFormsDref'),
        props: {},
    },
    context: {
        title: 'Account - DREF Applications',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const accountMyFormsThreeW = customWrapRoute({
    parent: accountMyFormsLayout,
    path: 'three-w',
    component: {
        render: () => import('#views/AccountMyFormsThreeW'),
        props: {},
    },
    context: {
        title: 'Account - 3W',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Account - Notifications',
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
const operationalLearning = customWrapRoute({
    parent: rootLayout,
    path: 'operational-learning',
    component: {
        render: () => import('#views/OperationalLearning'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Operational Learning',
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
        render: () => import('#views/ThreeWDecommission'),
        props: { variant: 'page' },
    },
    wrapperComponent: Auth,
    context: {
        title: 'All 3W Projects',
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
        title: 'All 3W Activities',
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
        visibility: 'is-authenticated',
        permissions: ({ isIfrcAdmin }) => isIfrcAdmin,
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
        permissions: ({ isIfrcAdmin }) => isIfrcAdmin,
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
        title: 'Edit Flash Update',
        visibility: 'is-authenticated',
        permissions: ({ isIfrcAdmin }) => isIfrcAdmin,
    },
});

// FIXME: rename this route to flashUpdateDetails
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
        permissions: ({ isIfrcAdmin }) => isIfrcAdmin,
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

const newDrefApplicationForm = customWrapRoute({
    parent: rootLayout,
    path: 'dref-applications/new',
    component: {
        render: () => import('#views/DrefApplicationForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New DREF Application Form',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Edit DREF Application Form',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'DREF Application Export',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Edit DREF Operational Update Form',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'DREF Operational Update Export',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Edit DREF Final Report Form',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'DREF Final Report Export',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

// TODO: Remove me after implementation of DrefFinalReport for imminent
const oldDrefFinalReportForm = customWrapRoute({
    parent: rootLayout,
    path: 'old-dref-final-reports/:finalReportId/edit',
    component: {
        render: () => import('#views/OldDrefFinalReportForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Edit DREF Final Report Form',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const oldDrefFinalReportExport = customWrapRoute({
    path: 'old-dref-final-reports/:finalReportId/export',
    component: {
        render: () => import('#views/OldDrefFinalReportExport'),
        props: {},
    },
    parent: rootLayout,
    wrapperComponent: Auth,
    context: {
        title: 'DREF Final Report Export',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

const fieldReportFormNew = customWrapRoute({
    parent: rootLayout,
    path: 'field-reports/new',
    component: {
        render: () => import('#views/FieldReportForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'New Field Report Form',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'PER Process',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'PER Process',
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
        title: 'New PER Overview',
        visibility: 'is-authenticated',
        permissions: ({
            isSuperUser,
            isPerAdmin,
        }) => isSuperUser || isPerAdmin,
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
        title: 'Edit PER Overview',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Edit PER Assessment',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Edit PER Prioritization',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
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
        title: 'Edit PER Work Plan',
        visibility: 'is-authenticated',
        permissions: ({ isGuestUser }) => !isGuestUser,
    },
});

// Redirect Routes
const preparednessOperationalLearning = customWrapRoute({
    parent: preparednessLayout,
    path: 'operational-learning',
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: operationalLearning.absolutePath,
        },
    },
    wrapperComponent: Auth,
    context: {
        title: 'Operational Learning',
        visibility: 'anything',
    },
});

// eslint-disable-next-line react-refresh/only-export-components
function ObsoleteFieldReportRedirection() {
    const params = useParams<{
        fieldReportId: string,
    }>();

    const path = generatePath(
        fieldReportDetails.absoluteForwardPath,
        { fieldReportId: params.fieldReportId },
    );

    return (
        <Navigate
            to={path}
            replace
        />
    );
}

const obsoleteFieldReportDetails = customWrapRoute({
    parent: rootLayout,
    path: 'reports/:fieldReportId',
    component: {
        eagerLoad: true,
        render: ObsoleteFieldReportRedirection,
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Field Report Details',
        visibility: 'anything',
    },
});

const montandonLandingPage = customWrapRoute({
    parent: rootLayout,
    path: 'montandon-landing',
    component: {
        render: () => import('#views/MontandonLandingPage'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Montandon',
        visibility: 'anything',
    },
});

const wrappedRoutes = {
    fourHundredFour,
    rootLayout,
    login,
    register,
    recoverAccount,
    recoverAccountConfirm,
    resendValidationEmail,
    home,
    emergencies,
    cookiePolicy,
    emergencySlug,
    emergencyFollow,
    emergenciesLayout,
    emergencyDetails,
    emergencyIndex,
    emergencyReportsAndDocuments,
    emergencyActivities,
    emergencySurge,
    emergencyAdditionalInfoOne,
    emergencyAdditionalInfoTwo,
    emergencyAdditionalInfoThree,
    emergencyAdditionalInfo,
    preparednessLayout,
    preparednessGlobalSummary,
    preparednessGlobalPerformance,
    preparednessGlobalCatalogue,
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
    accountDetails,
    accountMyFormsLayout,
    accountMyFormsIndex,
    accountNotifications,
    accountMyFormsFieldReport,
    accountMyFormsPer,
    accountMyFormsDref,
    accountMyFormsThreeW,
    resources,
    search,
    allThreeWProject,
    allThreeWActivity,
    allAppeals,
    allEmergencies,
    allFieldReports,
    allSurgeAlerts,
    allFlashUpdates,
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
    termsAndConditions,
    operationalLearning,
    montandonLandingPage,
    ...regionRoutes,
    ...countryRoutes,
    ...surgeRoutes,

    // TODO: Remove me after implementation of DrefFinalReport for imminent
    oldDrefFinalReportForm,
    oldDrefFinalReportExport,
    // Redirects
    preparednessOperationalLearning,
    obsoleteFieldReportDetails,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));

export default wrappedRoutes;

export type WrappedRoutes = typeof wrappedRoutes;
