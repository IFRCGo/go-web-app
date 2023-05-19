import {
    useState,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    set as setToStorage,
    get as getFromStorage,
    remove as removeFromStorage,
} from 'local-storage';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import { setMapboxToken } from '@togglecorp/re-map';

import UserContext, { UserDetails, USER_STORAGE_KEY } from '#contexts/user';
import { RequestContext } from '#utils/restRequest';
import {
    processGoUrls,
    processGoOptions,
    processGoError,
    processGoResponse,
} from '#utils/restRequest/go';

import { unwrappedRoutes } from '#routes';

const requestContextValue = {
    transformUrl: processGoUrls,
    transformOptions: processGoOptions,
    transformResponse: processGoResponse,
    transformError: processGoError,
};

const router = createBrowserRouter(unwrappedRoutes);
setMapboxToken(import.meta.env.APP_MAPBOX_ACCESS_TOKEN);

function setUser(userDetails: UserDetails) {
    setToStorage(
        USER_STORAGE_KEY,
        userDetails,
    );
}

function removeUser() {
    removeFromStorage(USER_STORAGE_KEY);
}

function App() {
    const [userDetails, setUserDetails] = useState<UserDetails>();
    const hydrateUser = useCallback(() => {
        const userDetailsFromStorage = getFromStorage<UserDetails>(USER_STORAGE_KEY);
        if (userDetailsFromStorage) {
            setUserDetails(userDetailsFromStorage);
        }
    }, []);

    useEffect(() => {
        hydrateUser();
    }, []);

    const userContextValue = useMemo(() => ({
        userDetails,
        hydrateUser,
        setUser,
        removeUser,
    }), [userDetails, hydrateUser, setUser, removeUser]);

    return (
        <UserContext.Provider value={userContextValue}>
            <RequestContext.Provider value={requestContextValue}>
                <RouterProvider router={router} />
            </RequestContext.Provider>
        </UserContext.Provider>
    );
}

export default App;
