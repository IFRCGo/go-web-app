import {
    useCallback,
    useMemo,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Chip, { type Props as ChipProps } from '#components/Chip';
import RawList from '#components/RawList';

export interface Props<
    O,
    V extends string | number,
    N extends string | number
> {
    value: V[] | undefined;
    name: N;
    onDismiss: (value: V[] | undefined, name: N) => void;
    keySelector: (value: O) => V;
    labelSelector: (value: O) => string;
    options: O[] | undefined | null;
}

function DismissableMultiListOutput<
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

    const values = useMemo(() => {
        if (isNotDefined(options) || !Array.isArray(value)) {
            return undefined;
        }
        return options?.filter((option) => value?.includes(keySelector(option)));
    }, [value, options, keySelector]);

    const handleDismiss = useCallback((val: V) => {
        const updatedValue = value?.filter((item) => item !== val);
        onDismiss(updatedValue, name);
    }, [name, onDismiss, value]);

    const chipRendererParams = useCallback((key: V, item: O): ChipProps<V> => ({
        label: labelSelector(item),
        name: key,
        onDelete: handleDismiss,
        variant: 'tertiary',
    }), [handleDismiss, labelSelector]);

    if (isNotDefined(value) || value.length < 1) {
        return null;
    }

    return (
        <RawList
            data={values}
            renderer={Chip<V>}
            rendererParams={chipRendererParams}
            keySelector={keySelector}
        />
    );
}

export default DismissableMultiListOutput;
