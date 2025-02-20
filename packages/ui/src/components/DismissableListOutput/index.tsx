import {
    useCallback,
    useMemo,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Chip from '#components/Chip';

export interface Props<
    O,
    V extends string | number,
    N extends string | number
> {
    value: V | undefined;
    name: N;
    onDismiss: (value: V | undefined, name: N) => void;
    keySelector: (value: O) => V;
    labelSelector: (value: O) => string;
    options: O[] | undefined | null;
}

function DismissableListOutput<
    O,
    V extends string | number,
    N extends string | number
>(
    props: Props<O, V, N>,
) {
    const {
        name,
        value,
        onDismiss,
        labelSelector,
        keySelector,
        options,
    } = props;

    const item = useMemo(() => {
        if (isNotDefined(options) || isNotDefined(value)) {
            return undefined;
        }
        return options?.find((option) => keySelector(option) === value);
    }, [value, options, keySelector]);

    const handleDismiss = useCallback(() => {
        onDismiss(undefined, name);
    }, [name, onDismiss]);

    if (isNotDefined(value) || isNotDefined(item)) {
        return null;
    }

    const itemName = labelSelector(item);

    return (
        <Chip
            label={itemName}
            name={value}
            onDelete={handleDismiss}
            variant="tertiary"
        />
    );
}

export default DismissableListOutput;
