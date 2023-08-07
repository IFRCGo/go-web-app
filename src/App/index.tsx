import {
    useState,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { unique } from '@togglecorp/fujs';

import UserContext, { UserAuth, UserContextProps } from '#contexts/user';
import AlertContext, { AlertParams, AlertContextProps } from '#contexts/alert';
import RouteContext from '#contexts/route';
import CountryContext from '#contexts/country';
import type { CountryContextProps } from '#contexts/country';
import { RequestContext } from '#utils/restRequest';
import { KEY_USER_STORAGE } from '#utils/constants';
import {
    processGoUrls,
    processGoOptions,
    processGoError,
    processGoResponse,
} from '#utils/restRequest/go';
import {
    getFromStorage,
    removeFromStorage,
    setToStorage,
} from '#utils/localStorage';
import goLogo from '#assets/icons/go-logo-2020.svg';

import wrappedRoutes, { unwrappedRoutes } from './routes';
import styles from './styles.module.css';

const requestContextValue = {
    transformUrl: processGoUrls,
    transformOptions: processGoOptions,
    transformResponse: processGoResponse,
    transformError: processGoError,
};

const router = createBrowserRouter(unwrappedRoutes);
mapboxgl.accessToken = import.meta.env.APP_MAPBOX_ACCESS_TOKEN;

function App() {
    const [userAuth, setUserAuth] = useState<UserAuth>();

    const hydrateUserAuth = useCallback(() => {
        const userDetailsFromStorage = getFromStorage<UserAuth>(KEY_USER_STORAGE);
        if (userDetailsFromStorage) {
            setUserAuth(userDetailsFromStorage);
        }
    }, []);

    useEffect(() => {
        hydrateUserAuth();
    }, [hydrateUserAuth]);

    const [alerts, setAlerts] = useState<AlertParams[]>([]);
    const [countriesPending, setCountriesPending] = useState(false);
    const [countries, setCountries] = useState<CountryContextProps['countries']>([]);

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

    const removeUserAuth = useCallback(() => {
        removeFromStorage(KEY_USER_STORAGE);
        setUserAuth(undefined);
    }, []);

    const setAndStoreUserAuth = useCallback((newUserDetails: UserAuth) => {
        setUserAuth(newUserDetails);
        setToStorage(
            KEY_USER_STORAGE,
            newUserDetails,
        );
    }, []);

    const userContextValue = useMemo<UserContextProps>(
        () => ({
            userAuth,
            hydrateUserAuth,
            setUserAuth: setAndStoreUserAuth,
            removeUserAuth,
        }),
        [userAuth, hydrateUserAuth, setAndStoreUserAuth, removeUserAuth],
    );

    const countryContextValue = useMemo<CountryContextProps>(
        () => ({
            pending: countriesPending,
            setPending: setCountriesPending,
            countries,
            setCountries,
        }),
        [countriesPending, countries],
    );

    return (
        <RouteContext.Provider value={wrappedRoutes}>
            <UserContext.Provider value={userContextValue}>
                <AlertContext.Provider value={alertContextValue}>
                    <RequestContext.Provider value={requestContextValue}>
                        <CountryContext.Provider value={countryContextValue}>
                            <RouterProvider
                                router={router}
                                fallbackElement={(
                                    <div className={styles.fallbackElement}>
                                        <img
                                            className={styles.goLogo}
                                            alt="IFRC GO"
                                            src={goLogo}
                                        />
                                        {`${import.meta.env.APP_TITLE} loading...`}
                                    </div>
                                )}
                            />
                        </CountryContext.Provider>
                    </RequestContext.Provider>
                </AlertContext.Provider>
            </UserContext.Provider>
        </RouteContext.Provider>
    );
}

export default App;
