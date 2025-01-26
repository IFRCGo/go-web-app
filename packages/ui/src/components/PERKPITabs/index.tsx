import {
    useEffect,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface KPI {
    /**
     * Unique identifier for the KPI
     */
    key: string;

    /**
     * Numeric value to display
     */
    value: number;

    /**
     * Description text below the value
     */
    description: string;

    /**
     * Optional color for the value and underline
     */
    color?: string;
}

export interface Props {
    /**
     * Array of KPI items to display
     */
    kpis: KPI[];

    /**
     * Whether to disable tab interaction
     * @default false
     */
    disableTabs?: boolean;

    /**
     * Callback when a tab is clicked
     */
    onTabClick?: (key: string) => void;

    /**
     * Controlled active tab index
     */
    activeIndex?: number;

    /**
     * Callback when active tab changes
     */
    onActiveIndexChange?: (index: number) => void;

    /**
     * Additional CSS class names
     */
    className?: string;
}

function PERKPITabs({
    kpis,
    disableTabs = false,
    onTabClick,
    activeIndex: externalActiveIndex,
    onActiveIndexChange,
    className,
}: Props) {
    // Internal state to manage activeIndex when not controlled externally
    const [internalActiveIndex, setInternalActiveIndex] = useState<number>(0);

    // Determine whether the component is controlled
    const isControlled = externalActiveIndex !== undefined;

    // Current active index: controlled or internal
    const activeIndex = isControlled ? externalActiveIndex : internalActiveIndex;

    const strings = useTranslation(i18n)?.strings;

    // Handle tab click
    const handleTabClick = (index: number): void => {
        if (disableTabs || index === activeIndex) {
            // Do nothing if tabs are disabled or the clicked tab is already active
            return;
        }

        if (isControlled) {
            // If controlled, notify the parent via callback
            onActiveIndexChange?.(index);
        } else {
            // If uncontrolled, update internal state
            setInternalActiveIndex(index);
        }

        // Always notify via onTabClick callback if provided
        onTabClick?.(kpis[index].key);
    };

    // Sync internal state with external activeIndex if it becomes uncontrolled
    useEffect(() => {
        if (!isControlled) {
            // Optionally, you can add logic here if you need to respond to external changes
        }
    }, [isControlled]);

    return (
        <div
            className={_cs(
                styles.kpiTabsContainer,
                className,
            )}
            aria-label={strings?.ariaLabels?.container ?? 'KPI tabs container'}
        >
            {kpis.map((kpi, index) => (
                <button
                    key={kpi.key}
                    className={_cs(
                        styles.kpiTab,
                        !disableTabs && styles.kpiTabEnabled,
                        activeIndex === index && styles.kpiTabActive,
                    )}
                    onClick={() => handleTabClick(index)}
                    disabled={disableTabs}
                    type="button"
                    aria-label={strings?.ariaLabels?.tab?.replace('{description}', kpi.description) ?? `KPI tab for ${kpi.description}`}
                >
                    <div
                        className={styles.kpiValue}
                        style={{ color: kpi.color }}
                        aria-label={strings?.ariaLabels?.value?.replace('{value}', kpi.value.toString()) ?? `KPI value: ${kpi.value}`}
                    >
                        {kpi.value}
                    </div>
                    <div
                        className={styles.kpiDescription}
                        aria-label={strings?.ariaLabels?.description?.replace('{description}', kpi.description) ?? `KPI description: ${kpi.description}`}
                    >
                        {kpi.description}
                    </div>
                    <div
                        className={_cs(
                            styles.kpiUnderline,
                            activeIndex === index && styles.kpiUnderlineActive,
                        )}
                        style={{ backgroundColor: kpi.color }}
                    />
                </button>
            ))}
            <div className={styles.kpiTabsBottomBorder} />
        </div>
    );
}

export default PERKPITabs;
