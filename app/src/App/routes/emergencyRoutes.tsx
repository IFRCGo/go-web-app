import Auth from '../Auth';
import {
    customWrapRoute,
    rootLayout,
} from './common';
import SmartNavigate from './SmartNavigate';

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

const emergencyBackground = customWrapRoute({
    parent: emergenciesLayout,
    path: 'background',
    component: {
        render: () => import('#views/EmergencyBackground'),
        props: {},
    },
    context: {
        title: 'Emergency Background',
        visibility: 'anything',
    },
});

const emergencyActionsSummary = customWrapRoute({
    parent: emergenciesLayout,
    path: 'actions-summary',
    component: {
        render: () => import('#views/EmergencyActionsSummary'),
        props: {},
    },
    context: {
        title: 'Emergency Actions Summary',
        visibility: 'anything',
    },
});

const emergencyOperationStrategy = customWrapRoute({
    parent: emergenciesLayout,
    path: 'operation-strategy',
    component: {
        render: () => import('#views/EmergencyOperationStrategy'),
        props: {},
    },
    context: {
        title: 'Emergency Operation Strategy',
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

export default {
    emergencies,
    emergencySlug,
    emergencyFollow,
    emergenciesLayout,
    emergencyDetails,
    emergencyIndex,
    emergencyReportsAndDocuments,
    emergencyActivities,
    emergencyActionsSummary,
    emergencyBackground,
    emergencyOperationStrategy,
    emergencySurge,
    emergencyAdditionalInfoOne,
    emergencyAdditionalInfoTwo,
    emergencyAdditionalInfoThree,
    emergencyAdditionalInfo,
};
