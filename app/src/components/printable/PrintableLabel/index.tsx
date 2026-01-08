import {
    Fragment,
    useMemo,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { diffWordsWithSpace } from 'diff';

import styles from './styles.module.css';

interface Props {
    value?: string | null;
    className?: string;
    withDiff?: boolean;
    prevValue?: string | null;
}

function PrintableLabel(props: Props) {
    const {
        className,
        value,
        prevValue,
        withDiff = false,
    } = props;

    const diff = useMemo(() => {
        if (!withDiff) {
            return undefined;
        }

        return diffWordsWithSpace(prevValue ?? '', value ?? '');
    }, [withDiff, value, prevValue]);

    if (isNotDefined(diff)) {
        return (
            <div className={_cs(styles.printableLabel, className)}>
                {value}
            </div>
        );
    }

    return (
        <div
            className={_cs(
                styles.printableLabel,
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

export default PrintableLabel;
