import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import {
    Outlet,
    useNavigation,
} from 'react-router-dom';
import { AlertInformationLineIcon } from '@ifrc-go/icons';
import {
    AlertContainer,
    Button,
    Container,
    PageContainer,
} from '@ifrc-go/ui';
import { LanguageContext } from '@ifrc-go/ui/contexts';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isFalsyString,
    listToGroupList,
    listToMap,
    mapToList,
    mapToMap,
} from '@togglecorp/fujs';

import GlobalFooter from '#components/GlobalFooter';
import Link from '#components/Link';
import Navbar from '#components/Navbar';
import { environment } from '#config';
import DomainContext, {
    type CacheKey,
    type Domain,
} from '#contexts/domain';
import UserContext from '#contexts/user';
import useAuth from '#hooks/domain/useAuth';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { state } = useNavigation();
    const isLoading = state === 'loading';
    const isLoadingDebounced = useDebouncedValue(isLoading);
    const strings = useTranslation(i18n);

    const { isAuthenticated } = useAuth();
    const { removeUserAuth } = useContext(UserContext);

    const [fetchDomainData, setFetchDomainData] = useState<{ [key in CacheKey]?: boolean }>({});

    const [languagePending, setLanguagePending] = useState(false);

    // FIXME: To be made functional after the implications of cookie rejections are finalized
    const [
        isCookiesBannerVisible,
        { setFalse: hideCookiesBanner },
    ] = useBooleanState(false);

    const handleClick = useCallback(() => {
        // FIXME: Add cookies permission to session storage
        hideCookiesBanner();
    }, [hideCookiesBanner]);

    const {
        currentLanguage,
        setStrings,
        setLanguageNamespaceStatus,
        languageNamespaceStatus,
    } = useContext(LanguageContext);

    const languageRequestTimeoutRef = useRef<number | undefined>();

    const registerDomainData = useCallback(
        (name: CacheKey) => {
            setFetchDomainData((prevState) => ({
                ...prevState,
                [name]: true,
            }));
        },
        [],
    );

    const {
        trigger: fetchLanguage,
    } = useLazyRequest<'/api/v2/language/{id}/', { pages: Array<string> }>({
        url: '/api/v2/language/{id}/',
        // FIXME: fix typing in server (medium priority)
        query: ({ pages }) => ({ page_name: pages }) as never,
        pathVariables: () => ({ id: currentLanguage }),
        onSuccess: (response, { pages }) => {
            const stringMap = mapToMap(
                listToGroupList(
                    response.strings?.map(({ value, page_name, ...otherArgs }) => {
                        // NOTE: removing empty translations or translations without pages
                        if (isFalsyString(value) || isFalsyString(page_name)) {
                            return undefined;
                        }
                        return {
                            value,
                            page_name,
                            ...otherArgs,
                        };
                    }).filter(isDefined),
                    ({ page_name }) => page_name ?? 'common',
                ),
                (key) => key,
                (values) => (
                    listToMap(
                        values,
                        ({ key }) => key,
                        ({ value }) => value,
                    )
                ),
            );

            setStrings(
                (prevValue) => {
                    const namespaces = Object.keys(prevValue);

                    return {
                        ...listToMap(
                            namespaces,
                            (namespace) => namespace,
                            (namespace) => ({
                                ...prevValue[namespace],
                                ...stringMap?.[namespace],
                            }),
                        ),
                    };
                },
            );
            setLanguageNamespaceStatus(
                (prevValue) => ({
                    ...prevValue,
                    ...listToMap(
                        pages,
                        (key) => key,
                        () => 'fetched',
                    ),
                }),
            );
            setLanguagePending(false);
        },
        onFailure: (err, { pages }) => {
            // eslint-disable-next-line no-console
            console.error(err);

            // FIXME: If we get an error, we should try again?
            setLanguageNamespaceStatus(
                (prevValue) => ({
                    ...prevValue,
                    ...listToMap(
                        pages,
                        (key) => key,
                        () => 'failed',
                    ),
                }),
            );
            setLanguagePending(false);
        },
    });

    const queuedLanguages = useMemo(
        () => {
            const languages = mapToList(
                languageNamespaceStatus,
                (item, key) => ({ key, status: item }),
            );
            return languages
                .filter((item) => item.status === 'queued')
                .map((item) => item.key)
                .sort()
                .join(',');
        },
        [languageNamespaceStatus],
    );

    useEffect(
        () => {
            if (
                languagePending
                || currentLanguage === 'en'
                || isFalsyString(queuedLanguages)
            ) {
                return undefined;
            }

            languageRequestTimeoutRef.current = window.setTimeout(
                () => {
                    const keys = queuedLanguages.split(',');

                    unstable_batchedUpdates(() => {
                        // FIXME: check if the component is still mounted
                        setLanguageNamespaceStatus(
                            (prevState) => ({
                                ...prevState,
                                ...listToMap(
                                    keys,
                                    (key) => key,
                                    () => 'pending',
                                ),
                            }),
                        );
                        setLanguagePending(true);
                    });

                    fetchLanguage({ pages: keys });
                },
                // FIXME: use constant
                200,
            );

            return () => {
                window.clearTimeout(languageRequestTimeoutRef.current);
            };
        },
        [
            queuedLanguages,
            languagePending,
            currentLanguage,
            fetchLanguage,
            setLanguageNamespaceStatus,
        ],
    );

    const {
        response: globalEnums,
        pending: globalEnumsPending,
        retrigger: globalEnumsTrigger,
    } = useRequest({
        skip: !fetchDomainData['global-enums'],
        url: '/api/v2/global-enums/',
        preserveResponse: true,
    });

    const {
        response: countries,
        pending: countriesPending,
        retrigger: countriesTrigger,
    } = useRequest({
        skip: !fetchDomainData.country,
        url: '/api/v2/country/',
        query: { limit: 9999 },
        preserveResponse: true,
    });

    const {
        response: regions,
        pending: regionsPending,
        retrigger: regionsTrigger,
    } = useRequest({
        skip: !fetchDomainData.region,
        url: '/api/v2/region/',
        query: { limit: 9999 },
        preserveResponse: true,
    });

    const {
        response: disasterTypes,
        pending: disasterTypesPending,
        retrigger: disasterTypesTrigger,
    } = useRequest({
        skip: !fetchDomainData['disaster-type'],
        url: '/api/v2/disaster_type/',
        query: { limit: 9999 },
        preserveResponse: true,
    });

    const {
        pending: secondarySectorsPending,
        response: secondarySectors,
        retrigger: secondarySectorsTrigger,
    } = useRequest({
        skip: !fetchDomainData['secondary-sector'],
        url: '/api/v2/secondarysector',
        preserveResponse: true,
    });

    const {
        pending: primarySectorsPending,
        response: primarySectors,
        retrigger: primarySectorsTrigger,
    } = useRequest({
        skip: !fetchDomainData['primary-sector'],
        url: '/api/v2/primarysector',
        preserveResponse: true,
    });

    const {
        pending: perComponentsPending,
        response: perComponents,
        retrigger: perFormComponentsTrigger,
    } = useRequest({
        skip: !fetchDomainData['per-components'],
        url: '/api/v2/per-formcomponent/',
        preserveResponse: true,
    });
    // NOTE: Always calling /api/v2/user/me to check validity of logged-in user
    const userSkip = !isAuthenticated;
    // const userSkip = !fetchDomainData['user-me'] || !isAuthenticated;

    const {
        response: userMe,
        pending: userMePending,
        retrigger: userMeTrigger,
    } = useRequest({
        // FIXME: check if the value is cleared when skip is called
        skip: userSkip,
        url: '/api/v2/user/me/',
        preserveResponse: true,
        onFailure: (val) => {
            // NOTE: Clearing authentication when token is invalid
            if (val.status === 401) {
                removeUserAuth();
                // NOTE: Reloading as other requests might fail
                window.location.reload();
            }
        },
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
                case 'region':
                    regionsTrigger();
                    break;
                case 'secondary-sector':
                    secondarySectorsTrigger();
                    break;
                case 'primary-sector':
                    primarySectorsTrigger();
                    break;
                case 'per-components':
                    perFormComponentsTrigger();
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.error(`Cannot call invalidate on '${name}'`);
            }
        },
        [
            countriesTrigger,
            regionsTrigger,
            globalEnumsTrigger,
            disasterTypesTrigger,
            secondarySectorsTrigger,
            primarySectorsTrigger,
            perFormComponentsTrigger,
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

            regionsPending,
            regions,

            secondarySectors,
            secondarySectorsPending,

            perComponents,
            perComponentsPending,

            primarySectors,
            primarySectorsPending,
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
            regions,
            regionsPending,
            secondarySectors,
            secondarySectorsPending,
            perComponents,
            perComponentsPending,
            registerDomainData,
            invalidateDomainData,
            primarySectors,
            primarySectorsPending,
        ],
    );

    const environmentTexts: {
        [key in typeof environment]?: string;
    } = {
        production: strings.environmentTextProduction,
        development: strings.environmentTextDevelopment,
        staging: strings.environmentTextStaging,
        testing: strings.environmentTextTesting,
    };

    return (
        <DomainContext.Provider value={domainContextValue}>
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
                {(isCookiesBannerVisible || environment !== 'production') && (
                    <div className={styles.bannersContainer}>
                        {isCookiesBannerVisible && (
                            <PageContainer className={styles.cookiesBanner}>
                                <Container
                                    withoutWrapInHeading
                                    headingDescription={strings.cookiesBannerDescription}
                                    icons={(
                                        <AlertInformationLineIcon
                                            className={styles.alertInfoIcon}
                                        />
                                    )}
                                    spacing="comfortable"
                                    actions={(
                                        <>
                                            <Link
                                                to="cookiePolicy"
                                                variant="tertiary"
                                            >
                                                {strings.cookiesBannerLearnMore}
                                            </Link>
                                            <Button
                                                name={undefined}
                                                variant="primary"
                                                onClick={handleClick}
                                            >
                                                {strings.cookiesBannerIAccept}
                                            </Button>
                                        </>
                                    )}
                                />
                            </PageContainer>
                        )}
                        {environment !== 'production' && (
                            <div className={styles.environmentBanner}>
                                {/* NOTE: We are not translating alpha server names */}
                                {environmentTexts[environment] ?? environment}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DomainContext.Provider>
    );
}

Component.displayName = 'Root';
