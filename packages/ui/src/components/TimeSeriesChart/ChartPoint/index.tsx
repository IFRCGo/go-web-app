import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    hovered?: boolean;
    hoverable?: boolean;
    active?: boolean;
    x: number | undefined;
    y: number | undefined;
    children?: React.ReactNode;
}

function ChartPoint(props: Props) {
    const {
        className,
        hovered,
        hoverable,
        active,
        x,
        y,
        children,
    } = props;

    if (isNotDefined(x) || isNotDefined(y)) {
        return null;
    }

    return (
        <g
            className={_cs(
                styles.chartPoint,
                hoverable && styles.hoverable,
                className,
            )}
        >
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
            {children}
        </g>
    );
}

export default ChartPoint;
