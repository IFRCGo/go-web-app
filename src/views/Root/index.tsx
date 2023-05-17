import { Outlet } from 'react-router-dom';

import reactLogo from '../../assets/react.svg';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <>
            <div>
                <a
                    href="https://en.wikipedia.org/wiki/Pineapple"
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        src="/pineapple.svg"
                        className={styles.logo}
                        alt="Pineapple logo"
                    />
                </a>
                <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        src={reactLogo}
                        className={styles.logo}
                        alt="React logo"
                    />
                </a>
            </div>
            <Outlet />
        </>
    );
}

Component.displayName = 'App';
