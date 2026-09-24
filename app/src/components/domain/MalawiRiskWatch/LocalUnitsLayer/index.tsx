import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';
import {
    MapImage,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import type {
    CircleLayer,
    SymbolLayer,
} from 'mapbox-gl';

import MapPopup from '#components/MapPopup';
import {
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
} from '#utils/constants';

import { BASEMAP_ADMIN_1_BOUNDARY_LAYER } from '../constants';
import useLocalUnits, {
    getLocalUnitIconKey,
    type LocalUnitProperties,
} from '../useLocalUnits';

import i18n from './i18n.json';

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

// SDF images take the icon colour from paint
const mapImageOptions = {
    sdf: true,
};

const iconLayerOptions: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    layout: {
        'icon-image': ['get', 'iconKey'],
        'icon-size': 0.15,
        'icon-allow-overlap': true,
    },
    paint: {
        'icon-color': COLOR_WHITE,
    },
};

interface ClickedUnit {
    properties: LocalUnitProperties;
    coordinates: [number, number];
}

function LocalUnitsLayer() {
    const strings = useTranslation(i18n);
    const {
        featureCollection,
        types,
    } = useLocalUnits();

    const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});
    const [clickedUnit, setClickedUnit] = useState<ClickedUnit | undefined>();

    const handleIconLoad = useCallback(
        (loaded: boolean, key: string) => {
            setLoadedIcons((previous) => ({ ...previous, [key]: loaded }));
        },
        [],
    );
    const iconsReady = types.length > 0
        && types.every((type) => loadedIcons[getLocalUnitIconKey(type.code)]);

    const circleLayerOptions = useMemo<Omit<CircleLayer, 'id'>>(
        () => ({
            type: 'circle',
            paint: {
                'circle-radius': 9,
                'circle-color': types.length > 0
                    ? [
                        'match',
                        ['get', 'typeCode'],
                        ...types.flatMap((type) => [type.code, type.color ?? COLOR_PRIMARY_RED]),
                        COLOR_PRIMARY_RED,
                    ]
                    : COLOR_PRIMARY_RED,
                'circle-stroke-color': COLOR_WHITE,
                'circle-stroke-width': 1,
            },
        }),
        [types],
    );

    const handleClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            const geometry = feature.geometry as GeoJSON.Point;
            const [lng, lat] = geometry.coordinates;
            setClickedUnit({
                properties: feature.properties as LocalUnitProperties,
                coordinates: isDefined(lng) && isDefined(lat)
                    ? [lng, lat]
                    : [lngLat.lng, lngLat.lat],
            });
            return true;
        },
        [],
    );
    const handlePopupClose = useCallback(
        () => setClickedUnit(undefined),
        [],
    );

    return (
        <>
            {types.map((type) => (
                <MapImage
                    key={type.code}
                    name={getLocalUnitIconKey(type.code)}
                    url={type.iconUrl}
                    onLoad={handleIconLoad}
                    imageOptions={mapImageOptions}
                />
            ))}
            <MapSource
                sourceKey="malawi-local-units"
                sourceOptions={sourceOptions}
                geoJson={featureCollection}
            >
                <MapLayer
                    layerKey="local-unit-point"
                    layerOptions={circleLayerOptions}
                    beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
                    onClick={handleClick}
                    hoverable
                />
                {iconsReady && (
                    <MapLayer
                        layerKey="local-unit-icon"
                        layerOptions={iconLayerOptions}
                        beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
                    />
                )}
            </MapSource>
            {isDefined(clickedUnit) && (
                <MapPopup
                    coordinates={clickedUnit.coordinates}
                    onCloseButtonClick={handlePopupClose}
                    heading={clickedUnit.properties.name}
                    headingLevel={5}
                >
                    <ListView
                        layout="block"
                        spacing="xs"
                    >
                        <TextOutput
                            label={strings.localUnitTypeLabel}
                            value={clickedUnit.properties.typeName}
                            strongValue
                        />
                        {isDefined(clickedUnit.properties.facilityType) && (
                            <TextOutput
                                label={strings.localUnitFacilityTypeLabel}
                                value={clickedUnit.properties.facilityType}
                                strongValue
                            />
                        )}
                        {isDefined(clickedUnit.properties.address) && (
                            <TextOutput
                                label={strings.localUnitAddressLabel}
                                value={clickedUnit.properties.address}
                                strongValue
                            />
                        )}
                    </ListView>
                </MapPopup>
            )}
        </>
    );
}

export default LocalUnitsLayer;
