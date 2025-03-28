import {
    type MyInputIndexRouteObject,
    type MyInputNonIndexRouteObject,
    type MyOutputIndexRouteObject,
    type MyOutputNonIndexRouteObject,
    wrapRoute,
} from '#utils/routes';
import { Component as RootLayout } from '#views/RootLayout';

import Auth from '../Auth';
import PageError from '../PageError';

interface Perms {
    isDrefRegionalCoordinator: (regionId: number | undefined) => boolean,
    isRegionAdmin: (regionId: number | undefined) => boolean,
    isCountryAdmin: (countryId: number | undefined) => boolean,
    isRegionPerAdmin: (regionId: number | undefined) => boolean,
    isCountryPerAdmin: (countryId: number | undefined) => boolean,
    isRegionalOrCountryAdmin: boolean,
    isPerAdmin: boolean,
    isIfrcAdmin: boolean,
    isSuperUser: boolean,
    isGuestUser: boolean,
}

export type ExtendedProps = {
    title: string,
    visibility: 'is-authenticated' | 'is-not-authenticated' | 'anything',
    permissions?: (
        permissions: Perms,
        params: Record<string, number | string | undefined | null> | undefined | null,
    ) => boolean;
};

interface CustomWrapRoute {
    <T>(
        myRouteOptions: MyInputIndexRouteObject<T, ExtendedProps>
    ): MyOutputIndexRouteObject<ExtendedProps>
    <T>(
        myRouteOptions: MyInputNonIndexRouteObject<T, ExtendedProps>
    ): MyOutputNonIndexRouteObject<ExtendedProps>
}

export const customWrapRoute: CustomWrapRoute = wrapRoute;

// NOTE: We should not use layout or index routes in links

export const rootLayout = customWrapRoute({
    path: '/',
    errorElement: <PageError />,
    component: {
        eagerLoad: true,
        render: RootLayout,
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'IFRC GO',
        visibility: 'anything',
    },
});
