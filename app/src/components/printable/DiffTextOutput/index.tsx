import {
    Fragment,
    useMemo,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import DiffMatchPatch from 'diff-match-patch';

import styles from './styles.module.css';

const ADDED = 1;
const REMOVED = -1;

interface Props {
    value?: string | null;
    className?: string;
    withDiff?: boolean;
    prevValue?: string | null;
}

function DiffTextOutput(props: Props) {
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
        const diffMatch = new DiffMatchPatch();
        return diffMatch.diff_main(prevValue ?? '', value ?? '');
    }, [withDiff, value, prevValue]);

    if (isNotDefined(diff)) {
        return (
            <div className={_cs(styles.diffTextOutput, className)}>
                {value}
            </div>
        );
    }

    return (
        <div
            className={_cs(
                styles.diffTextOutput,
                styles.withDiffView,
                className,
            )}
        >
            {diff.map(([changeType, content], index) => {
                if (changeType === ADDED) {
                    return (
                        <span
                            className={styles.added}
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                        >
                            {content}
                        </span>
                    );
                }

                if (changeType === REMOVED) {
                    return (
                        <span
                            className={styles.removed}
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                        >
                            {content}
                        </span>
                    );
                }

                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={index}>
                        {content}
                    </Fragment>
                );
            })}
        </div>
    );
}

export default DiffTextOutput;
