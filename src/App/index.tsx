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
import mapboxgl from 'mapbox-gl';
import { unique } from '@togglecorp/fujs';

import UserContext, { UserDetails } from '#contexts/user';
import AlertContext, { AlertParams, AlertContextProps } from '#contexts/alert';
import { RequestContext } from '#utils/restRequest';
import { USER_STORAGE_KEY } from '#utils/constants';
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
mapboxgl.accessToken = import.meta.env.APP_MAPBOX_ACCESS_TOKEN;

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
    }, [hydrateUser]);

    const [alerts, setAlerts] = useState<AlertParams[]>([]);

    const addAlert = useCallback((alert: AlertParams) => {
        setAlerts((prevAlerts) => unique(
            [...prevAlerts, alert],
            (a) => a.name,
        ) ?? prevAlerts);
    }, [setAlerts]);

    const removeAlert = useCallback((name: AlertParams['name']) => {
        setAlerts((prevAlerts) => {
            const i = prevAlerts.findIndex((a) => a.name === name);
            if (i === -1) {
                return prevAlerts;
            }

            const newAlerts = [...prevAlerts];
            newAlerts.splice(i, 1);

            return newAlerts;
        });
    }, [setAlerts]);

    const updateAlert = useCallback((name: AlertParams['name'], paramsWithoutName: Omit<AlertParams, 'name'>) => {
        setAlerts((prevAlerts) => {
            const i = prevAlerts.findIndex((a) => a.name === name);
            if (i === -1) {
                return prevAlerts;
            }

            const updatedAlert = {
                ...prevAlerts[i],
                paramsWithoutName,
            };

            const newAlerts = [...prevAlerts];
            newAlerts.splice(i, 1, updatedAlert);

            return newAlerts;
        });
    }, [setAlerts]);

    const alertContextValue: AlertContextProps = useMemo(() => ({
        alerts,
        addAlert,
        updateAlert,
        removeAlert,
    }), [alerts, addAlert, updateAlert, removeAlert]);

    const removeUser = useCallback(() => {
        removeFromStorage(USER_STORAGE_KEY);
        setUserDetails(undefined);
    }, []);

    const setUser = useCallback((newUserDetails: UserDetails) => {
        setToStorage(
            USER_STORAGE_KEY,
            newUserDetails,
        );
        setUserDetails(newUserDetails);
    }, []);

    const userContextValue = useMemo(() => ({
        userDetails,
        hydrateUser,
        setUser,
        removeUser,
    }), [userDetails, hydrateUser, setUser, removeUser]);

    return (
        <UserContext.Provider value={userContextValue}>
            <AlertContext.Provider value={alertContextValue}>
                <RequestContext.Provider value={requestContextValue}>
                    <RouterProvider router={router} />
                </RequestContext.Provider>
            </AlertContext.Provider>
        </UserContext.Provider>
    );
}

export default App;
