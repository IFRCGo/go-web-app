import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ListView,
    NumberInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapCenter,
    MapContainer,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type ObjectError } from '@togglecorp/toggle-form';
import getBbox from '@turf/bbox';
import {
    type AnySourceData,
    type CircleLayer,
    type FillLayer,
    type FitBoundsOptions,
    type FlyToOptions,
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
import LocationSearchInput, { type LocationSearchResult } from '../LocationSearchInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

const centerOptions = {
    zoom: 16,
    duration: 1000,
} satisfies FlyToOptions;

const geoJsonSourceOptions = {
    type: 'geojson',
} satisfies AnySourceData;

interface GeoPoint {
    lng: number;
    lat: number
}

const fitBoundsOptions = {
    padding: {
        left: 20,
        top: 20,
        bottom: 50,
        right: 20,
    },
} satisfies FitBoundsOptions;

type Value = Partial<GeoPoint>;

interface Props<NAME> extends BaseMapProps {
    country?: number | undefined;
    name: NAME;
    value: Value | undefined | null;
    prevValue?: Value | undefined | null;
    onChange: (newValue: Value | undefined, name: NAME) => void;
    onClick?: (feature: MapboxGeoJSONFeature, lngLat: LngLat, map: Map) => void;
    mapContainerClassName?: string;
    className?: string;
    readOnly?: boolean;
    required?: boolean;
    error?: ObjectError<Value>;
    withDiffView?: boolean;
    withPrevValue?: boolean;
}

function BaseMapPointInput<NAME extends string>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        prevValue,
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
        withDiffView = false,
        withPrevValue = false,
        ...otherProps
    } = props;

    const countryDetails = useCountry({ id: country ?? -1 });
    const strings = useTranslation(i18n);

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

    const bounds = useMemo(
        () => {
            if (isNotDefined(countryDetails)) {
                return undefined;
            }

            return getBbox(countryDetails.bbox);
        },
        [countryDetails],
    );

    const [searchResult, setSearchResult] = useState<LocationSearchResult | undefined>();

    const center = useMemo(() => {
        if (isDefined(value?.lng) && isDefined(value?.lat)) {
            return [value.lng, value.lat] satisfies [number, number];
        }
        if (isDefined(searchResult)) {
            return [+searchResult.lon, +searchResult.lat] satisfies [number, number];
        }

        return undefined;
    }, [searchResult, value?.lng, value?.lat]);

    return (
        <div className={_cs(styles.baseMapPointInput, className)}>
            <ListView spacing="sm">
                <NumberInput
                    name="lat"
                    label={strings.latitude}
                    value={value?.lat}
                    onChange={handleLatInputChange}
                    readOnly={readOnly}
                    error={error?.lat}
                    required={required}
                    prevValue={prevValue?.lat}
                    withPrevValue={withPrevValue}
                    withDiffView={withDiffView}
                />
                <NumberInput
                    name="lng"
                    label={strings.longitude}
                    value={value?.lng}
                    onChange={handleLngInputChange}
                    readOnly={readOnly}
                    error={error?.lng}
                    required={required}
                    prevValue={prevValue?.lng}
                    withPrevValue={withPrevValue}
                    withDiffView={withDiffView}
                />
            </ListView>
            {isDefined(countryDetails) && (
                <div className={styles.locationSearch}>
                    <LocationSearchInput
                        readOnly={readOnly}
                        countryIso={countryDetails.iso}
                        onResultSelect={setSearchResult}
                    />
                </div>
            )}
            <BaseMap
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                mapOptions={{
                    zoom: 18,
                    bounds,
                    fitBoundsOptions,
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
                    className={_cs(styles.mapContainer, mapContainerClassName)}
                />
                {isDefined(pointGeoJson) && (
                    <MapSource
                        sourceKey="selected-point"
                        geoJson={pointGeoJson}
                        sourceOptions={geoJsonSourceOptions}
                    >
                        <MapLayer
                            layerKey="point-circle"
                            layerOptions={circleLayerOptions}
                        />
                    </MapSource>
                )}
                {center && (
                    <MapCenter
                        center={center}
                        centerOptions={centerOptions}
                    />
                )}
                {children}
            </BaseMap>
        </div>
    );
}

export default BaseMapPointInput;
