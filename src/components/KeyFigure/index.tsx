import { _cs, isDefined } from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    contentClassName?: string;
    value: number | undefined | null;
    compactValue?: boolean;
    description?: React.ReactNode;
    descriptionClassName?: string;
    progressTitle?: React.ReactNode;
    progress?: number;
    progressDescription?: React.ReactNode;
    icon?: React.ReactNode;
    info?: React.ReactNode;
    suffix?: React.ReactNode;
}

function KeyFigure(props: Props) {
    const {
        className,
        children,
        contentClassName,
        value,
        compactValue,
        description,
        descriptionClassName,
        progress,
        progressTitle,
        progressDescription,
        icon,
        info,
        suffix,
    } = props;

    return (
        <div
            className={_cs(
                styles.keyFigure,
                !!icon && styles.withIcon,
                className,
            )}
        >
            {(icon || info) && (
                <div className={styles.iconSection}>
                    <div className={styles.icon}>
                        {icon}
                    </div>
                    {info && (
                        <div className={styles.infoSection}>
                            {info}
                        </div>
                    )}
                </div>
            )}
            <NumberOutput
                className={styles.value}
                value={value}
                compact={compactValue}
                suffix={suffix}
            />
            {description && (
                <div className={descriptionClassName}>
                    {description}
                </div>
            )}
            {isDefined(progress) && (
                <ProgressBar
                    title={progressTitle}
                    value={progress}
                    totalValue={100}
                    description={progressDescription}
                />
            )}
            {children && (
                <div className={contentClassName}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default KeyFigure;
