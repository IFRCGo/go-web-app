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
  normalize?: boolean;
  addSeparator?: boolean;
  fixedTo?: number;
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
        normalize,
        addSeparator,
        fixedTo,
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
                normal={normalize}
                separator={addSeparator ? undefined : null}
                precision={fixedTo}
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
