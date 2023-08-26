import { useMemo } from 'react';
import { _cs, isFalsyString, isNotDefined } from '@togglecorp/fujs';
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
    message?: React.ReactNode;
}

function NonFieldError<T>(props: Props<T>) {
    const {
        className,
        error,
        message,
    } = props;

    const errorObject = useMemo(() => getErrorObject(error), [error]);

    if (isNotDefined(errorObject)) {
        return null;
    }

    const hasError = analyzeErrors(errorObject);
    if (!hasError) {
        return null;
    }

    const stringError = errorObject?.[nonFieldError] ?? message;
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
