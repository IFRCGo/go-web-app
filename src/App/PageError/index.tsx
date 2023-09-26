import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

import useBooleanState from '#hooks/useBooleanState';
import Button from '#components/Button';
import Link from '#components/Link';

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

    const [
        fullErrorVisible,
        {
            toggle: toggleFullErrorVisibility,
        },
    ] = useBooleanState(false);

    return (
        <div className={styles.pageError}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.heading}>
                        Oops! Looks like we ran into some issue!
                    </h1>
                    <div className={styles.message}>
                        {errorResponse?.error?.message
                            ?? errorResponse?.message
                            ?? 'Something unexpected happened!'}
                    </div>
                    <Button
                        name={undefined}
                        onClick={toggleFullErrorVisibility}
                        variant="tertiary"
                    >
                        {fullErrorVisible ? 'Hide Error' : 'Show Full Error'}
                    </Button>
                    {fullErrorVisible && (
                        <>
                            <div className={styles.stack}>
                                {errorResponse?.error?.stack
                                    ?? errorResponse?.stack ?? 'Stack trace not available'}
                            </div>
                            <div className={styles.actions}>
                                See the developer console for more details
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.footer}>
                    <Link
                        to="home"
                        variant="primary"
                    >
                        Go back to homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PageError;
