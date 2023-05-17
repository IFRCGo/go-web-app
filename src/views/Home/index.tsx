import { useState } from 'react';
import { Link } from 'react-router-dom';

import { wrappedRoutes } from '../../App/routes';

import styles from './styles.module.css';

// FIXME: import is weird will full names

interface Props {
    // FIXME: remove this issue with prop types
    name?: string;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const {
        name = 'Pineapple',
    } = props;
    const [count, setCount] = useState(1);

    return (
        <>
            <h1>
                {`${name} + React v${count}`}
            </h1>
            <p className={styles.readTheDocs}>
                Click on the Pineapple and React logos to learn more
            </p>
            <div className={styles.card}>
                <button
                    type="button"
                    onClick={() => setCount((c) => c + 1)}
                >
                    Upgrade
                </button>
            </div>
            <Link to={wrappedRoutes.preferences.absolutePath}>
                Go to preferences
            </Link>
        </>
    );
}

Component.displayName = 'Home';
