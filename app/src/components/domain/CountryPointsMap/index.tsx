import {
    type ReactNode,
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    LegendItem,
    ListView,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import {
    type CircleLayer,
    type CirclePaint,
} from 'mapbox-gl';

import GlobalMap, { type AdminZeroFeatureProperties } from '#components/domain/GlobalMap';
import GoMapContainer from '#components/GoMapContainer';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import useCountryRaw from '#hooks/domain/useCountryRaw';

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

// Point colour comes from each feature's `color` property, so one layer serves any colouring.
const pointPaint: CirclePaint = {
    'circle-radius': 8,
    'circle-color': ['get', 'color'],
    'circle-opacity': 0.8,
};
const pointLayerOptions: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: pointPaint,
};

export interface CountryPoint {
    iso3: string;
    color: string;
}

export interface MapLegendOption {
    value: string | number;
    label: string;
    color: string;
}

interface ClickedPoint {
    featureProperties: AdminZeroFeatureProperties;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    className?: string;
    mapTitle: string;
    points: CountryPoint[];
    // Optional — omit (or pass empty) to render no legend.
    legendOptions?: MapLegendOption[];
    // Popup content for a clicked country that has a point.
    renderPopup: (iso3: string) => ReactNode;
}

function CountryPointsMap(props: Props) {
    const {
        className,
        mapTitle,
        points,
        legendOptions,
        renderPopup,
    } = props;

    const countryResponse = useCountryRaw();
    const [clickedPoint, setClickedPoint] = useState<ClickedPoint | undefined>();

    const colorByIso3 = useMemo(
        () => listToMap(points, (point) => point.iso3, (point) => point.color),
        [points],
    );

    const geoJson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Geometry>>(
        () => ({
            type: 'FeatureCollection',
            features: (countryResponse ?? [])
                .map((country) => {
                    if (isNotDefined(country.centroid) || isNotDefined(country.iso3)) {
                        return undefined;
                    }
                    const color = colorByIso3[country.iso3];
                    if (isNotDefined(color)) {
                        return undefined;
                    }
                    return {
                        type: 'Feature' as const,
                        geometry: country.centroid as {
                            type: 'Point';
                            coordinates: [number, number];
                        },
                        properties: {
                            id: country.iso3,
                            color,
                        },
                    };
                })
                .filter(isDefined),
        }),
        [countryResponse, colorByIso3],
    );

    const handleCountryClick = useCallback(
        (featureProperties: AdminZeroFeatureProperties, lngLat: mapboxgl.LngLatLike) => {
            if (isDefined(colorByIso3[featureProperties.iso3])) {
                setClickedPoint({ featureProperties, lngLat });
            }
            return true;
        },
        [colorByIso3],
    );

    const handlePointClose = useCallback(() => setClickedPoint(undefined), []);

    const hasLegend = isDefined(legendOptions) && legendOptions.length > 0;

    return (
        <GlobalMap onAdminZeroFillClick={handleCountryClick}>
            <GoMapContainer
                className={className}
                title={mapTitle}
                footer={hasLegend ? (
                    <ListView withWrap withSpacingOpticalCorrection spacing="sm">
                        {legendOptions.map((legendItem) => (
                            <LegendItem
                                key={legendItem.value}
                                color={legendItem.color}
                                label={legendItem.label}
                            />
                        ))}
                    </ListView>
                ) : undefined}
            />
            <MapSource
                sourceKey="country-points"
                sourceOptions={sourceOptions}
                geoJson={geoJson}
            >
                <MapLayer
                    layerKey="point-circle"
                    layerOptions={pointLayerOptions}
                />
            </MapSource>
            {clickedPoint?.lngLat && (
                <MapPopup
                    onCloseButtonClick={handlePointClose}
                    coordinates={clickedPoint.lngLat}
                    heading={(
                        <Link
                            to="countriesLayout"
                            urlParams={{ countryId: clickedPoint.featureProperties.country_id }}
                        >
                            {clickedPoint.featureProperties.name}
                        </Link>
                    )}
                    withPadding
                >
                    {renderPopup(clickedPoint.featureProperties.iso3)}
                </MapPopup>
            )}
        </GlobalMap>
    );
}

export default CountryPointsMap;
