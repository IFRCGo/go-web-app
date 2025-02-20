import {
    useContext,
    useMemo,
} from 'react';
import { LanguageContext } from '@ifrc-go/ui/contexts';
import { ErrorBoundary } from '@sentry/react';
import Map, {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type SymbolLayer } from 'mapbox-gl';

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
} & Partial<Pick<MapProps, overrides>>;

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
        ...otherProps
    } = props;

    const { currentLanguage } = useContext(LanguageContext);

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
