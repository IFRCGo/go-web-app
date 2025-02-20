import {
    useCallback,
    useMemo,
} from 'react';
import { NumberInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
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
import { type ObjectError } from '@togglecorp/toggle-form';
import getBbox from '@turf/bbox';
import {
    type CircleLayer,
    type FillLayer,
    type LngLat,
    type Map,
    type MapboxGeoJSONFeature,
    type Point,
} from 'mapbox-gl';

import BaseMap, { type Props as BaseMapProps } from '#components/domain/BaseMap';
import useCountry from '#hooks/domain/useCountry';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { localUnitMapStyle } from '#utils/map';

import ActiveCountryBaseMapLayer from '../ActiveCountryBaseMapLayer';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface GeoPoint {
    lng: number;
    lat: number
}

type Value = Partial<GeoPoint>;

interface Props<NAME> extends BaseMapProps {
    country?: number | undefined;
    name: NAME;
    value: Value | undefined | null;
    onChange: (newValue: Value | undefined, name: NAME) => void;
    onClick?: (feature: MapboxGeoJSONFeature, lngLat: LngLat, map: Map) => void;
    mapContainerClassName?: string;
    className?: string;
    readOnly?: boolean;
    required?: boolean;
    error?: ObjectError<Value>;
    showChanges: boolean;
    latitudeInputSectionClassName?: string;
    longitudeInputSectionClassName?: string;
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
        readOnly,
        country,
        required,
        error,
        latitudeInputSectionClassName,
        longitudeInputSectionClassName,
        ...otherProps
    } = props;

    const countryDetails = useCountry({ id: country ?? -1 });
    const strings = useTranslation(i18n);

    const bounds = useMemo(
        () => {
            if (isNotDefined(countryDetails)) {
                return undefined;
            }

            return getBbox(countryDetails.bbox);
        },
        [countryDetails],
    );

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
                properties: {
                    radius: 10,
                },
            };
        },
        [value],
    );

    const handleMapLayerClick = useCallback(
        (feature: MapboxGeoJSONFeature, lngLat: LngLat, _: Point, map: Map) => {
            if (onClick) {
                onClick(feature, lngLat, map);
            }

            if (isDefined(country) && feature.properties?.country_id !== country) {
                return undefined;
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
        [name, onChange, onClick, country],
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
                'circle-radius': ['get', 'radius'],
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
                    inputSectionClassName={latitudeInputSectionClassName}
                    className={styles.input}
                    name="lat"
                    label={strings.latitude}
                    value={value?.lat}
                    onChange={handleLatInputChange}
                    readOnly={readOnly}
                    error={error?.lat}
                    required={required}
                />
                <NumberInput
                    inputSectionClassName={longitudeInputSectionClassName}
                    className={styles.input}
                    name="lng"
                    label={strings.longitude}
                    value={value?.lng}
                    onChange={handleLngInputChange}
                    readOnly={readOnly}
                    error={error?.lng}
                    required={required}
                />
            </div>
            <BaseMap
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                mapOptions={{
                    minZoom: 3,
                    zoom: 3,
                    bounds,
                    ...mapOptions,
                }}
                mapStyle={mapStyle}
                baseLayers={(
                    <>
                        {isDefined(countryDetails) && (
                            <ActiveCountryBaseMapLayer
                                activeCountryIso3={countryDetails.iso3}
                            />
                        )}
                        <MapLayer
                            layerKey="admin-1-highlight"
                            layerOptions={adminOneLayerOptions}
                            onClick={!readOnly ? handleMapLayerClick : undefined}
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
