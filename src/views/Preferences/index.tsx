import { Link } from 'react-router-dom';

import { wrappedRoutes } from '../../App/routes';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <>
            <h1>
                Preferences
            </h1>
            <Link to={wrappedRoutes.root.absolutePath}>
                Go to home
            </Link>
        </>
    );
}

Component.displayName = 'Preferences';
