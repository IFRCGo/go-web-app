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
import { isDefined, unique } from '@togglecorp/fujs';

import UserContext, { UserAuth, UserContextProps } from '#contexts/user';
import AlertContext, { AlertParams, AlertContextProps } from '#contexts/alert';
import RouteContext from '#contexts/route';
import LanguageContext, {
    Language,
    LanguageNamespaceStatus,
    type LanguageContextProps,
} from '#contexts/language';
import { RequestContext } from '#utils/restRequest';
import { KEY_LANGUAGE_STORAGE, KEY_USER_STORAGE } from '#utils/constants';
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
import { mbtoken, appTitle } from '#config';

import wrappedRoutes, { unwrappedRoutes } from './routes';
import styles from './styles.module.css';

const requestContextValue = {
    transformUrl: processGoUrls,
    transformOptions: processGoOptions,
    transformResponse: processGoResponse,
    transformError: processGoError,
};

const router = createBrowserRouter(unwrappedRoutes);
mapboxgl.accessToken = mbtoken;

function App() {
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
        (newLanugage: Language) => {
            setCurrentLanguage(newLanugage);
            setToStorage(KEY_LANGUAGE_STORAGE, newLanugage);
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
                                ...prevValue[namespace],
                                ...fallbackStrings,
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
                    [namespace]: 'queued',
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

export default App;
