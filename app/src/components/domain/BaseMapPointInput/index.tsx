import {
    useCallback,
    useMemo,
} from 'react';
import { NumberInput } from '@ifrc-go/ui';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapContainer,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import {
    CircleLayer,
    FillLayer,
    LngLat,
    Map,
    MapboxGeoJSONFeature,
    Point,
} from 'mapbox-gl';

import BaseMap, { Props as BaseMapProps } from '#components/domain/BaseMap';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { localUnitMapStyle } from '#utils/map';

import styles from './styles.module.css';

export interface GeoPoint {
    lng: number;
    lat: number
}

type Value = Partial<GeoPoint>;

interface Props<NAME> extends BaseMapProps {
    name: NAME,
    value: Value | undefined | null;
    onChange: (newValue: Value | undefined, name: NAME) => void;
    onClick?: (feature: MapboxGeoJSONFeature, lngLat: LngLat, map: Map) => void;
    mapContainerClassName?: string;
    className?: string;
}

function BaseMapPointInput<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
        onClick,
        baseLayers,
        mapContainerClassName,
        children,
        mapOptions,
        mapStyle = localUnitMapStyle,
        ...otherProps
    } = props;

    const pointGeoJson = useMemo<GeoJSON.Feature | undefined>(
        () => {
            if (isNotDefined(value) || isNotDefined(value.lng) || isNotDefined(value.lat)) {
                return undefined;
            }

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [value.lng, value.lat],
                },
                properties: {},
            };
        },
        [value],
    );

    const handleMapLayerClick = useCallback(
        (feature: MapboxGeoJSONFeature, lngLat: LngLat, _: Point, map: Map) => {
            if (onClick) {
                onClick(feature, lngLat, map);
            }

            onChange(
                {
                    lat: lngLat.lat,
                    lng: lngLat.lng,
                },
                name,
            );
            return undefined;
        },
        [name, onChange, onClick],
    );

    const adminOneLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            paint: {
                'fill-color': COLOR_LIGHT_GREY,
            },
            filter: undefined,
        }),
        [],
    );

    const circleLayerOptions = useMemo<Omit<CircleLayer, 'id'>>(
        () => ({
            type: 'circle',
            layout: {
                visibility: 'visible',
            },
            paint: {
                'circle-radius': 10,
                'circle-color': COLOR_PRIMARY_RED,
            },
        }),
        [],
    );

    const handleLatInputChange = useCallback(
        (lat: number | undefined) => {
            onChange({
                ...value,
                lat,
            }, name);
        },
        [value, onChange, name],
    );

    const handleLngInputChange = useCallback(
        (lng: number | undefined) => {
            onChange({
                ...value,
                lng,
            }, name);
        },
        [value, onChange, name],
    );

    return (
        <div className={_cs(styles.baseMapPointInput, className)}>
            <div className={styles.locationInputs}>
                <NumberInput
                    name="lat"
                    // FIXME: use strings
                    label="Latitude"
                    value={value?.lat}
                    onChange={handleLatInputChange}
                />
                <NumberInput
                    name="lng"
                    // FIXME: use strings
                    label="Longitude"
                    value={value?.lng}
                    onChange={handleLngInputChange}
                />
            </div>
            <BaseMap
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                mapOptions={{
                    minZoom: 3,
                    zoom: 3,
                    ...mapOptions,
                }}
                mapStyle={mapStyle}
                baseLayers={(
                    <>
                        <MapLayer
                            layerKey="admin-1-highlight"
                            layerOptions={adminOneLayerOptions}
                            onClick={handleMapLayerClick}
                        />
                        {baseLayers}
                    </>
                )}
            >
                <MapContainer
                    className={mapContainerClassName}
                />
                {isDefined(pointGeoJson) && (
                    <MapSource
                        sourceKey="selected-point"
                        geoJson={pointGeoJson}
                        sourceOptions={{ type: 'geojson' }}
                    >
                        <MapLayer
                            layerKey="point-circle"
                            layerOptions={circleLayerOptions}
                        />
                    </MapSource>
                )}
                {children}
            </BaseMap>
        </div>
    );
}

export default BaseMapPointInput;
