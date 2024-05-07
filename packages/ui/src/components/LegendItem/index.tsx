import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    colorClassName?: string;
    label?: React.ReactNode;
    icon_src?: string;
    color?: string;
}

function LegendItem(props: Props) {
    const {
        className,
        colorClassName,
        color,
        label,
        icon_src,
    } = props;

    return (
        <div className={_cs(styles.legendElement, className)}>
            {icon_src ? (
                <div
                    style={{
                        backgroundColor: color,
                    }}
                    className={styles.iconContainer}
                >
                    <img className={styles.icon} src={icon_src} alt="legend items" />
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
