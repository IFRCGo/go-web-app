import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    regions: Array<{ name: string; count: number }>;
    onRegionClick?: (region: string | null) => void;
    activeRegion: string | null;
    precision?: number;
    showCount?: boolean;
}

function PERRegionToggle(props: Props) {
    const {
        className,
        regions,
        onRegionClick,
        activeRegion,
        precision = 0,
        showCount = true,
    } = props;

    const handleToggle = useCallback((
        event: React.MouseEvent<HTMLButtonElement>,
        name: string
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

    return (
        <div 
            className={_cs(styles.container, className)} 
            onClick={handleContainerClick}
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
