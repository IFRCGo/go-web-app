import {
    type MouseEvent,
    useCallback,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Region {
    name: string;
    count: number;
}

interface Props {
    className?: string;
    regions: Region[];
    onRegionClick?: (region: string | null) => void;
    activeRegion: string | null;
    precision?: number;
    showCount?: boolean;
}

function PERRegionToggle({
    className,
    regions,
    onRegionClick,
    activeRegion,
    precision = 0,
    showCount = true,
}: Props) {
    const strings = useTranslation(i18n)?.strings;

    const handleToggle = useCallback((
        event: MouseEvent<HTMLButtonElement>,
        name: string,
    ) => {
        event.stopPropagation();

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        button.style.setProperty('--ripple-x', `${x}px`);
        button.style.setProperty('--ripple-y', `${y}px`);

        const newActiveRegion = activeRegion === name ? null : name;
        onRegionClick?.(newActiveRegion);
    }, [activeRegion, onRegionClick]);

    const handleContainerClick = useCallback(() => {
        if (activeRegion !== null) {
            onRegionClick?.(null);
        }
    }, [activeRegion, onRegionClick]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleContainerClick();
        }
    }, [handleContainerClick]);

    return (
        <div
            className={_cs(styles.container, className)}
            onClick={handleContainerClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={strings?.ariaLabels?.container ?? 'Region filter'}
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
                            aria-label={
                                activeRegion === region.name
                                    ? strings?.ariaLabels?.buttonActive?.replace('{region}', region.name)
                                        ?? `${region.name} filter active`
                                    : strings?.ariaLabels?.buttonInactive?.replace('{region}', region.name)
                                        ?? `${region.name} filter inactive`
                            }
                        >
                            <span className={styles.label}>{region.name}</span>
                            {showCount && (
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
