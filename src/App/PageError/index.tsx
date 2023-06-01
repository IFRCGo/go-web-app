import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

import styles from './styles.module.css';

function PageError() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorResponse = useRouteError() as unknown as any;

    useEffect(
        () => {
            // eslint-disable-next-line no-console
            console.error(errorResponse);
        },
        [errorResponse],
    );

    return (
        <div className={styles.pageError}>
            <div className={styles.container}>
                <h1 className={styles.heading}>
                    Oops! Looks like we ran into some issue!
                </h1>
                <div className={styles.message}>
                    {errorResponse?.error?.message
                        ?? errorResponse?.message
                        ?? 'Something unexpected happened!'}
                </div>
                <div className={styles.stack}>
                    {errorResponse?.error?.stack
                        ?? errorResponse?.stack
                        ?? 'Stack trace not available'}
                </div>
                <div className={styles.actions}>
                    See the developer console for more details
                </div>
            </div>
        </div>
    );
}

export default PageError;
