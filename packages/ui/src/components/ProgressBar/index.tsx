import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    value: number | undefined | null;
    totalValue?: number | null | undefined;
    showPercentageInTitle?: boolean;
    children?: React.ReactNode;
    color?: string;
}

function ProgressBar(props: Props) {
    const {
        className,
        title,
        description,
        totalValue: totalValueUnsafe,
        value: valueUnsafe,
        showPercentageInTitle,
        children,
        color = 'var(--go-ui-color-primary-red)',
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
        <div className={_cs(styles.progressWrapper, className)}>
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
                        backgroundColor: color,
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
