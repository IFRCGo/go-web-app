import { wrapRoute, unwrapRoute } from '#utils/routes';

import PageError from './PageError';

const root = wrapRoute({
    title: '',
    path: '/',
    component: () => import('#views/Root'),
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

const home = wrapRoute({
    title: 'Home',
    index: true,
    component: () => import('#views/Home'),
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

export const wrappedRoutes = {
    root,
    login,
    home,
    goUI,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));
