import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children: React.ReactNode;
    chartData: {
        containerRef: React.RefCallback<HTMLDivElement>;
    },
}

function ChartContainer(props: Props) {
    const {
        className,
        children,
        chartData,
    } = props;

    return (
        <div
            className={_cs(styles.chartContainer, className)}
            ref={chartData.containerRef}
        >
            <svg className={styles.svg}>
                {children}
            </svg>
        </div>
    );
}

export default ChartContainer;
