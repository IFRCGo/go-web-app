import { useCallback, useEffect } from 'react';
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

    const handleReloadButtonClick = useCallback(
        () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.location.reload(true);
        },
        [],
    );

    return (
        <div className={styles.pageError}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.heading}>
                        {/* FIXME: use translations */}
                        Oops! Looks like we ran into some issue!
                    </h1>
                    <div className={styles.message}>
                        {/* FIXME: use translations */}
                        {errorResponse?.error?.message
                            ?? errorResponse?.message
                            ?? 'Something unexpected happened!'}
                    </div>
                    <Button
                        name={undefined}
                        onClick={toggleFullErrorVisibility}
                        variant="tertiary"
                    >
                        {/* FIXME: use translations */}
                        {fullErrorVisible ? 'Hide Error' : 'Show Full Error'}
                    </Button>
                    {fullErrorVisible && (
                        <>
                            <div className={styles.stack}>
                                {/* FIXME: use translations */}
                                {errorResponse?.error?.stack
                                    ?? errorResponse?.stack ?? 'Stack trace not available'}
                            </div>
                            <div className={styles.actions}>
                                {/* FIXME: use translations */}
                                See the developer console for more details
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.footer}>
                    {/* NOTE: using the anchor element as it will refresh the page */}
                    <Link
                        href="/"
                        external
                        variant="secondary"
                    >
                        {/* FIXME: use translations */}
                        Go back to homepage
                    </Link>
                    <Button
                        name={undefined}
                        onClick={handleReloadButtonClick}
                    >
                        {/* FIXME: use translations */}
                        Reload
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PageError;
