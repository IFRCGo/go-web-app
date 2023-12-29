import {
    useCallback,
    useContext,
} from 'react';
import {
    type NavigateOptions,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import {
    resolvePath,
    type UrlParams,
} from '#components/Link';
import RouteContext from '#contexts/route';

import { type WrappedRoutes } from '../App/routes';

function useRouting() {
    const location = useLocation();
    const navigateFromLib = useNavigate();
    const routes = useContext(RouteContext);

    const historyEntryExist = location.key !== 'default';

    const navigate = useCallback(
        (
            path: keyof WrappedRoutes,
            options?: {
                params?: UrlParams,
                search?: string,
                hash?: string,
            },
            otherOptions?: NavigateOptions,
        ) => {
            const { resolvedPath } = resolvePath(
                path,
                routes,
                options?.params,
            );
            navigateFromLib({
                pathname: resolvedPath,
                search: options?.search,
                hash: options?.hash,
            }, otherOptions);
        },
        [navigateFromLib, routes],
    );

    const goBack = useCallback(
        (
            fallbackPath: keyof WrappedRoutes = 'home',
            options: {
                params?: UrlParams,
                search?: string,
                hash?: string,
            } = {},
        ) => {
            if (historyEntryExist) {
                navigateFromLib(-1);
            } else if (fallbackPath) {
                navigate(fallbackPath, options);
            } else {
                navigateFromLib('/');
            }
        },
        [historyEntryExist, navigateFromLib, navigate],
    );

    return { navigate, goBack };
}

export default useRouting;
