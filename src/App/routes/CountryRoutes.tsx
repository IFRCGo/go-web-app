import {
    Navigate,
    generatePath,
    useParams,
} from 'react-router-dom';
import { isDefined, isTruthyString } from '@togglecorp/fujs';

import {
    COUNTRY_AFRICA_REGION,
    COUNTRY_AMERICAS_REGION,
    COUNTRY_ASIA_REGION,
    COUNTRY_EUROPE_REGION,
    COUNTRY_MENA_REGION,
    REGION_AFRICA,
    REGION_AMERICAS,
    REGION_ASIA,
    REGION_EUROPE,
    REGION_MENA,
} from '#utils/constants';

import Auth from '../Auth';
import {
    customWrapRoute,
    rootLayout,
} from './common';
import regionRoutes from './RegionRoutes';
import SmartNavigate from './SmartNavigate';

type DefaultCountriesChild = 'ongoing-activities';
const countriesLayout = customWrapRoute({
    parent: rootLayout,
    path: 'countries/:countryId',
    forwardPath: 'ongoing-activities' satisfies DefaultCountriesChild,
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

// eslint-disable-next-line react-refresh/only-export-components
function CountryNavigate() {
    // FIXME: this function might not be necessary anymore

    const params = useParams<{ countryId: string }>();
    const countryIdToRegionIdMap: Record<number, number> = {
        [COUNTRY_AFRICA_REGION]: REGION_AFRICA,
        [COUNTRY_AMERICAS_REGION]: REGION_AMERICAS,
        [COUNTRY_ASIA_REGION]: REGION_ASIA,
        [COUNTRY_EUROPE_REGION]: REGION_EUROPE,
        [COUNTRY_MENA_REGION]: REGION_MENA,
    };

    const countryId = isTruthyString(params.countryId) ? parseInt(params.countryId, 10) : undefined;
    const regionId = isDefined(countryId) ? countryIdToRegionIdMap[countryId] : undefined;

    if (isDefined(regionId)) {
        const regionPath = generatePath(
            regionRoutes.regionIndex.absoluteForwardPath,
            { regionId },
        );
        return (
            <Navigate
                to={regionPath}
                replace
            />
        );
    }

    return (
        <SmartNavigate
            to={'ongoing-activities' satisfies DefaultCountriesChild}
            replace
            hashToRouteMap={{
                '#3w': 'three-w',
                '#operations': 'operations',
                '#risk-watch': 'risk-watch',
                '#preparedness': 'preparedness',
                '#country-plan': 'plan',
                '#additional': 'additional-info',
            }}
        />
    );
}

const countryIndex = customWrapRoute({
    parent: countriesLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: CountryNavigate,
        props: {},
    },
    context: {
        title: 'Country',
        visibility: 'anything',
    },
});

type DefaultOngoingActivitiesChild = 'emergencies';
const countryOngoingActivitiesLayout = customWrapRoute({
    parent: countriesLayout,
    path: 'ongoing-activities',
    forwardPath: 'emergencies' satisfies DefaultOngoingActivitiesChild,
    component: {
        render: () => import('#views/CountryOngoingActivities'),
        props: {},
    },
    context: {
        title: 'Country Ongoing Activities',
        visibility: 'anything',
    },
});

const countryOngoingActivitiesIndex = customWrapRoute({
    parent: countryOngoingActivitiesLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'emergencies' satisfies DefaultOngoingActivitiesChild,
            replace: true,
        },
    },
    context: {
        title: 'Country Ongoing Activities Index',
        visibility: 'anything',
    },
});

const countryOngoingActivitiesEmergencies = customWrapRoute({
    parent: countryOngoingActivitiesLayout,
    path: 'emergencies' satisfies DefaultOngoingActivitiesChild,
    component: {
        render: () => import('#views/CountryOngoingActivitiesEmergencies'),
        props: {},
    },
    context: {
        title: 'Country Ongoing Emergencies',
        visibility: 'anything',
    },
});

const countryOngoingActivitiesThreeWActivities = customWrapRoute({
    parent: countryOngoingActivitiesLayout,
    path: 'three-w/activities',
    component: {
        render: () => import('#views/CountryOngoingActivitiesThreeWActivities'),
        props: {},
    },
    context: {
        title: 'Country 3W Activities',
        visibility: 'anything',
    },
});

const countryOngoingActivitiesThreeWProjects = customWrapRoute({
    parent: countryOngoingActivitiesLayout,
    path: 'three-w/projects',
    component: {
        render: () => import('#views/CountryOngoingActivitiesThreeWProjects'),
        props: {},
    },
    context: {
        title: 'Country 3W Projects',
        visibility: 'anything',
    },
});

type DefaultNsOverviewChild = 'activities';
const countryNsOverviewLayout = customWrapRoute({
    parent: countriesLayout,
    path: 'ns-overview',
    forwardPath: 'activities' satisfies DefaultNsOverviewChild,
    component: {
        render: () => import('#views/CountryNsOverview'),
        props: {},
    },
    context: {
        title: 'Country NS Overview',
        visibility: 'anything',
    },
});

