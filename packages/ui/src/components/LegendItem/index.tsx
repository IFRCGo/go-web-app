import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    colorClassName?: string;
    label?: React.ReactNode;
    iconSrc?: string;
    color?: string;
    iconClassName?: string;
}

function LegendItem(props: Props) {
    const {
        className,
        colorClassName,
        iconClassName,
        color,
        label,
        iconSrc,
    } = props;

    return (
        <div className={_cs(styles.legendElement, className)}>
            {iconSrc ? (
                <div
                    style={{
                        backgroundColor: color,
                    }}
                    className={styles.iconContainer}
                >
                    <img
                        className={_cs(styles.icon, iconClassName)}
                        src={iconSrc}
                        alt=""
                    />
                </div>
            ) : (
                <div
                    style={{ backgroundColor: color }}
                    className={_cs(styles.color, colorClassName)}
                />
            )}
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default LegendItem;
