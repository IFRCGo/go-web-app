import {
    type MouseEvent,
    useCallback,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Region {
    /** Identifies the region. It is used for the active state and returned on click */
    name: string;
    /** Text shown to the user. Falls back to `name` */
    displayName?: string;
    /** Shown next to the name when defined */
    count?: number;
}

export interface Props {
    className?: string;
    regions: Region[];
    onRegionClick?: (region: string | null) => void;
    activeRegion: string | null;
    precision?: number;
}

function PERRegionToggle({
    className,
    regions,
    onRegionClick,
    activeRegion,
    precision = 0,
}: Props) {
    const strings = useTranslation(i18n);

    const handleToggle = useCallback((
        event: MouseEvent<HTMLButtonElement>,
        name: string,
    ) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        button.style.setProperty('--ripple-x', `${x}px`);
        button.style.setProperty('--ripple-y', `${y}px`);

        const newActiveRegion = activeRegion === name ? null : name;
        onRegionClick?.(newActiveRegion);
    }, [activeRegion, onRegionClick]);

    return (
        <div
            className={_cs(styles.container, className)}
            role="group"
            aria-label={strings.regionContainerLabel}
        >
            <div className={styles.toggleGroup}>
                <div className={styles.toggleBody}>
                    {regions.map((region) => (
                        <button
                            key={region.name}
                            className={_cs(
                                styles.toggleButton,
                                activeRegion === region.name && styles.active,
                            )}
                            onClick={(event) => handleToggle(event, region.name)}
                            aria-pressed={activeRegion === region.name}
                            type="button"
                        >
                            <span className={styles.label}>
                                {region.displayName ?? region.name}
                            </span>
                            {isDefined(region.count) && (
                                <span className={styles.count}>
                                    {region.count.toFixed(precision)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PERRegionToggle;
