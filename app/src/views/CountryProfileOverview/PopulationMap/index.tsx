import { useMemo } from 'react';
import { Container } from '@ifrc-go/ui';
import { maxSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import {
    type FillLayer,
    type LineLayer,
    type SymbolLayer,
} from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import useCountry from '#hooks/domain/useCountry';
import {
    COLOR_BLACK,
    COLOR_DARK_GREY,
    COLOR_LIGHT_BLUE,
    COLOR_PRIMARY_BLUE,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { GoApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

const DEFAULT_MAX_POPULATION = 1000000;

interface Props {
    data: GoApiResponse<'/api/v2/country/{id}/databank/'>['wb_population'] | undefined;
}

function PopulatioMap(props: Props) {
    const { data } = props;
    const countryData = useCountry({ id: data?.id ?? -1 });

    const bounds = (isDefined(countryData) && isDefined(countryData.bbox))
        ? getBbox(countryData?.bbox)
        : undefined;

    const districtFillOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => {
            if (
                isNotDefined(data)
                || isNotDefined(data.iso3)
                || isNotDefined(data.districts)
                || data.districts.length === 0
            ) {
                return {
                    type: 'fill',
                    layout: {
                        visibility: 'none',
                    },
                };
            }

            const districts = data.districts.filter(
                ({ population }) => isDefined(population),
            );

            const maxPopulation = maxSafe(
                districts.map(({ population }) => population),
            ) ?? DEFAULT_MAX_POPULATION;

            if (districts.length === 0) {
                return {
                    type: 'fill',
                    layout: {
                        visibility: 'none',
                    },
                };
            }

            return {
                type: 'fill',
                filter: ['==', ['get', 'country_iso3'], data.iso3.toUpperCase()],
                paint: {
                    'fill-opacity': 1,
                    'fill-color': [
                        'match',
                        ['get', 'code'],
                        ...districts.flatMap(
                            (district) => [
                                district.code,
                                [
                                    'interpolate',
                                    ['linear'],
                                    ['number', district.population],
                                    0,
                                    COLOR_LIGHT_BLUE,
                                    maxPopulation,
                                    COLOR_PRIMARY_BLUE,
                                ],
                            ],
                        ),
                        COLOR_DARK_GREY,
                    ],
                    'fill-outline-color': undefined,
                },
                layout: {
                    visibility: 'visible',
                },
            };
        },
        [data],
    );

    const countryFillOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => {
            if (isNotDefined(data) || isNotDefined(data.iso3)) {
                return {
                    type: 'fill',
                    layout: {
                        visibility: 'none',
                    },
                };
            }

            return {
                type: 'fill',
                paint: {
                    'fill-color': COLOR_DARK_GREY,
                    'fill-opacity': [
                        'match',
                        ['get', 'iso3'],
                        data.iso3.toUpperCase(),
                        1,
                        0.1,
                    ],
                    'fill-outline-color': undefined,
                },
                layout: {
                    visibility: 'visible',
                },
            };
        },
        [data],
    );

    const countryLineOptions = useMemo<Omit<LineLayer, 'id'>>(
        () => ({
            type: 'line',
            layout: {
                visibility: 'none',
            },
        }),
        [],
    );

    const districtLineOptions = useMemo<Omit<LineLayer, 'id'>>(
        () => {
            if (isNotDefined(data) || isNotDefined(data.iso3)) {
                return {
                    type: 'line',
                    layout: {
                        visibility: 'none',
                    },
                };
            }

            return {
                type: 'line',
                filter: ['==', ['get', 'country_iso3'], data.iso3.toUpperCase()],
                paint: {
                    'line-opacity': 1,
                    'line-color': COLOR_WHITE,
                },
                layout: {
                    visibility: 'visible',
                },
            };
        },
        [data],
    );

    const districtSymbolOptions = useMemo<Omit<SymbolLayer, 'id'>>(
        () => {
            if (isNotDefined(data) || isNotDefined(data.iso3)) {
                return {
                    type: 'symbol',
                    layout: {
                        visibility: 'none',
                    },
                };
            }

            return {
                type: 'symbol',
                filter: ['==', ['get', 'country_iso3'], data.iso3.toUpperCase()],
                paint: {
                    'text-color': COLOR_BLACK,
                    'text-opacity': 1,
                    'text-halo-blur': 6,
                    'text-halo-width': 3,
                    'text-halo-color': COLOR_WHITE,
                },
            };
        },
        [data],
    );

    return (
        <Container
            // FIXME: use translation
            heading="Population Map"
            className={styles.populationMap}
            withHeaderBorder
        >
            <BaseMap
                withoutLabel
                baseLayers={(
                    <>
                        <MapLayer
                            layerKey="background"
                            layerOptions={{
                                type: 'background',
                                paint: { 'background-color': COLOR_WHITE },
                            }}
                        />
                        <MapLayer
                            layerKey="admin-0"
                            layerOptions={countryFillOptions}
                        />
                        <MapLayer
                            layerKey="admin-1-highlight"
                            layerOptions={districtFillOptions}
                        />
                        <MapLayer
                            layerKey="admin-0-boundary-mask"
                            layerOptions={countryLineOptions}
                        />
                        <MapLayer
                            layerKey="admin-0-boundary"
                            layerOptions={countryLineOptions}
                        />
                        <MapLayer
                            layerKey="admin-0-boundary-disputed"
                            layerOptions={countryLineOptions}
                        />
                        <MapLayer
                            layerKey="admin-1-boundary"
                            layerOptions={districtLineOptions}
                        />
                        <MapLayer
                            layerKey="admin-1-label"
                            layerOptions={districtSymbolOptions}
                        />
                        <MapLayer
                            layerKey="hillshade"
                            layerOptions={{ type: 'fill', layout: { visibility: 'none' } }}
                        />
                    </>
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                />
                <MapBounds
                    duration={DURATION_MAP_ZOOM}
                    bounds={bounds}
                    padding={DEFAULT_MAP_PADDING}
                />
            </BaseMap>
        </Container>
    );
}

export default PopulatioMap;
