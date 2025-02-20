import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import getBbox from '@turf/bbox';

import RiskImminentEvents from '#components/domain/RiskImminentEvents';
import { type RegionOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';

// TODO: Add historic data chart
/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const bbox = useMemo(
        () => (regionResponse ? getBbox(regionResponse.bbox) : undefined),
        [regionResponse],
    );

    return (
        <div className={styles.regionImminentRiskWatch}>
            {regionResponse && (
                <RiskImminentEvents
                    variant="region"
                    regionId={regionResponse.id}
                    title={regionResponse.region_name}
                    bbox={bbox}
                />
            )}
        </div>
    );
}

Component.displayName = 'RegionImminentRiskWatch';
