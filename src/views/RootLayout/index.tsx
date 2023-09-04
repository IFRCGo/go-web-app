import {
    useMemo,
    useCallback,
    useState,
    useContext,
    useEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import { Outlet, useNavigation } from 'react-router-dom';

import Navbar from '#components/Navbar';
import GlobalFooter from '#components/GlobalFooter';
import AlertContainer from '#components/AlertContainer';
import useDebouncedValue from '#hooks/useDebouncedValue';
import useInputState from '#hooks/useInputState';
import { useLazyRequest, useRequest } from '#utils/restRequest';
import DomainContext, { type CacheKey, type Domain } from '#contexts/domain';
import UserContext from '#contexts/user';
import LanguageContext, { Language, type LanguageContextProps } from '#contexts/language';
import { getFromStorage, setToStorage } from '#utils/localStorage';
import { KEY_LANGUAGE_STORAGE } from '#utils/constants';

import styles from './styles.module.css';

type StringNamespaceStatus = 'queued' | 'pending' | 'fetched';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { state } = useNavigation();
    const isLoading = state === 'loading';
    const isLoadingDebounced = useDebouncedValue(isLoading);
    const [strings, setStrings] = useState<LanguageContextProps['strings']>({});
    const [currentLanguage, setCurrentLanguage] = useInputState<LanguageContextProps['currentLanguage']>(
        'en',
        (newValue) => {
            setToStorage(
                KEY_LANGUAGE_STORAGE,
                newValue,
            );

            return newValue;
        },
    );
    const [fetchDomainData, setFetchDomainData] = useState<{ [key in CacheKey]?: boolean }>({});
    const [
        languageNamespace,
        setLanguageNamespace,
    ] = useState<Record<string, StringNamespaceStatus>>({});
    const { userAuth: userDetails } = useContext(UserContext);
    const languageRequestTimeoutRef = useRef<number | undefined>();

    useEffect(
        () => {
            const language = getFromStorage<Language>(KEY_LANGUAGE_STORAGE);
            setCurrentLanguage(language ?? 'en');
        },
        [setCurrentLanguage],
    );

    const registerDomainData = useCallback(
        (name: CacheKey) => {
            setFetchDomainData((prevState) => ({
                ...prevState,
                [name]: true,
            }));
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

            setLanguageNamespace((prevValue) => {
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

    const {
        pending: languagePending,
        trigger: fetchLanguage,
    } = useLazyRequest<'/api/v2/language/{id}/', { pages: Array<string> }>({
        url: '/api/v2/language/{id}/',
        // FIXME: typings should be fixed in the server
        query: ({ pages }) => ({ pages } as never),
        pathVariables: () => ({ id: currentLanguage }),
        onSuccess: () => {
            // TODO: Add response to the context
            // TODO: update status of namespaces
        },
    });

    useEffect(
        () => {
            if (languagePending) {
                return;
            }

            window.clearTimeout(languageRequestTimeoutRef.current);
            languageRequestTimeoutRef.current = window.setTimeout(
                () => {
                    // FIXME: check if the component is still mounted
                    setLanguageNamespace(
                        (prevState) => {
                            const keys = mapToList(
                                prevState,
                                (value, key) => (value === 'queued' ? key : undefined),
                            ).filter(isDefined);

                            if (keys.length === 0) {
                                return prevState;
                            }

                            // eslint-disable-next-line no-console
                            console.info('fetching taranslations for', keys.join(', '));
                            // TODO: send the request
                            // fetchLanguage({ pages: keys });

                            return {
                                ...prevState,
                                ...listToMap(
                                    keys,
                                    (key) => key,
                                    // TODO: set to pending
                                    // () => 'pending',
                                    () => 'fetched',
                                ),
                            };
                        },
                    );
                },
                // FIXME: use constatnt
                200,
            );
        },
        [languagePending, fetchLanguage, languageNamespace, setLanguageNamespace],
    );

    const {
        response: globalEnums,
        pending: globalEnumsPending,
        retrigger: globalEnumsTrigger,
    } = useRequest({
        skip: !fetchDomainData['global-enums'],
        url: '/api/v2/global-enums/',
    });

    const {
        response: countries,
        pending: countriesPending,
        retrigger: countriesTrigger,
    } = useRequest({
        skip: !fetchDomainData.country,
        url: '/api/v2/country/',
        query: { limit: 9999 },
    });

    const {
        response: disasterTypes,
        pending: disasterTypesPending,
        retrigger: disasterTypesTrigger,
    } = useRequest({
        skip: !fetchDomainData['disaster-type'],
        url: '/api/v2/disaster_type/',
        query: { limit: 9999 },
    });

    const userSkip = !fetchDomainData['user-me'] || !userDetails;

    const {
        response: userMe,
        pending: userMePending,
        retrigger: userMeTrigger,
    } = useRequest({
        // FIXME: check if the value is cleared when userDetails is cleared
        skip: userSkip,
        url: '/api/v2/user/me/',
    });

    const invalidateDomainData = useCallback(
        (name: CacheKey) => {
            switch (name) {
                case 'country':
                    countriesTrigger();
                    break;
                case 'global-enums':
                    globalEnumsTrigger();
                    break;
                case 'disaster-type':
                    disasterTypesTrigger();
                    break;
                case 'user-me':
                    userMeTrigger();
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.error(`Cannot call invalidate on '${name}'`);
            }
        },
        [
            countriesTrigger,
            globalEnumsTrigger,
            disasterTypesTrigger,
            userMeTrigger,
        ],
    );

    const domainContextValue = useMemo(
        (): Domain => ({
            register: registerDomainData,
            invalidate: invalidateDomainData,

            countriesPending,
            countries,

            userMe,
            userMePending,

            disasterTypes,
            disasterTypesPending,

            globalEnums,
            globalEnumsPending,
        }),
        [
            userMe,
            userMePending,
            countriesPending,
            countries,
            disasterTypes,
            disasterTypesPending,
            globalEnums,
            globalEnumsPending,
            registerDomainData,
            invalidateDomainData,
        ],
    );

    const languageContextValue = useMemo<LanguageContextProps>(
        () => ({
            currentLanguage,
            setCurrentLanguage,
            strings,
            setStrings,
            registerNamespace: registerLanguageNamespace,
        }),
        [
            currentLanguage,
            strings,
            registerLanguageNamespace,
            setCurrentLanguage,
        ],
    );

    return (
        <DomainContext.Provider value={domainContextValue}>
            <LanguageContext.Provider value={languageContextValue}>
                <div className={styles.root}>
                    {(isLoading || isLoadingDebounced) && (
                        <div
                            className={_cs(
                                styles.navigationLoader,
                                !isLoading && isLoadingDebounced && styles.disappear,
                            )}
                        />
                    )}
                    <Navbar className={styles.navbar} />
                    <div className={styles.pageContent}>
                        <Outlet />
                    </div>
                    <GlobalFooter className={styles.footer} />
                    <AlertContainer />
                </div>
            </LanguageContext.Provider>
        </DomainContext.Provider>
    );
}

Component.displayName = 'Root';
