import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapChildContext,
    MapContainer,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import {
    type Expression,
    type FillLayer,
    type LineLayer,
    type SymbolLayer,
} from 'mapbox-gl';

import useCountry from '#hooks/domain/useCountry';
import {
    COLOR_BLACK,
    COLOR_DARK_GREY,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
} from '#utils/constants';
import { getGeoJsonBounds } from '#utils/geo';
import {
    getAdmin1CentroidTileset,
    getAdmin2CentroidTileset,
    getAdmin2Tileset,
    getBboxListBoundingBox,
} from '#utils/map';

import BaseMap from '../BaseMap';

import styles from './styles.module.css';

const MAP_LOAD_TIMEOUT = 15_000;
const ADMIN_2_MIN_ZOOM = 5;

const MAP_PADDING = 8;

interface Admin2 {
    code: string;
    bbox?: Record<string, unknown> | null;
}

interface MapControllerProps {
    bounds: [number, number, number, number] | undefined;
    onLoad?: () => void;
}

// NOTE: This lets the consumer (eg. pdf export) know that the map is
// completely rendered
function MapController(props: MapControllerProps) {
    const {
        bounds,
        onLoad,
    } = props;

    const { map } = useContext(MapChildContext);

    useEffect(() => {
        if (isNotDefined(map) || isNotDefined(onLoad) || isNotDefined(bounds)) {
            return undefined;
        }
        const handleIdle = () => {
            if (!map.areTilesLoaded()) {
                return;
            }
            map.off('idle', handleIdle);
            onLoad();
        };

        map.on('idle', handleIdle);

        return () => {
            map.off('idle', handleIdle);
        };
    }, [map, onLoad, bounds]);

    if (isNotDefined(bounds)) {
        return null;
    }
    return (
        <MapBounds
            bounds={bounds}
            padding={MAP_PADDING}
            duration={0}
        />
    );
}

interface Props {
    className?: string;
    countryId: number;
    admin2Details?: Admin2[] | null;
    admin1Ids?: number[] | null;
    onLoad?: () => void;
}

