import { useMemo } from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import getBbox from '@turf/bbox';
import { type LngLatBoundsLike } from 'mapbox-gl';

import HistoricalDataChart from '#components/domain/HistoricalDataChart';
import RiskSeasonalMap from '#components/domain/RiskSeasonalMap';
import { type RegionOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const { regionResponse } = useOutletContext<RegionOutletContext>();
    const bbox = useMemo<LngLatBoundsLike | undefined>(
        () => (regionResponse ? getBbox(regionResponse.bbox) : undefined),
        [regionResponse],
    );

    return (
        <div className={styles.regionSeasonalRiskWatch}>
            <RiskSeasonalMap
                variant="region"
                regionId={Number(regionId)}
                bbox={bbox}
            />
            <HistoricalDataChart
                variant="region"
                regionId={Number(regionId)}
            />
        </div>
    );
}

Component.displayName = 'RegionSeasonalRiskWatch';
