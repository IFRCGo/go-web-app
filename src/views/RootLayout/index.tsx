import { _cs } from '@togglecorp/fujs';
import { Outlet, useNavigation } from 'react-router-dom';

import Navbar from '#components/Navbar';
import GlobalFooter from '#components/GlobalFooter';
import AlertContainer from '#components/AlertContainer';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { paths } from '#generated/types';
import { useRequest } from '#utils/restRequest';

import ServerEnumsContext from '#contexts/server-enums';

import styles from './styles.module.css';

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
type GlobalEnumsResponse = GetGlobalEnums['responses']['200']['content']['application/json'];
const emptyEnums: GlobalEnumsResponse = {};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { state } = useNavigation();
    const isLoading = state === 'loading';
    const isLoadingDebounced = useDebouncedValue(isLoading);
    const { response: serverEnums } = useRequest<GlobalEnumsResponse>({
        url: '/api/v2/global-enums/',
    });

    return (
        <ServerEnumsContext.Provider value={serverEnums ?? emptyEnums}>
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
        </ServerEnumsContext.Provider>
    );
}

Component.displayName = 'Root';