function AdminAreaMap(props: Props) {
    const {
        className,
        countryId,
        admin2Details,
        admin1Ids,
        onLoad,
    } = props;

    const countryDetails = useCountry({ id: countryId });
    const iso3 = countryDetails?.iso3;

    const showAdmin2 = (admin2Details?.length ?? 0) > 0;

    useEffect(() => {
        if (isNotDefined(onLoad)) {
            return undefined;
        }

        const timeout = setTimeout(onLoad, MAP_LOAD_TIMEOUT);

        return () => {
            clearTimeout(timeout);
        };
    }, [onLoad]);

    const isSelectedAdminTwoExpression = useMemo<Expression>(
        () => [
            'in',
            ['get', 'code'],
            ['literal', admin2Details?.map(({ code }) => code) ?? []],
        ],
        [admin2Details],
    );

    const isSelectedAdminOneExpression = useMemo<Expression>(
        () => [
            'in',
            ['get', 'district_id'],
            ['literal', admin1Ids ?? []],
        ],
        [admin1Ids],
    );

    const bounds = useMemo(() => {
        const selectedBounds = showAdmin2
            ? getBboxListBoundingBox(admin2Details?.map(({ bbox }) => bbox))
            : undefined;

        if (isDefined(selectedBounds)) {
            return selectedBounds;
        }

        if (isNotDefined(countryDetails?.bbox)) {
            return undefined;
        }

        return getGeoJsonBounds(countryDetails.bbox);
    }, [showAdmin2, admin2Details, countryDetails]);

    const adminOneLabelLayerOptions: Omit<SymbolLayer, 'id'> = useMemo(() => ({
        type: 'symbol',
        paint: {
            'text-opacity': [
                'match',
                ['get', 'country_id'],
                countryId,
                1,
                0,
            ],
        },
        layout: {
            'text-offset': [
                0,
                1,
            ],
            visibility: 'visible',
        },
    }), [countryId]);

    const adminOneLayerOptions = useMemo(() => {
        if (isNotDefined(iso3)) {
            return undefined;
        }

        const countryFilter: Expression = ['==', ['get', 'country_iso3'], iso3.toUpperCase()];

        const fill: Omit<FillLayer, 'id'> = {
            type: 'fill',
            filter: countryFilter,
            paint: {
                'fill-color': [
                    'case',
                    isSelectedAdminOneExpression,
                    COLOR_PRIMARY_RED,
                    COLOR_LIGHT_GREY,
                ],
                'fill-opacity': [
                    'case',
                    isSelectedAdminOneExpression,
                    1,
                    0.5,
                ],
            },
            layout: {
                visibility: 'visible',
            },
        };

        const line: Omit<LineLayer, 'id'> = {
            type: 'line',
            filter: countryFilter,
            paint: {
                'line-color': [
                    'case',
                    isSelectedAdminOneExpression,
                    COLOR_WHITE,
                    COLOR_DARK_GREY,
                ],
                'line-width': 0.5,
                'line-opacity': 1,
            },
            layout: {
                visibility: 'visible',
            },
        };

        return {
            fill,
            line,
        };
    }, [iso3, isSelectedAdminOneExpression]);

    const adminOneSelectedLabelLayerOptions = useMemo<Omit<SymbolLayer, 'id'>>(
        () => ({
            type: 'symbol',
            'source-layer': getAdmin1CentroidTileset().sourceLayer,
            filter: isSelectedAdminOneExpression,
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Poppins Bold', 'Arial Unicode MS Regular'],
                'text-anchor': 'center',
                'text-size': 10,
                'text-padding': 4,
                'text-allow-overlap': true,
            },
            paint: {
                'text-color': COLOR_WHITE,
                'text-halo-color': COLOR_BLACK,
                'text-halo-width': 0.4,
            },
        }),
        [isSelectedAdminOneExpression],
    );

    const adminTwoLayerOptions = useMemo(() => {
        if (isNotDefined(iso3)) {
            return undefined;
        }

        const { sourceLayer } = getAdmin2Tileset(iso3);
        const { sourceLayer: centroidSourceLayer } = getAdmin2CentroidTileset(iso3);

        const fill: Omit<FillLayer, 'id'> = {
            type: 'fill',
            'source-layer': sourceLayer,
            paint: {
                'fill-color': [
                    'case',
                    isSelectedAdminTwoExpression,
                    COLOR_PRIMARY_RED,
                    COLOR_LIGHT_GREY,
                ],
                'fill-opacity': [
                    'case',
                    isSelectedAdminTwoExpression,
                    1,
                    0.5,
                ],
            },
            layout: {
                visibility: 'visible',
            },
        };

        const line: Omit<LineLayer, 'id'> = {
            type: 'line',
            'source-layer': sourceLayer,
            paint: {
                'line-color': [
                    'case',
                    isSelectedAdminTwoExpression,
                    COLOR_WHITE,
                    COLOR_DARK_GREY,
                ],
                'line-width': 0.5,
                'line-opacity': 1,
            },
            layout: {
                visibility: 'visible',
            },
        };

        const label: Omit<SymbolLayer, 'id'> = {
            type: 'symbol',
            'source-layer': centroidSourceLayer,
            filter: isSelectedAdminTwoExpression,
            layout: {
                'text-field': ['get', 'name'],
                'text-anchor': 'center',
                'text-size': 10,
                'text-padding': 4,
            },
        };

        return {
            fill,
            line,
            label,
        };
    }, [iso3, isSelectedAdminTwoExpression]);

    return (
        <BaseMap
            mapOptions={{
                interactive: false,
                // NOTE: The admin 2 tiles are only available from this zoom level
                minZoom: showAdmin2 ? ADMIN_2_MIN_ZOOM : undefined,
                fadeDuration: 0,
            }}
            navControlShown={false}
            scaleControlShown={false}
            baseLayers={(
                <>
                    <MapLayer
                        layerKey="admin-1-label"
                        layerOptions={adminOneLabelLayerOptions}
                    />
                    {!showAdmin2 && isDefined(adminOneLayerOptions) && (
                        <>
                            <MapLayer
                                layerKey="admin-1-highlight"
                                layerOptions={adminOneLayerOptions.fill}
                            />
                            <MapLayer
                                layerKey="admin-1-boundary"
                                layerOptions={adminOneLayerOptions.line}
                            />
                        </>
                    )}
                </>
            )}
        >
            <MapContainer className={_cs(styles.adminAreaMap, className)} />
            <MapController
                bounds={bounds}
                onLoad={onLoad}
            />
            {!showAdmin2 && (
                <MapSource
                    sourceKey="country-admin-1-labels"
                    sourceOptions={{
                        type: 'vector',
                        url: getAdmin1CentroidTileset().url,
                    }}
                >
                    <MapLayer
                        layerKey="admin-1-selected-label"
                        layerOptions={adminOneSelectedLabelLayerOptions}
                    />
                </MapSource>
            )}
            {!showAdmin2 || isNotDefined(iso3) || isNotDefined(adminTwoLayerOptions) ? null : (
                <>
                    <MapSource
                        sourceKey="country-admin-2"
                        sourceOptions={{
                            type: 'vector',
                            url: getAdmin2Tileset(iso3).url,
                        }}
                    >
                        <MapLayer
                            layerKey="admin-2-fill"
                            layerOptions={adminTwoLayerOptions.fill}
                        />
                        <MapLayer
                            layerKey="admin-2-line"
                            layerOptions={adminTwoLayerOptions.line}
                        />
                    </MapSource>
                    <MapSource
                        sourceKey="country-admin-2-labels"
                        sourceOptions={{
                            type: 'vector',
                            url: getAdmin2CentroidTileset(iso3).url,
                        }}
                    >
                        <MapLayer
                            layerKey="admin-2-label"
                            layerOptions={adminTwoLayerOptions.label}
                        />
                    </MapSource>
                </>
            )}
        </BaseMap>
    );
}

export default AdminAreaMap;
