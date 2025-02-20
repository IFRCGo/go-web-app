import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import {
    AlertContext,
    type AlertContextProps,
    type AlertParams,
    type Language,
    LanguageContext,
    type LanguageContextProps,
    type LanguageNamespaceStatus,
} from '@ifrc-go/ui/contexts';
import * as Sentry from '@sentry/react';
import {
    isDefined,
    unique,
} from '@togglecorp/fujs';
import mapboxgl from 'mapbox-gl';

import goLogo from '#assets/icons/go-logo-2020.svg';
import {
    appTitle,
    mbtoken,
} from '#config';
import RouteContext from '#contexts/route';
import UserContext, {
    type UserAuth,
    type UserContextProps,
} from '#contexts/user';
import {
    KEY_LANGUAGE_STORAGE,
    KEY_USER_STORAGE,
} from '#utils/constants';
import {
    getFromStorage,
    removeFromStorage,
    setToStorage,
} from '#utils/localStorage';
import { RequestContext } from '#utils/restRequest';
import {
    processGoError,
    processGoOptions,
    processGoResponse,
    processGoUrls,
} from '#utils/restRequest/go';

import wrappedRoutes, { unwrappedRoutes } from './routes';

import styles from './styles.module.css';

const requestContextValue = {
    transformUrl: processGoUrls,
    transformOptions: processGoOptions,
    transformResponse: processGoResponse,
    transformError: processGoError,
};
const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);
const router = sentryCreateBrowserRouter(unwrappedRoutes);
mapboxgl.accessToken = mbtoken;
mapboxgl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
    // eslint-disable-next-line no-console
    (err) => { console.error(err); },
    true,
);

function Application() {
    // ALERTS

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

    // AUTH

    const [userAuth, setUserAuth] = useState<UserAuth>();

    const hydrateUserAuth = useCallback(() => {
        const userDetailsFromStorage = getFromStorage<UserAuth>(KEY_USER_STORAGE);
        if (userDetailsFromStorage) {
            setUserAuth(userDetailsFromStorage);
        }
    }, []);

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

    // Translation

    const [strings, setStrings] = useState<LanguageContextProps['strings']>({});
    const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
    const [
        languageNamespaceStatus,
        setLanguageNamespaceStatus,
    ] = useState<Record<string, LanguageNamespaceStatus>>({});

    const setAndStoreCurrentLanguage = useCallback(
        (newLanguage: Language) => {
            setCurrentLanguage(newLanguage);
            setToStorage(KEY_LANGUAGE_STORAGE, newLanguage);
        },
        [],
    );

    const registerLanguageNamespace = useCallback(
        (namespace: string, fallbackStrings: Record<string, string>) => {
            setStrings(
                (prevValue) => {
                    if (isDefined(prevValue[namespace])) {
                        return {
                            ...prevValue,
                            [namespace]: {
                                ...fallbackStrings,
                                ...prevValue[namespace],
                            },
                        };
                    }

                    return {
                        ...prevValue,
                        [namespace]: fallbackStrings,
                    };
                },
            );

            setLanguageNamespaceStatus((prevValue) => {
                if (isDefined(prevValue[namespace])) {
                    return prevValue;
                }

                return {
                    ...prevValue,
                    // NOTE: This will fetch if the data is not already fetched
                    [namespace]: prevValue[namespace] === 'fetched' ? 'fetched' : 'queued',
                };
            });
        },
        [setStrings],
    );

    // Hydration
    useEffect(() => {
        hydrateUserAuth();

        const language = getFromStorage<Language>(KEY_LANGUAGE_STORAGE);
        setCurrentLanguage(language ?? 'en');
    }, [hydrateUserAuth]);

    const userContextValue = useMemo<UserContextProps>(
        () => ({
            userAuth,
            hydrateUserAuth,
            setUserAuth: setAndStoreUserAuth,
            removeUserAuth,
        }),
        [userAuth, hydrateUserAuth, setAndStoreUserAuth, removeUserAuth],
    );

    const languageContextValue = useMemo<LanguageContextProps>(
        () => ({
            languageNamespaceStatus,
            setLanguageNamespaceStatus,
            currentLanguage,
            setCurrentLanguage: setAndStoreCurrentLanguage,
            strings,
            setStrings,
            registerNamespace: registerLanguageNamespace,
        }),
        [
            languageNamespaceStatus,
            setLanguageNamespaceStatus,
            currentLanguage,
            setAndStoreCurrentLanguage,
            strings,
            registerLanguageNamespace,
        ],
    );

    return (
        <RouteContext.Provider value={wrappedRoutes}>
            <UserContext.Provider value={userContextValue}>
                <AlertContext.Provider value={alertContextValue}>
                    <RequestContext.Provider value={requestContextValue}>
                        <LanguageContext.Provider value={languageContextValue}>
                            <RouterProvider
                                router={router}
                                fallbackElement={(
                                    <div className={styles.fallbackElement}>
                                        <img
                                            className={styles.goLogo}
                                            alt="IFRC GO"
                                            src={goLogo}
                                        />
                                        {`${appTitle} loading...`}
                                    </div>
                                )}
                            />
                        </LanguageContext.Provider>
                    </RequestContext.Provider>
                </AlertContext.Provider>
            </UserContext.Provider>
        </RouteContext.Provider>
    );
}

const App = Sentry.withProfiler(Application);
export default App;
