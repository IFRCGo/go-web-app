import { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

interface Props<T> {
    diffContainerClassName?: string;
    value?: T;
    oldValue?: T;
    children: React.ReactNode;
    enabled: boolean;
    showOnlyDiff?: boolean;
}

function DiffWrapper<T>(props: Props<T>) {
    const {
        diffContainerClassName,
        oldValue,
        value,
        children,
        enabled = false,
        showOnlyDiff,
    } = props;

    const hasChanged = useMemo(() => {
        // NOTE: we consider `null` and `undefined` as same for
        // this scenario
        if (isNotDefined(oldValue) && isNotDefined(value)) {
            return false;
        }

        return JSON.stringify(oldValue) !== JSON.stringify(value);
    }, [oldValue, value]);

    if (!enabled) {
        return children;
    }

    if (!hasChanged && showOnlyDiff) {
        return null;
    }

    if (!hasChanged) {
        return children;
    }

    return (
        <div className={diffContainerClassName}>
            {children}
        </div>
    );
}

export default DiffWrapper;