const countryNsOverviewIndex = customWrapRoute({
    parent: countryNsOverviewLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'activities' satisfies DefaultNsOverviewChild,
            replace: true,
        },
    },
    context: {
        title: 'Country National Society Overview Index',
        visibility: 'anything',
    },
});

const countryNsOverviewActivities = customWrapRoute({
    parent: countryNsOverviewLayout,
    path: 'activities',
    component: {
        render: () => import('#views/CountryNsOverviewActivities'),
        props: {},
    },
    context: {
        title: 'Country NS Activities',
        visibility: 'anything',
    },
});

const countryNsOverviewContextAndStructure = customWrapRoute({
    parent: countryNsOverviewLayout,
    path: 'context-and-structure',
    component: {
        render: () => import('#views/CountryNsOverviewContextAndStructure'),
        props: {},
    },
    context: {
        title: 'Country NS Context and Structure',
        visibility: 'anything',
    },
});

const countryNsOverviewStrategicPriorities = customWrapRoute({
    parent: countryNsOverviewLayout,
    path: 'strategic-priorities',
    component: {
        render: () => import('#views/CountryNsOverviewStrategicPriorities'),
        props: {},
    },
    context: {
        title: 'Country NS Context and Structure',
        visibility: 'anything',
    },
});

const countryNsOverviewCapacity = customWrapRoute({
    parent: countryNsOverviewLayout,
    path: 'capacity',
    component: {
        render: () => import('#views/CountryNsOverviewCapacity'),
        props: {},
    },
    context: {
        title: 'Country NS Context and Structure',
        visibility: 'anything',
    },
});

type DefaultCountryProfileChild = 'overview';
const countryProfileLayout = customWrapRoute({
    parent: countriesLayout,
    path: 'profile',
    forwardPath: 'overview' satisfies DefaultCountryProfileChild,
    component: {
        render: () => import('#views/CountryProfile'),
        props: {},
    },
    context: {
        title: 'Country Profile',
        visibility: 'anything',
    },
});

const countryProfileIndex = customWrapRoute({
    parent: countryProfileLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'overview' satisfies DefaultCountryProfileChild,
            replace: true,
        },
    },
    context: {
        title: 'Country Profile Index',
        visibility: 'anything',
    },
});

const countryProfileOverview = customWrapRoute({
    parent: countryProfileLayout,
    path: 'overview',
    component: {
        render: () => import('#views/CountryProfileOverview'),
        props: {},
    },
    context: {
        title: 'Country Profile Overview',
        visibility: 'anything',
    },
});

const countryProfileSupportingPartners = customWrapRoute({
    parent: countryProfileLayout,
    path: 'supporting-partners',
    component: {
        render: () => import('#views/CountryProfileSupportingPartners'),
        props: {},
    },
    context: {
        title: 'Country Profile Supporting Partners',
        visibility: 'anything',
    },
});

const countryProfilePreviousEvents = customWrapRoute({
    parent: countryProfileLayout,
    path: 'previous-events',
    component: {
        render: () => import('#views/CountryProfilePreviousEvents'),
        props: {},
    },
    context: {
        title: 'Country Profile Previous Events',
        visibility: 'anything',
    },
});

const countryProfileSeasonalRisks = customWrapRoute({
    parent: countryProfileLayout,
    path: 'risk-watch',
    component: {
        render: () => import('#views/CountryProfileRiskWatch'),
        props: {},
    },
    context: {
        title: 'Country Profile Seasonal Risks',
        visibility: 'anything',
    },
});

const countryOperations = customWrapRoute({
    parent: countriesLayout,
    path: 'ongoing-activities' satisfies DefaultCountriesChild,
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
        title: 'Country 3W',
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
        title: 'Country 3W National Society Projects',
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

const countryAdditionalInfo = customWrapRoute({
    parent: countriesLayout,
    path: 'additional-info',
    component: {
        render: () => import('#views/CountryAdditionalInfo'),
        props: {},
    },
    context: {
        title: 'Country Additional Info',
        visibility: 'anything',
    },
});

export default {
    countriesLayout,
    countryIndex,

    countryOngoingActivitiesLayout,
    countryOngoingActivitiesIndex,
    countryOngoingActivitiesEmergencies,
    countryOngoingActivitiesThreeWActivities,
    countryOngoingActivitiesThreeWProjects,

    countryNsOverviewLayout,
    countryNsOverviewIndex,
    countryNsOverviewActivities,
    countryNsOverviewContextAndStructure,
    countryNsOverviewStrategicPriorities,
    countryNsOverviewCapacity,

    countryProfileLayout,
    countryProfileIndex,
    countryProfileOverview,
    countryProfileSupportingPartners,
    countryProfilePreviousEvents,
    countryProfileSeasonalRisks,

    countryAdditionalInfo,

    // TODO: following routes should be removed
    countryOperations,
    countriesThreeWLayout,
    countryThreeWProjects,
    countryThreeWNationalSocietyProjects,
    countryThreeWIndex,
    countryPreparedness,
};
