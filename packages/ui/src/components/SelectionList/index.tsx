import {
    useCallback,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import RawList from '#components/RawList';
import Selection, { type Props as SelectionProps } from '#components/Selection';

import styles from './styles.module.css';

export interface Props<
    O,
    V extends string | number,
    N extends string | number
> {
    className?: string;
    listClassName?: string;
    value: V[] | undefined;
    name: N;
    onDismiss: (value: V[] | undefined, name: N) => void;
    keySelector: (option: O) => V;
    labelSelector: (option: O) => string;
    options: O[] | undefined | null;
    /** Optional group prefix (e.g. "Filter Type:"); also shows the left accent */
    label?: React.ReactNode;
}

/**
 * Multiple removable selected values (specific layer, interactive).
 *
 * Renders a list (`<ul>` of `<li>` selections) of `Selection` pills, each
 * resolved through `keySelector`/`labelSelector` over `options`. Removing one
 * recomputes the value array and calls `onDismiss`. Covers the old
 * `DismissableMultiListOutput`. An optional group `label` renders a prefix and
 * a left accent.
 */
function SelectionList<
    O,
    V extends string | number,
    N extends string | number
>(
    props: Props<O, V, N>,
) {
    const {
        className,
        listClassName,
        name,
        value,
        onDismiss,
        labelSelector,
        keySelector,
        options,
        label,
    } = props;

    const selectedOptions = useMemo(
        () => {
            if (isNotDefined(options) || !Array.isArray(value)) {
                return undefined;
            }
            return options.filter((option) => value.includes(keySelector(option)));
        },
        [value, options, keySelector],
    );

    const handleDismiss = useCallback(
        (dismissedValue: V | undefined) => {
            const updatedValue = value?.filter((item) => item !== dismissedValue);
            onDismiss(updatedValue, name);
        },
        [name, onDismiss, value],
    );

    const rendererParams = useCallback(
        (key: V): SelectionProps<O, V, V> => ({
            value: key,
            name: key,
            as: 'li',
            onDismiss: handleDismiss,
            options,
            keySelector,
            labelSelector,
        }),
        [handleDismiss, options, keySelector, labelSelector],
    );

    if (isNotDefined(value) || value.length < 1) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.selectionList,
                isDefined(label) && styles.withLabel,
                className,
            )}
        >
            {isDefined(label) && (
                <span className={styles.label}>
                    {label}
                </span>
            )}
            <ul className={_cs(styles.list, listClassName)}>
                <RawList
                    data={selectedOptions}
                    renderer={Selection<O, V, V>}
                    rendererParams={rendererParams}
                    keySelector={keySelector}
                />
            </ul>
        </div>
    );
}

export default SelectionList;
