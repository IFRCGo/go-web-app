import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '#components/Navbar';
import GlobalFooter from '#components/GlobalFooter';
import AlertContainer from '#components/AlertContainer';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <div className={styles.root}>
            <Navbar className={styles.navbar} />
            <div className={styles.pageContent}>
                <Outlet />
            </div>
            <GlobalFooter className={styles.footer} />
            <AlertContainer />
        </div>
    );
}

Component.displayName = 'Root';
