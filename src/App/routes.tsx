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
    componentProps: { name: 'Pine Apple' },
    parent: root,
});

const preferences = wrapRoute({
    title: 'Preferences',
    path: 'preferences',
    component: () => import('#views/Preferences'),
    componentProps: {},
    parent: root,
});

export const wrappedRoutes = {
    root,
    home,
    preferences,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));
