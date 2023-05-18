import { _cs, isDefined } from '@togglecorp/fujs';

import FormattedNumber from '#components/FormattedNumber';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    contentClassName?: string;
    value: number;
    normalize?: boolean;
    addSeparator?: boolean;
    fixedTo?: number;
    description?: React.ReactNode;
    progressTitle?: React.ReactNode;
    progress?: number;
    progressDescription?: React.ReactNode;
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
        progress,
        progressTitle,
        progressDescription,
    } = props;

    return (
        <div
            className={_cs(
                styles.card,
                className,
            )}
        >
            <FormattedNumber
                className={styles.value}
                value={value}
                normalize={normalize}
                addSeparator={addSeparator}
                fixedTo={fixedTo}
            />
            <div className={styles.description}>
                {description}
            </div>
            {isDefined(progress) && (
                <ProgressBar
                    title={progressTitle}
                    value={progress}
                    totalValue={100}
                    description={progressDescription}
                />
            )}
            {children && (
                <div className={_cs(styles.content, contentClassName)}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default Card;
