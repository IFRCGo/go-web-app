import { wrapRoute, unwrapRoute } from '#utils/routes';

import PageError from './PageError';

const root = wrapRoute({
    title: '',
    path: '/',
    component: () => import('#views/RootLayout'),
    componentProps: {},
    errorElement: <PageError />,
});

const login = wrapRoute({
    title: 'Login',
    path: 'login',
    component: () => import('#views/Login'),
    componentProps: {},
    parent: root,
});

const register = wrapRoute({
    title: 'Register',
    path: 'register',
    component: () => import('#views/Register'),
    componentProps: {},
    parent: root,
});

const home = wrapRoute({
    title: 'Home',
    index: true,
    component: () => import('#views/Home'),
    componentProps: {},
    parent: root,
});

const region = wrapRoute({
    title: 'Region',
    path: 'regions/:regionId',
    component: () => import('#views/Region'),
    componentProps: {},
    parent: root,
});

const country = wrapRoute({
    title: 'Country',
    path: 'countries/:countryId',
    component: () => import('#views/Country'),
    componentProps: {},
    parent: root,
});

const emergencies = wrapRoute({
    title: 'Emergencies',
    path: 'emergencies',
    component: () => import('#views/Emergencies'),
    componentProps: {},
    parent: root,
});

const emergency = wrapRoute({
    title: 'Emergency',
    path: 'countries/:emergencyId',
    component: () => import('#views/Emergency'),
    componentProps: {},
    parent: root,
});

const surge = wrapRoute({
    title: 'Surge',
    path: 'surge',
    component: () => import('#views/Surge'),
    componentProps: {},
    parent: root,
});

const preparedness = wrapRoute({
    title: 'Preparedness',
    path: 'preparedness',
    component: () => import('#views/Preparedness'),
    componentProps: {},
    parent: root,
});

const threeW = wrapRoute({
    title: 'Three W',
    path: 'threeW',
    component: () => import('#views/GlobalThreeW'),
    componentProps: {},
    parent: root,
});

const account = wrapRoute({
    title: 'Account',
    path: 'account',
    component: () => import('#views/Account'),
    componentProps: {},
    parent: root,
});

const resources = wrapRoute({
    title: 'Resources',
    path: 'resources',
    component: () => import('#views/Resources'),
    componentProps: {},
    parent: root,
});

const goUI = wrapRoute({
    title: 'Go UI',
    path: 'go-ui',
    component: () => import('#views/GoUI'),
    componentProps: {},
    parent: root,
});

const newDrefApplicationForm = wrapRoute({
    title: 'New Dref Application Form',
    path: '/dref-application/new/',
    component: () => import('#views/DrefApplicationForm'),
    componentProps: {},
    parent: root,
});

const drefApplicationFormEdit = wrapRoute({
    title: 'Dref Application Form',
    path: '/dref-application/:drefId/edit/',
    component: () => import('#views/DrefApplicationForm'),
    componentProps: {},
    parent: root,
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
    newDrefApplicationForm,
    drefApplicationFormEdit,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));

export default wrappedRoutes;
