import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import {
    getLayerName,
    MapLayer,
    MapOrder,
    MapSource,
} from '@togglecorp/re-map';

import { geojsonSourceOptions } from '#components/domain/RiskImminentEventMap/mapStyles';
import MapPopup from '#components/MapPopup';
import {
    HazardType,
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LAYER_CYCLONE_TRACKS,
    LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS,
    LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS,
} from '#utils/domain/risk';

import {
    cycloneExposureFillLayer,
    exposureFillLayer,
    trackOutlineLayer,
    trackPointIconLayer,
    trackPointLabelLayer,
    trackPointLayer,
    uncertaintyFiveDaysTrackOutlineLayer,
    uncertaintyThreeDaysTrackOutlineLayer,
} from './mapStyles';

interface PdcProperties {
    alert_level?: 'Red' | 'Orange' | 'Green' | 'Cones' | null;
    source?: string;
    name?: string;
    node_time?: string;
    wind_speed?: string;
    storm_status?: string;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, PdcProperties>;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    activeEventFootprint: GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;
    hazardType: HazardType | undefined;
    layers: Record<number, boolean>;
}

function PdcMap(props: Props) {
    const {
        activeEventFootprint,
        layers,
        hazardType,
    } = props;

    const mapOrder = useMemo(() => {
        if (activeEventFootprint) {
            return (
                <MapOrder ordering={[
                    getLayerName('active-event-footprint', 'exposure-fill', true),
                    getLayerName('active-event-footprint', 'cyclone-exposure-fill', true),
                    getLayerName('active-event-footprint', 'uncertainty-track-line', true),
                    getLayerName('active-event-footprint', 'track-outline', true),
                    getLayerName('active-event-footprint', 'track-circle', true),
                    getLayerName('active-event-footprint', 'track-point', true),
                    // getLayerName('event-points', 'point-circle', true),
                    // getLayerName('event-points', 'hazard-points-icon', true),
                ]}
                />
            );
        }
        return null;
    }, [activeEventFootprint]);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                lngLat,
            });
            return true;
        },
        [setClickedPointProperties],
    );

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    const popupDetails = clickedPointProperties
        ? clickedPointProperties?.feature?.properties
        : undefined;

    return (
        <>
            <MapSource
                sourceKey="active-event-footprint"
                sourceOptions={geojsonSourceOptions}
                geoJson={activeEventFootprint}
            >
                {hazardType !== 'TC' && (
                    <MapLayer
                        layerKey="exposure-fill"
                        layerOptions={exposureFillLayer}
                    />
                )}
                {hazardType === 'TC' && (
                    <>
                        {layers[LAYER_CYCLONE_BUFFERS] && (
                            <MapLayer
                                layerKey="cyclone-exposure-fill"
                                layerOptions={cycloneExposureFillLayer}
                            />
                        )}
                        {(layers[LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS]) && (
                            <MapLayer
                                layerKey="uncertainty-five-days-track-line"
                                layerOptions={uncertaintyFiveDaysTrackOutlineLayer}
                            />
                        )}
                        {(layers[LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS]) && (
                            <MapLayer
                                layerKey="uncertainty-three-days-track-line"
                                layerOptions={uncertaintyThreeDaysTrackOutlineLayer}
                            />
                        )}
                        {layers[LAYER_CYCLONE_TRACKS] && (
                            <MapLayer
                                layerKey="track-outline"
                                layerOptions={trackOutlineLayer}
                            />
                        )}
                        {layers[LAYER_CYCLONE_NODES] && (
                            <>
                                <MapLayer
                                    layerKey="track-circle"
                                    layerOptions={trackPointLayer}
                                    onClick={handlePointClick}
                                />
                                <MapLayer
                                    layerKey="track-point"
                                    layerOptions={trackPointIconLayer}
                                />
                                <MapLayer
                                    layerKey="track-points-label"
                                    layerOptions={trackPointLabelLayer}
                                />
                            </>
                        )}
                    </>
                )}
                {mapOrder}
            </MapSource>

            {isDefined(clickedPointProperties)
                && clickedPointProperties.lngLat
                && isDefined(popupDetails) && (
                <MapPopup
                    coordinates={clickedPointProperties.lngLat}
                    onCloseButtonClick={handlePointClose}
                    heading={popupDetails.name}
                    headingLevel={4}
                    contentViewType="vertical"
                    compactMessage
                    ellipsizeHeading
                >
                    <TextOutput
                        label="Storm"
                        value={popupDetails?.storm_status}
                        strongLabel
                    />
                    <TextOutput
                        label="Alert Level"
                        value={popupDetails?.alert_level}
                        strongLabel
                    />
                </MapPopup>
            )}
        </>
    );
}
export default PdcMap;
