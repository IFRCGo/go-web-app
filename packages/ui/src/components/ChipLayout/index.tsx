import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export type ChipColorVariant = 'primary' | 'secondary' | 'tertiary';
export type ChipStyleVariant = 'tag' | 'selection';

const colorVariantToClassNameMap: Record<ChipColorVariant, string> = {
    primary: styles.colorVariantPrimary,
    secondary: styles.colorVariantSecondary,
    tertiary: styles.colorVariantTertiary,
};

const styleVariantToClassNameMap: Record<ChipStyleVariant, string> = {
    tag: styles.styleVariantTag,
    selection: styles.styleVariantSelection,
};

export interface Props {
    className?: string;
    /** Leading slot, typically an icon */
    leading?: React.ReactNode;
    /** The pill's visible label */
    label: React.ReactNode;
    /** Trailing slot, typically an action (e.g. a remove button) */
    trailing?: React.ReactNode;
    /** Style axis: the visual treatment of the pill */
    styleVariant?: ChipStyleVariant;
    /** Color axis: which semantic color drives border/background/text */
    colorVariant?: ChipColorVariant;
    leadingClassName?: string;
    labelClassName?: string;
    trailingClassName?: string;
    /** HTML element rendered as the root (defaults to `span`) */
    as?: 'span' | 'div' | 'li';
}

/**
 * Shared presentational pill (generic layer).
 *
 * Arranges three slots — leading (icon) · label · trailing (action) — inside
 * a rounded pill. Exposes a two-axis API: `styleVariant` ('tag' | 'selection')
 * for the visual treatment and `colorVariant` for the semantic color. It holds
 * no interaction logic itself; consumer-facing components (`Tag`, `Selection`)
 * compose it and own the behaviour.
 */
function ChipLayout(props: Props) {
    const {
        className,
        leading,
        label,
        trailing,
        styleVariant = 'tag',
        colorVariant = 'tertiary',
        leadingClassName,
        labelClassName,
        trailingClassName,
        as = 'span',
    } = props;

    const Element = as;

    return (
        <Element
            className={_cs(
                styles.chipLayout,
                styleVariantToClassNameMap[styleVariant],
                colorVariantToClassNameMap[colorVariant],
                isDefined(trailing) && styles.withTrailing,
                className,
            )}
        >
            {isDefined(leading) && (
                <span className={_cs(styles.leading, leadingClassName)}>
                    {leading}
                </span>
            )}
            <span className={labelClassName}>
                {label}
            </span>
            {isDefined(trailing) && (
                <span className={_cs(styles.trailing, trailingClassName)}>
                    {trailing}
                </span>
            )}
        </Element>
    );
}

export default ChipLayout;
