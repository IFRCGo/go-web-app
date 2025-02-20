export type RiskLayerTypes = 'hazard-point'
| 'track-point'
| 'track-point-boundary'
| 'track-linestring'
| 'uncertainty-cone'
| 'exposure'
| 'unknown';

export type RiskLayerSeverity = 'red' | 'orange' | 'green' | 'unknown';

interface BaseLayerProperties {
    type: RiskLayerTypes;
}

interface HazardPointLayerProperties extends BaseLayerProperties {
    type: 'hazard-point';
    severity: RiskLayerSeverity;
}

interface TrackPointLayerProperties extends BaseLayerProperties {
    type: 'track-point';
    // FIXME: added this
    isFuture: boolean;
}

interface TrackPointBoundaryLayerProperties extends BaseLayerProperties {
    type: 'track-point-boundary';
}

interface TrackLinestringLayerProperties extends BaseLayerProperties {
    type: 'track-linestring';
}

interface UncertaintyConeLayerProperties extends BaseLayerProperties {
    type: 'uncertainty-cone';
    forecastDays: number | undefined;
}

interface ExposureLayerProperties extends BaseLayerProperties {
    type: 'exposure';
    severity: RiskLayerSeverity;
}

interface UnknownRiskLayerProperties extends BaseLayerProperties {
    type: 'unknown';
}

export type RiskLayerProperties = HazardPointLayerProperties
| TrackPointLayerProperties
| TrackPointBoundaryLayerProperties
| TrackLinestringLayerProperties
| UncertaintyConeLayerProperties
| ExposureLayerProperties
| UnknownRiskLayerProperties;
