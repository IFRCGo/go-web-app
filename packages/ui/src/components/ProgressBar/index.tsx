import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';

import styles from './styles.module.css';

type ProgressColorVariant = 'text' | 'text-on-dark' | 'primary' | 'secondary' | 'success' | 'danger';

const colorVariantToClassName: Record<ProgressColorVariant, string> = {
    text: styles.colorVariantText,
    primary: styles.colorVariantPrimary,
    secondary: styles.colorVariantSecondary,
    success: styles.colorVariantSuccess,
    danger: styles.colorVariantDanger,
    'text-on-dark': styles.colorVariantTextOnDark,
};

type PreDefinedColorVariantProps = {
    colorVariant?: ProgressColorVariant;
    color?: never;
}

type CustomColorVariantProps = {
    colorVariant: 'custom';
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
    PreDefinedColorVariantProps | CustomColorVariantProps
);

function ProgressBar(props: Props) {
    const {
        className,
        title,
        description,
        totalValue: totalValueUnsafe,
        value: valueUnsafe,
        showPercentageInTitle,
        children,
        colorVariant = 'secondary',
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
                colorVariant !== 'custom'
                    && colorVariantToClassName[colorVariant],
                className,
            )}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            {(title || showPercentageInTitle) && (
                <div className={styles.title}>
                    {title}
                    {showPercentageInTitle && (
                        <NumberOutput
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
                        backgroundColor: colorVariant === 'custom' ? color : undefined,
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
