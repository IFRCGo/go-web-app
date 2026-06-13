import { useMemo } from 'react';
import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props<VALUE> {
    children: React.ReactNode;
    className?: string;
    diffViewEnabled: boolean;
    hideOnPristine?: boolean;
    previousValue?: VALUE | undefined;
    showPreviousValue?: boolean;
    value?: VALUE | undefined;
}

function DiffWrapper<
    VALUE extends string | number | boolean | null
>(
    props: Props<VALUE>,
) {
    const {
        children,
        className,
        diffViewEnabled = false,
        hideOnPristine,
        previousValue,
        showPreviousValue,
        value,
    } = props;

    const strings = useTranslation(i18n);

    const hasChanged = useMemo(() => {
        // NOTE: we consider `null` and `undefined` as same for
        // this scenario
        if (isNotDefined(previousValue) && isNotDefined(value)) {
            return false;
        }

        return JSON.stringify(previousValue) !== JSON.stringify(value);
    }, [previousValue, value]);

    if (!diffViewEnabled) {
        return children;
    }

    if (!hasChanged && hideOnPristine) {
        return null;
    }

    if (!hasChanged) {
        return children;
    }

    return (
        <div
            className={_cs(
                className,
                styles.diffWrapper,
            )}
        >
            {children}
            {showPreviousValue
                && (
                    <DataDisplay
                        className={styles.previousValue}
                        label={strings.previousValueLabel}
                        value={previousValue}
                    />
                )}
        </div>
    );
}

export default DiffWrapper;
