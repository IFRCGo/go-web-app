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

export interface HazardPointLayerProperties extends BaseLayerProperties {
    type: 'hazard-point';
    severity: RiskLayerSeverity;
}

export interface TrackPointLayerProperties extends BaseLayerProperties {
    type: 'track-point';
    // FIXME: added this
    isFuture: boolean;
}

export interface TrackPointBoundaryLayerProperties extends BaseLayerProperties {
    type: 'track-point-boundary';
}

export interface TrackLinestringLayerProperties extends BaseLayerProperties {
    type: 'track-linestring';
}

export interface UncertaintyConeLayerProperties extends BaseLayerProperties {
    type: 'uncertainty-cone';
    forecastDays: number | undefined;
}

export interface ExposureLayerProperties extends BaseLayerProperties {
    type: 'exposure';
    severity: RiskLayerSeverity;
}

export interface UnknownRiskLayerProperties extends BaseLayerProperties {
    type: 'unknown';
}

export type RiskLayerProperties = HazardPointLayerProperties
| TrackPointLayerProperties
| TrackPointBoundaryLayerProperties
| TrackLinestringLayerProperties
| UncertaintyConeLayerProperties
| ExposureLayerProperties
| UnknownRiskLayerProperties;
