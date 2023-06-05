import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    hovered?: boolean;
    active?: boolean;
    x: number;
    y: number;
}

function ChartPoint(props: Props) {
    const {
        className,
        hovered,
        active,
        x,
        y,
    } = props;

    return (
        <g className={_cs(styles.chartPoint, className)}>
            <circle
                className={_cs(
                    styles.pointOutline,
                    active && styles.active,
                )}
                cx={x}
                cy={y}
            />
            <circle
                className={_cs(
                    styles.point,
                    active && styles.active,
                    hovered && styles.hovered,
                )}
                cx={x}
                cy={y}
            />
        </g>
    );
}

export default ChartPoint;
