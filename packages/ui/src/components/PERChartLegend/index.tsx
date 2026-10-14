import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface LegendItem {
    /** Identifies the item. It is used for the active state and returned on click */
    label: string;
    /** Text shown to the user. Falls back to `label` */
    displayLabel?: string;
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
    const strings = useTranslation(i18n);
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
            aria-label={strings.legendContainerLabel}
        >
            {data.map((item, index) => {
                const isActive = activeIndex === item.label;
                const isDisabled = disabledIndices.includes(index);
                const displayLabel = item.displayLabel ?? item.label;
                const getAriaLabel = () => {
                    if (isDisabled) {
                        return resolveToString(
                            strings.legendItemDisabledLabel,
                            { label: displayLabel },
                        );
                    }
                    if (isActive) {
                        return resolveToString(
                            strings.legendItemActiveLabel,
                            { label: displayLabel },
                        );
                    }
                    return resolveToString(strings.legendItemLabel, { label: displayLabel });
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
                            aria-label={resolveToString(
                                strings.legendColorIndicatorLabel,
                                { label: displayLabel },
                            )}
                        />
                        <span className={styles.label}>
                            {displayLabel}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default PERChartLegend;
