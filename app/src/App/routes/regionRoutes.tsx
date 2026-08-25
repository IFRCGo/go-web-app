import { Navigate } from 'react-router-dom';

import Auth from '../Auth';
import {
    customWrapRoute,
    rootLayout,
} from './common';
import SmartNavigate from './SmartNavigate';

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
        render: SmartNavigate,
        props: {
            to: 'operations' satisfies DefaultRegionsChild,
            replace: true,
            hashToRouteMap: {
                '#operations': 'operations',
                '#3w': 'three-w',
                '#risk-watch': 'risk-watch',
                '#regional-profile': 'profile',
                '#preparedness': 'preparedness',
                '#additional-info': 'additional-info',
            },
        },
    },
    context: {
        title: 'Region',
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
        render: () => import('#views/ThreeWDecommission'),
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
        title: 'Region Risk Watch',
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
        title: 'Region Imminent Risk Watch',
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
        title: 'Region Seasonal Risk Watch',
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

export default {
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
};
