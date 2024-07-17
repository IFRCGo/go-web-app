import {
    useContext,
    useMemo,
} from 'react';
import { LanguageContext } from '@ifrc-go/ui/contexts';
import { ErrorBoundary } from '@sentry/react';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import Map, {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type SymbolLayer } from 'mapbox-gl';

import useCountry from '#hooks/domain/useCountry';
import {
    defaultMapOptions,
    defaultMapStyle,
    defaultNavControlOptions,
    defaultNavControlPosition,
} from '#utils/map';

import styles from './styles.module.css';

type MapProps = Parameters<typeof Map>[0];

type overrides = 'mapStyle' | 'mapOptions' | 'navControlShown' | 'navControlPosition' | 'navControlOptions' | 'scaleControlShown';

export type Props = Omit<MapProps, overrides> & {
    baseLayers?: React.ReactNode;
    withDisclaimer?: boolean;
    withoutLabel?: boolean;
} & Partial<Pick<MapProps, overrides>>;

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

const adminLabelOverrideOptions: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Poppins Regular', 'Arial Unicode MS Regular'],
        'text-letter-spacing': 0.15,
        'text-line-height': 1.2,
        'text-max-width': 8,
        'text-justify': 'center',
        'text-anchor': 'top',
        'text-padding': 2,
        'text-size': [
            'interpolate', ['linear', 1], ['zoom'],
            0, 6,
            6, 16,
        ],
    },
    paint: {
        'text-color': '#000000',
        'text-halo-color': '#555555',
        'text-halo-width': 0.2,
    },
};

function BaseMap(props: Props) {
    const {
        baseLayers,
        mapStyle,
        mapOptions,
        navControlShown,
        navControlPosition,
        navControlOptions,
        scaleControlShown,
        children,
        withoutLabel = false,
        ...otherProps
    } = props;

    const countries = useCountry();

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => ({
            type: 'FeatureCollection' as const,
            features: countries
                ?.map((country) => {
                    if (isFalsyString(country.name) || isNotDefined(country.centroid)) {
                        return undefined;
                    }

                    return {
                        type: 'Feature' as const,
                        geometry: country.centroid as {
                            type: 'Point',
                            coordinates: [number, number],
                        },
                        properties: {
                            id: country.id,
                            name: country.name,
                        },
                    };
                }).filter(isDefined) ?? [],
        }),
        [countries],
    );

    const {
        currentLanguage,
    } = useContext(LanguageContext);

    const adminLabelLayerOptions : Omit<SymbolLayer, 'id'> = useMemo(
        () => {
            // ar, es, fr
            let label: string;
            if (currentLanguage === 'es') {
                label = 'name_es';
            } else if (currentLanguage === 'ar') {
                label = 'name_ar';
            } else if (currentLanguage === 'fr') {
                label = 'name_fr';
            } else {
                label = 'name';
            }

            return {
                type: 'symbol',
                layout: {
                    'text-field': ['get', label],
                },
            };
        },
        [currentLanguage],
    );

    return (
        <Map
            mapStyle={mapStyle ?? defaultMapStyle}
            mapOptions={{ ...defaultMapOptions, ...mapOptions }}
            navControlShown={navControlShown ?? true}
            navControlPosition={navControlPosition ?? defaultNavControlPosition}
            navControlOptions={navControlOptions ?? defaultNavControlOptions}
            scaleControlShown={scaleControlShown ?? false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            <MapSource
                sourceKey="composite"
                managed={false}
            >
                <MapLayer
                    layerKey="admin-0-label"
                    layerOptions={adminLabelLayerOptions}
                />
                <MapLayer
                    layerKey="admin-0-label-non-independent"
                    layerOptions={adminLabelLayerOptions}
                />
                <MapLayer
                    layerKey="admin-0-label-priority"
                    layerOptions={adminLabelLayerOptions}
                />
                {baseLayers}
            </MapSource>
            {!withoutLabel && (
                <MapSource
                    sourceKey="override-labels"
                    sourceOptions={sourceOptions}
                    geoJson={countryCentroidGeoJson}
                >
                    <MapLayer
                        layerKey="point-circle"
                        layerOptions={adminLabelOverrideOptions}
                    />
                </MapSource>
            )}
            {children}
        </Map>
    );
}

function BaseMapWithErrorBoundary(props: Props) {
    return (
        <ErrorBoundary
            fallback={(
                <div className={styles.mapError}>
                    Failed to load map!
                </div>
            )}
        >
            <BaseMap
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </ErrorBoundary>
    );
}

export default BaseMapWithErrorBoundary;
