import {
    Fragment,
    useMemo,
} from 'react';
import { diffWordsWithSpace } from 'diff';

import styles from './styles.module.css';

interface Props {
    value: string;
    oldValue: string;
}

function InlineDiffView(props: Props) {
    const {
        value,
        oldValue,
    } = props;

    const diff = useMemo(() => (
        diffWordsWithSpace(value, oldValue)
    ), [value, oldValue]);

    return (
        <div className={styles.inlineDiffView}>
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

export default InlineDiffView;
