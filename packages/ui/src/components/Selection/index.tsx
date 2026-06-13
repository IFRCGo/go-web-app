import {
    useCallback,
    useMemo,
} from 'react';
import { CloseFillIcon } from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

import ChipLayout from '#components/ChipLayout';
import IconButton from '#components/IconButton';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

export interface Props<O, V extends string | number, N extends string | number> {
    className?: string;
    name: N;
    /** HTML element rendered as the pill root (use `'li'` inside a list) */
    as?: 'span' | 'div' | 'li';
    /**
     * The selected value. Used directly as the label (raw variant, the old
     * `DismissableTextOutput`), or resolved to a label through
     * `options`/`labelSelector` when those are supplied (the old
     * `DismissableListOutput`).
     */
    value: V | undefined;
    onDismiss: (value: V | undefined, name: N) => void;
    keySelector?: (option: O) => V;
    labelSelector?: (option: O) => string;
    options?: O[] | undefined | null;
}

/**
 * One removable selected value (specific layer, interactive).
 *
 * Composes `ChipLayout` (selection style) with a real remove `<button>` in
 * the trailing slot. The label comes either from a raw `value` (covers the old
 * `DismissableTextOutput`) or is resolved through `keySelector`/`labelSelector`
 * over `options` (covers the old `DismissableListOutput`). Calls `onDismiss`
 * with the cleared value and `name` when removed.
 */
function Selection<O, V extends string | number, N extends string | number>(
    props: Props<O, V, N>,
) {
    const strings = useTranslation(i18n);

    const {
        className,
        name,
        value,
        as = 'span',
        onDismiss,
        keySelector,
        labelSelector,
        options,
    } = props;

    const label = useMemo(
        () => {
            if (isNotDefined(value)) {
                return undefined;
            }
            if (isNotDefined(keySelector) || isNotDefined(labelSelector)) {
                // Raw-value variant: value is the label.
                return String(value);
            }
            if (isNotDefined(options)) {
                return undefined;
            }
            const matchingOption = options.find(
                (option) => keySelector(option) === value,
            );
            if (isNotDefined(matchingOption)) {
                return undefined;
            }
            return labelSelector(matchingOption);
        },
        [value, keySelector, labelSelector, options],
    );

    const handleDismiss = useCallback(
        () => {
            // Both variants clear to `undefined`; the value type is N-agnostic.
            onDismiss(undefined, name);
        },
        [name, onDismiss],
    );

    if (isNotDefined(value) || isNotDefined(label)) {
        return null;
    }

    const removeLabel = resolveToString(
        strings.removeButtonLabel,
        { label },
    );

    return (
        <ChipLayout
            className={className}
            as={as}
            styleVariant="selection"
            label={label}
            trailing={(
                <IconButton
                    name={undefined}
                    spacing="none"
                    title={removeLabel}
                    ariaLabel={removeLabel}
                    onClick={handleDismiss}
                    variant="tertiary"
                >
                    <CloseFillIcon />
                </IconButton>
            )}
        />
    );
}

export default Selection;
