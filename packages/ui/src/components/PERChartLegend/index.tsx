import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface LegendItem {
    label: string;
    color: string;
}

export interface Props {
    className?: string;
    data: LegendItem[];
    onClick?: (item: LegendItem) => void;
    layout?: 'horizontal' | 'vertical';
    activeIndex?: string | number | null;
    disabledIndices?: number[];
}

function PERChartLegend(props: Props) {
    const {
        className,
        data,
        onClick,
        layout = 'horizontal',
        activeIndex = null,
        disabledIndices = [],
    } = props;

    const handleClick = useCallback((index: number, item: LegendItem) => {
        if (onClick && !disabledIndices.includes(index)) {
            onClick(item);
        }
    }, [onClick, disabledIndices]);

    return (
        <div
            className={_cs(
                styles.legend,
                layout === 'vertical' && styles.vertical,
                className,
            )}
        >
            {data.map((item, index) => (
                <button
                    key={item.label}
                    className={_cs(
                        styles.item,
                        activeIndex === item.label && styles.active,
                        disabledIndices.includes(index) && styles.disabled,
                    )}
                    onClick={() => handleClick(index, item)}
                    type="button"
                    disabled={disabledIndices.includes(index)}
                >
                    <div
                        className={styles.color}
                        style={{ backgroundColor: item.color }}
                    />
                    <span className={styles.label}>
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
}

export default PERChartLegend;
