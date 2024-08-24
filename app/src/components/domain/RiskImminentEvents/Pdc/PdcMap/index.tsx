import {
    getLayerName,
    MapLayer,
    MapOrder,
    MapSource,
} from '@togglecorp/re-map';

import { geojsonSourceOptions } from '#components/domain/RiskImminentEventMap/mapStyles';
import {
    BUFFERS,
    HazardType,
    NODES,
    TRACKS,
    UNCERTAINTY,
} from '#utils/domain/risk';

import {
    cycloneExposureFillLayer,
    exposureFillLayer,
    trackOutlineLayer,
    trackPointIconLayer,
    trackPointLabelLayer,
    trackPointLayer,
    uncertaintyTrackOutlineLayer,
} from './mapStyles';

interface Props {
    activeEventFootprint: GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;
    hazardType: HazardType | undefined;
    layers:{[key: string]: boolean};
}

function PdcMap(props: Props) {
    const {
        activeEventFootprint,
        layers,
        hazardType,
    } = props;
    return (
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
                    {layers[BUFFERS] && (
                        <MapLayer
                            layerKey="cyclone-exposure-fill"
                            layerOptions={cycloneExposureFillLayer}
                        />
                    )}
                    {(layers[UNCERTAINTY]) && (
                        <MapLayer
                            layerKey="uncertainty-track-line"
                            layerOptions={uncertaintyTrackOutlineLayer}
                        />
                    )}
                    {layers[TRACKS] && (
                        <>
                            <MapLayer
                                layerKey="track-outline"
                                layerOptions={trackOutlineLayer}
                            />
                            <MapLayer
                                layerKey="track-points-label"
                                layerOptions={trackPointLabelLayer}
                            />
                        </>
                    )}
                    {layers[NODES] && (
                        <>
                            <MapLayer
                                layerKey="track-circle"
                                layerOptions={trackPointLayer}
                            />
                            <MapLayer
                                layerKey="track-point"
                                layerOptions={trackPointIconLayer}
                            />
                        </>
                    )}
                </>
            )}
            {activeEventFootprint && (
                <MapOrder ordering={[
                    getLayerName('active-event-footprint', 'exposure-fill', true),
                    getLayerName('active-event-footprint', 'cyclone-exposure-fill', true),
                    getLayerName('active-event-footprint', 'uncertainty-track-line', true),
                    getLayerName('active-event-footprint', 'track-outline', true),
                    getLayerName('active-event-footprint', 'track-circle', true),
                    getLayerName('active-event-footprint', 'track-point', true),
                    getLayerName('active-event-footprint', 'track-points-label', true),
                    getLayerName('event-points', 'point-circle', true),
                    getLayerName('event-points', 'hazard-points-icon', true),
                ]}
                />
            )}
        </MapSource>
    );
}
export default PdcMap;
