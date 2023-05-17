import { wrapRoute, unwrapRoute } from '#utils/routes';

import PageError from './PageError';

const root = wrapRoute({
    title: '',
    path: '/',
    component: () => import('#views/Root'),
    componentProps: {},
    errorElement: <PageError />,
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
    home,
    goUI,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));
