import { useMemo } from 'react';
import { AlertLineIcon } from '@ifrc-go/icons';
import { _cs, isNotDefined, isFalsyString } from '@togglecorp/fujs';
import {
    getErrorObject,
    analyzeErrors,
    nonFieldError,
    Error,
} from '@togglecorp/toggle-form';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props<T> {
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
