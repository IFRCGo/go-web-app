import {
    useMemo,
    useCallback,
    useState,
    useContext,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { Outlet, useNavigation } from 'react-router-dom';

import Navbar from '#components/Navbar';
import GlobalFooter from '#components/GlobalFooter';
import AlertContainer from '#components/AlertContainer';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { useRequest } from '#utils/restRequest';
import DomainContext, { type CacheKey, type Domain } from '#contexts/domain';
import UserContext from '#contexts/user';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { state } = useNavigation();
    const isLoading = state === 'loading';
    const isLoadingDebounced = useDebouncedValue(isLoading);

    const [fetch, setFetch] = useState<{ [key in CacheKey]?: boolean }>({});

    const { userAuth: userDetails } = useContext(UserContext);

    const register = useCallback(
        (name: CacheKey) => {
            setFetch((prevState) => ({
                ...prevState,
                [name]: true,
            }));
        },
        [],
    );

    const {
        response: globalEnums,
        pending: globalEnumsPending,
    } = useRequest({
        skip: !fetch['global-enums'],
        url: '/api/v2/global-enums/',
    });

    const {
        response: countries,
        pending: countriesPending,
    } = useRequest({
        skip: !fetch.country,
        url: '/api/v2/country/',
        query: { limit: 9999 },
    });

    const {
        response: disasterTypes,
        pending: disasterTypesPending,
    } = useRequest({
        skip: !fetch['disaster-type'],
        url: '/api/v2/disaster_type/',
        query: { limit: 9999 },
    });

    const {
        response: userMe,
        pending: userMePending,
    } = useRequest({
        // FIXME: check if the value is cleared when userDetails is cleared
        skip: !fetch['user-me'] || !userDetails,
        url: '/api/v2/user/me/',
    });

    const contextValue = useMemo(
        (): Domain => ({
            register,

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
            register,
        ],
    );

    return (
        <DomainContext.Provider value={contextValue}>
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
        </DomainContext.Provider>
    );
}

Component.displayName = 'Root';
