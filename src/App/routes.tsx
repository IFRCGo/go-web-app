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

import Auth from './Auth';
import PageError from './PageError';

type ExtendedProps = {
    title: string,
    visibility: 'is-authenticated' | 'is-not-authenticated' | 'anything',
};
interface MyWrapRoute {
    <T>(
        myRouteOptions: MyInputIndexRouteObject<T, ExtendedProps>
    ): MyOutputIndexRouteObject<ExtendedProps>
    <T>(
        myRouteOptions: MyInputNonIndexRouteObject<T, ExtendedProps>
    ): MyOutputNonIndexRouteObject<ExtendedProps>
}
const myWrapRoute: MyWrapRoute = wrapRoute;

const root = myWrapRoute({
    path: '/',
    component: () => import('#views/RootLayout'),
    componentProps: {},
    errorElement: <PageError />,
    wrapperComponent: Auth,
    context: {
        title: '',
        visibility: 'anything',
    },
});

const login = myWrapRoute({
    path: 'login',
    component: () => import('#views/Login'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Login',
        visibility: 'is-not-authenticated',
    },
});

const register = myWrapRoute({
    path: 'register',
    component: () => import('#views/Register'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Register',
        visibility: 'is-not-authenticated',
    },
});

const home = myWrapRoute({
    index: true,
    component: () => import('#views/Home'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Home',
        visibility: 'anything',
    },
});

const region = myWrapRoute({
    path: 'regions/:regionId',
    component: () => import('#views/Region'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Region',
        visibility: 'anything',
    },
});

const country = myWrapRoute({
    path: 'countries/:countryId',
    component: () => import('#views/Country'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Country',
        visibility: 'anything',
    },
});

const emergencies = myWrapRoute({
    path: 'emergencies',
    component: () => import('#views/Emergencies'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Emergencies',
        visibility: 'anything',
    },
});

const emergency = myWrapRoute({
    path: 'countries/:emergencyId',
    component: () => import('#views/Emergency'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Emergency',
        visibility: 'anything',
    },
});

const surge = myWrapRoute({
    path: 'surge',
    component: () => import('#views/Surge'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Surge',
        visibility: 'anything',
    },
});

const preparedness = myWrapRoute({
    path: 'preparedness',
    component: () => import('#views/Preparedness'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness',
        visibility: 'anything',
    },
});

const threeW = myWrapRoute({
    path: 'three-w',
    component: () => import('#views/GlobalThreeW'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Three W',
        visibility: 'anything',
    },
});

const riskWatch = myWrapRoute({
    path: 'risk-watch',
    component: () => import('#views/GlobalRiskWatch'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Risk',
        visibility: 'anything',
    },
});

const account = myWrapRoute({
    path: 'account',
    component: () => import('#views/Account'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Account',
        visibility: 'is-authenticated',
    },
});

const resources = myWrapRoute({
    path: 'resources',
    component: () => import('#views/Resources'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Resources',
        visibility: 'anything',
    },
});

const search = myWrapRoute({
    path: 'search',
    component: () => import('#views/Search'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Search',
        visibility: 'anything',
    },
});

const goUI = myWrapRoute({
    path: 'go-ui',
    component: () => import('#views/GoUI'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Go UI',
        visibility: 'anything',
    },
});

const drefApplicationFormNew = myWrapRoute({
    path: '/dref-application/new/',
    component: () => import('#views/DrefApplicationForm'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Dref Application Form',
        visibility: 'is-authenticated',
    },
});

const drefApplicationFormEdit = myWrapRoute({
    path: '/dref-application/:drefId/edit/',
    component: () => import('#views/DrefApplicationForm'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'Dref Application Form',
        visibility: 'is-authenticated',
    },
});

const flashUpdateFormNew = myWrapRoute({
    path: '/flash-update/new/',
    component: () => import('#views/FlashUpdateForm'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Flash Update',
        visibility: 'is-authenticated',
    },
});

const fieldReportFormNew = myWrapRoute({
    path: '/field-report/new/',
    component: () => import('#views/FieldReportForm'),
    componentProps: {},
    parent: root,
    wrapperComponent: Auth,
    context: {
        title: 'New Field Report Form',
        visibility: 'is-authenticated',
    },
});

const wrappedRoutes = {
    root,
    login,
    register,
    home,
    region,
    country,
    emergencies,
    emergency,
    surge,
    preparedness,
    threeW,
    account,
    resources,
    goUI,
    drefApplicationFormNew,
    drefApplicationFormEdit,
    fieldReportFormNew,
    flashUpdateFormNew,
    riskWatch,
    search,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));

export default wrappedRoutes;
