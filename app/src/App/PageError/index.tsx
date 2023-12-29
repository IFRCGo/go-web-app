import {
    useCallback,
    useEffect,
} from 'react';
import { useRouteError } from 'react-router-dom';
import { Button } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

function PageError() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorResponse = useRouteError() as unknown as any;
    const strings = useTranslation(i18n);

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
                        {strings.errorPageIssueMessage}
                    </h1>
                    <div className={styles.message}>
                        {errorResponse?.error?.message
                            ?? errorResponse?.message
                            ?? strings.errorPageUnexpectedMessage}
                    </div>
                    <Button
                        name={undefined}
                        onClick={toggleFullErrorVisibility}
                        variant="tertiary"
                    >
                        {fullErrorVisible ? strings.errorPageHide : strings.errorPageShowError}
                    </Button>
                    {fullErrorVisible && (
                        <>
                            <div className={styles.stack}>
                                {errorResponse?.error?.stack
                                    ?? errorResponse?.stack ?? strings.errorPageStackTrace}
                            </div>
                            <div className={styles.actions}>
                                {strings.errorSeeDeveloperConsole}
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
                        {strings.errorPageGoBack}
                    </Link>
                    <Button
                        name={undefined}
                        onClick={handleReloadButtonClick}
                    >
                        {strings.errorPageReload}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PageError;
