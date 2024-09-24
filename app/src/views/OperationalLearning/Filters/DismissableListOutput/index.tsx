import React, {
    useCallback,
    useMemo,
} from 'react';
import {
    Chip,
    List,
} from '@ifrc-go/ui';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface TagProps {
    label: string;
    tagValue: string;
    onDelete: (value: string) => void;
}

const tagItem: React.ComponentType<TagProps> = (props: TagProps) => {
    const { label, tagValue, onDelete } = props;

    return (
        <Chip
            label={label}
            name={tagValue}
            onDelete={onDelete}
            variant="tertiary"
        />
    );
};

interface DismissableListOutputProps<
    D,
    V extends string | number,
    N extends string | number
> {
    value: V[] | undefined;
    name: N;
    onDismiss: (value: V[], name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
}

function DismissableListOutput<
    D,
    V extends string | number,
    N extends string | number
>(
    props: DismissableListOutputProps<D, V, N>,
) {
    const {
        name,
        value,
        onDismiss,
        labelSelector,
        keySelector,
        options,
    } = props;

    const labelMap = useMemo(() => (
        listToMap(options, keySelector, labelSelector)
    ), [options, keySelector, labelSelector]);

    const handleDismiss = React.useCallback((val: string) => {
        const updatedValue = value?.filter((item) => item !== val) ?? [];
        onDismiss(updatedValue, name);
    }, [name, onDismiss, value]);

    const tagRendererParams = useCallback((key: V): TagProps => ({
        label: labelMap?.[key] ?? '',
        tagValue: String(key),
        onDelete: handleDismiss,
    }), [handleDismiss, labelMap]);

    if (isNotDefined(value)) {
        return null;
    }
    return (
        <List
            className={styles.list}
            data={value}
            renderer={tagItem}
            rendererParams={tagRendererParams}
            keySelector={(d) => d}
            errored={false}
            pending={false}
            filtered={false}
        />
    );
}

export default DismissableListOutput;
