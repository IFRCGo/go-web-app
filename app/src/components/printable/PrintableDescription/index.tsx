import {
    Fragment,
    useMemo,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { diffSentences } from 'diff';

import styles from './styles.module.css';

interface Props {
    value?: string | null;
    className?: string;
    prevValue?: string | null;
}

function PrintableDescription(props: Props) {
    const {
        className,
        value,
        prevValue,
    } = props;

    const diff = useMemo(() => {
        if (isNotDefined(value) || isNotDefined(prevValue)) {
            return undefined;
        }

        return diffSentences(prevValue, value);
    }, [value, prevValue]);

    if (isNotDefined(diff)) {
        return (
            <div className={_cs(styles.printableDescription, className)}>
                {value}
            </div>
        );
    }

    return (
        <div
            className={_cs(
                styles.printableDescription,
                styles.withDiffView,
                className,
            )}
        >
            {diff.map((part, index) => {
                const { added, removed, value: partValue } = part;

                if (added) {
                    return (
                        <span
                            className={styles.added}
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                        >
                            {partValue}
                        </span>
                    );
                }

                if (removed) {
                    return (
                        <span
                            className={styles.removed}
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                        >
                            {partValue}
                        </span>
                    );
                }

                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={index}>
                        {partValue}
                    </Fragment>
                );
            })}
        </div>
    );
}

export default PrintableDescription;
