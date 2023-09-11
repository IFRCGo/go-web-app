import RiskSeasonalMap from '#components/domain/RiskSeasonalMap';
import { type LngLatBoundsLike } from 'mapbox-gl';

const defaultBounds: LngLatBoundsLike = [-160, -60, 190, 80];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <RiskSeasonalMap
            variant="global"
            bbox={defaultBounds}
        />
    );
}

Component.displayName = 'RiskWatchSeasonal';
