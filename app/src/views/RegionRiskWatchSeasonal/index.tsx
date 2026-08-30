import { useMemo } from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { type LngLatBoundsLike } from 'mapbox-gl';

import HistoricalDataChart from '#components/domain/HistoricalDataChart';
import RiskSeasonalMap from '#components/domain/RiskSeasonalMap';
import TabPage from '#components/TabPage';
import { getGeoJsonBounds } from '#utils/geo';
import { type RegionOutletContext } from '#utils/outletContext';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const { regionResponse } = useOutletContext<RegionOutletContext>();
    const bbox = useMemo<LngLatBoundsLike | undefined>(
        () => (regionResponse
            ? getGeoJsonBounds(regionResponse.bbox)
            : undefined),
        [regionResponse],
    );

    return (
        <TabPage>
            <RiskSeasonalMap
                variant="region"
                regionId={Number(regionId)}
                bbox={bbox}
            />
            <HistoricalDataChart
                variant="region"
                regionId={Number(regionId)}
            />
        </TabPage>
    );
}

Component.displayName = 'RegionSeasonalRiskWatch';
