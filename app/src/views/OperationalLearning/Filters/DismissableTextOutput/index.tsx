import React from 'react';
import { Chip } from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

interface Props<T extends string | number> {
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

    const handleDismiss = React.useCallback(() => {
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
