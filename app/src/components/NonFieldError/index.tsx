import { useMemo } from 'react';
import { AlertLineIcon } from '@ifrc-go/icons';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
    nonFieldError,
} from '@togglecorp/toggle-form';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props<T> {
    className?: string;
    error?: Error<T>;
    withFallbackError?: boolean;
}

function NonFieldError<T>(props: Props<T>) {
    const {
        className,
        error,
        withFallbackError,
    } = props;

    const strings = useTranslation(i18n);
    const errorObject = useMemo(() => getErrorObject(error), [error]);

    if (isNotDefined(errorObject)) {
        return null;
    }

    const hasError = analyzeErrors(errorObject);
    if (!hasError) {
        return null;
    }

    const stringError = errorObject?.[nonFieldError] || (
        withFallbackError ? strings.fallbackMessage : undefined);

    if (isFalsyString(stringError)) {
        return null;
    }

    return (
        <div className={_cs(
            styles.nonFieldError,
            className,
        )}
        >
            <AlertLineIcon className={styles.icon} />
            <div>
                {stringError}
            </div>
        </div>
    );
}

export default NonFieldError;
