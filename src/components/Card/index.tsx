import { _cs } from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.module.css';

interface Props {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  contentClassName?: string;
  value: number;
  compactValue?: boolean;
  description?: string;
  progressBar?: boolean;
  progressTotalValue?: number;
}
function Card(props: Props) {
    const {
        className,
        children,
        contentClassName,
        value,
        compactValue,
        description,
        progressBar,
        title,
        progressTotalValue = 100,
    } = props;
    return (
        <div
            className={_cs(
                styles.card,
                className,
            )}
        >
            <NumberOutput
                value={value}
                compact={compactValue}
            />
            {progressBar && (
                <ProgressBar
                    title={title}
                    value={value}
                    totalValue={progressTotalValue}
                />
            )}
            <div className={styles.description}>
                {description}
            </div>
            {children && (
                <div className={_cs(styles.content, contentClassName)}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default Card;
