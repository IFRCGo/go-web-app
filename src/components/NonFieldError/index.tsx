import { useMemo } from 'react';
import { _cs, isNotDefined, isFalsyString } from '@togglecorp/fujs';
import {
    getErrorObject,
    analyzeErrors,
    nonFieldError,
    Error,
} from '@togglecorp/toggle-form';

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

    const errorObject = useMemo(() => getErrorObject(error), [error]);

    if (isNotDefined(errorObject)) {
        return null;
    }

    const hasError = analyzeErrors(errorObject);
    if (!hasError) {
        return null;
    }

    // FIXME: use translations
    const stringError = errorObject?.[nonFieldError] || (
        withFallbackError ? 'Please correct all the errors before submission!' : undefined);

    if (isFalsyString(stringError)) {
        return null;
    }

    return (
        <div className={_cs(
            styles.nonFieldError,
            className,
        )}
        >
            {stringError}
        </div>
    );
}

export default NonFieldError;
