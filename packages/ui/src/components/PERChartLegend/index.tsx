import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
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
    const strings = useTranslation(i18n)?.strings;
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
            aria-label={strings?.legendContainerLabel ?? 'Chart legend'}
        >
            {data.map((item, index) => {
                const isActive = activeIndex === item.label;
                const isDisabled = disabledIndices.includes(index);
                const getAriaLabel = () => {
                    if (isDisabled) {
                        return strings?.legendItemDisabledLabel?.replace('{label}', item.label)
                            ?? `Legend item for ${item.label} (disabled)`;
                    }
                    if (isActive) {
                        return strings?.legendItemActiveLabel?.replace('{label}', item.label)
                            ?? `Legend item for ${item.label} (active)`;
                    }
                    return strings?.legendItemLabel?.replace('{label}', item.label)
                        ?? `Legend item for ${item.label}`;
                };
                const ariaLabel = getAriaLabel();

                return (
                    <button
                        key={item.label}
                        className={_cs(
                            styles.item,
                            isActive && styles.active,
                            isDisabled && styles.disabled,
                        )}
                        onClick={() => handleClick(index, item)}
                        type="button"
                        disabled={isDisabled}
                        aria-label={ariaLabel}
                    >
                        <div
                            className={styles.color}
                            style={{ backgroundColor: item.color }}
                            aria-label={strings?.legendColorIndicatorLabel?.replace('{label}', item.label) ?? `Color indicator for ${item.label}`}
                        />
                        <span className={styles.label}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default PERChartLegend;
