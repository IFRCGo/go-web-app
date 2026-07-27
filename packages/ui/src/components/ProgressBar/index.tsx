import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import NumberDisplay from '#components/NumberDisplay';

import styles from './styles.module.css';

type ProgressBarVariant = 'text' | 'text-on-dark' | 'primary' | 'secondary' | 'success' | 'danger';

const variantToClassName: Record<ProgressBarVariant, string> = {
    text: styles.variantText,
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    success: styles.variantSuccess,
    danger: styles.variantDanger,
    'text-on-dark': styles.variantTextOnDark,
};

type PreDefinedVariantProps = {
    /** Predefined color scheme for the progress track */
    variant?: ProgressBarVariant;
    color?: never;
}

type CustomVariantProps = {
    /** Data-driven visualization escape: requires an explicit `color` */
    variant: 'custom';
    /** CSS color for the progress track (only with `variant="custom"`) */
    color: string;
}

interface BaseProps {
    className?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    value: number | undefined | null;
    totalValue?: number | null | undefined;
    showPercentageInTitle?: boolean;
    children?: React.ReactNode;
}

export type Props = BaseProps & (
    PreDefinedVariantProps | CustomVariantProps
);

/**
 * ProgressBar visualizes a value against a total as a horizontal bar.
 * Specific (data-viz) layer: exposes a single `variant` prop, with the
 * blessed data-driven escape `variant="custom"` + `color` for
 * visualizations whose colors come from data.
 */
function ProgressBar(props: Props) {
    const {
        className,
        title,
        description,
        totalValue: totalValueUnsafe,
        value: valueUnsafe,
        showPercentageInTitle,
        children,
        variant = 'secondary',
        color,
    } = props;

    const value = isDefined(valueUnsafe)
        ? valueUnsafe
        : 0;
    const totalValue = isDefined(totalValueUnsafe)
        ? totalValueUnsafe
        : 0;

    let percentage;
    if (totalValue === 0) {
        percentage = 0;
    } else {
        percentage = (value / totalValue) * 100;
    }

    return (
        <div
            className={_cs(
                styles.progressWrapper,
                variant !== 'custom'
                    && variantToClassName[variant],
                className,
            )}
        >
            {(title || showPercentageInTitle) && (
                <div className={styles.title}>
                    {title}
                    {showPercentageInTitle && (
                        <NumberDisplay
                            value={percentage}
                            suffix="%"
                        />
                    )}
                </div>
            )}
            <div className={styles.total}>
                <div
                    className={styles.progress}
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: variant === 'custom' ? color : undefined,
                    }}
                />
            </div>
            {description && (
                <div className={styles.description}>
                    {description}
                </div>
            )}
            {children}
        </div>
    );
}

export default ProgressBar;
