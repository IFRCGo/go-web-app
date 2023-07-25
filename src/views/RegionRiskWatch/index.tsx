import { useOutletContext } from 'react-router-dom';
import getBbox from '@turf/bbox';

import PdcImminentEvents from '#components/PdcImminentEvents';
import { RegionOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const bbox = regionResponse ? getBbox(regionResponse.bbox) : undefined;

    return (
        <div className={styles.regionRiskWatch}>
            {regionResponse && (
                <PdcImminentEvents
                    variant="region"
                    regionId={regionResponse.id}
                    title={regionResponse.region_name}
                    bbox={bbox}
                />
            )}
        </div>
    );
}

Component.displayName = 'RegionRiskWatch';
