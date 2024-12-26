import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { maxSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
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
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
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
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

const DEFAULT_MAX_POPULATION = 1000000;

type PopulationData = GoApiResponse<'/api/v2/country/{id}/databank/'>['wb_population'] | undefined
interface Props {
    data: PopulationData;
}

interface DistrictProperties {
    district_id: number;
    country_id: number;
    name: string;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, DistrictProperties>;
    lngLat: mapboxgl.LngLatLike;
}

function getMaxPopulation(data: PopulationData) {
    const districts = data?.districts.filter(
        ({ population }) => isDefined(population),
    );

    const maxPopulation = maxSafe(
        districts?.map(({ population }) => population),
    );
    return maxPopulation;
}

function PopulationMap(props: Props) {
    const { data } = props;
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const strings = useTranslation(i18n);

    const countryData = useCountry({ id: data?.id ?? -1 });

    const bounds = (isDefined(countryData) && isDefined(countryData.bbox))
        ? getBbox(countryData?.bbox)
        : undefined;

    const districtsMap = useMemo(() => (
        listToMap(
            data?.districts ?? [],
            (district) => district.id ?? '<no-key>',
        )
    ), [data]);

    const handleDistrictClick = useCallback((
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            feature: feature as unknown as ClickedPoint['feature'],
            lngLat,
        });
        return false;
    }, []);

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

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

            const maxPopulation = getMaxPopulation(data) ?? DEFAULT_MAX_POPULATION;

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
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hovered'], false],
                        COLOR_DARK_GREY,
                        COLOR_WHITE,
                    ],
                    'line-opacity': 1,
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

    const maxPopulation = useMemo(() => (
        getMaxPopulation(data) ?? DEFAULT_MAX_POPULATION
    ), [data]);

    const selectedDistrict = clickedPointProperties?.feature.properties.district_id
        ? districtsMap[clickedPointProperties.feature.properties.district_id]
        : undefined;

    return (
        <Container
            heading={strings.populationMapTitle}
            className={styles.populationMap}
            withHeaderBorder
            footerContent={(
                <div className={styles.populationLegend}>
                    <div className={styles.legendLabel}>{strings.populationLegendLabel}</div>
                    <div className={styles.legendContent}>
                        <div
                            className={styles.populationGradient}
                            style={{ background: `linear-gradient(90deg, ${COLOR_LIGHT_BLUE}, ${COLOR_PRIMARY_BLUE})` }}
                        />
                        <div className={styles.labelList}>
                            <NumberOutput
                                value={0}
                            />
                            <NumberOutput
                                value={maxPopulation}
                            />
                        </div>
                    </div>
                </div>
            )}
            footerActions={(
                <TextOutput
                    label={strings.populationMapSource}
                    value={(
                        <Link
                            variant="tertiary"
                            href="https://data.worldbank.org/"
                            external
                            withUnderline
                        >
                            {strings.populationMapWorldBank}
                        </Link>
                    )}
                />
            )}
        >
            <BaseMap
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
                            hoverable
                            onClick={handleDistrictClick}
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
                {clickedPointProperties?.lngLat && selectedDistrict && (
                    <MapPopup
                        onCloseButtonClick={handlePointClose}
                        coordinates={clickedPointProperties.lngLat}
                        heading={clickedPointProperties.feature.properties.name}
                    >
                        <TextOutput
                            label={strings.populationPopupYearLabel}
                            value={selectedDistrict.year}
                        />
                        <TextOutput
                            value={(
                                <NumberOutput
                                    value={selectedDistrict.population}
                                />
                            )}
                            label={strings.populationLegendLabel}
                        />
                    </MapPopup>
                )}
            </BaseMap>
        </Container>
    );
}

export default PopulationMap;
