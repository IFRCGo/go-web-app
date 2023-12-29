import { _cs } from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    value: number;
    totalValue?: number;
    showPercentageInTitle?: boolean;
}

function ProgressBar(props: Props) {
    const {
        className,
        title,
        description,
        totalValue = 100,
        value,
        showPercentageInTitle,
    } = props;

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
                    }}
                />
            </div>
            {description && (
                <div className={styles.description}>
                    {description}
                </div>
            )}
        </div>
    );
}

export default ProgressBar;
