import { useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Chip from '#components/Chip';

export interface Props<T extends string | number> {
    value: string | undefined;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
}

function DismissableTextOutput<T extends string | number>(
    props: Props<T>,
) {
    const {
        value,
        name,
        onDismiss,
    } = props;

    const handleDismiss = useCallback(() => {
        onDismiss(undefined, name);
    }, [name, onDismiss]);

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <Chip
            label={value}
            name={name}
            onDelete={handleDismiss}
            variant="tertiary"
        />
    );
}

export default DismissableTextOutput;
