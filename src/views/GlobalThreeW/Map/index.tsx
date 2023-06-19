import { generatePath } from 'react-router-dom';
import {
    useContext, useState, useMemo, useCallback,
} from 'react';
import {
    _cs,
    listToMap,
    isDefined,
    max,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';

import Container from '#components/Container';
import MapPopup from '#components/MapPopup';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import GoMapDisclaimer from '#components/GoMapDisclaimer';
import LegendItem from '#components/LegendItem';
import RouteContext from '#contexts/route';
import BarChart from '#components/BarChart';
import { useRequest, ListResponse } from '#utils/restRequest';
import type { Country } from '#types/country';
import {
    defaultMapStyle,
    defaultMapOptions,
    getPointCirclePaint,
    getPointCircleHaloPaint,
    COLOR_RED,
    COLOR_BLUE,
    COLOR_ORANGE,
    pointColorMap,
    OPERATION_TYPE_EMERGENCY,
    OPERATION_TYPE_MULTI,
    OPERATION_TYPE_PROGRAMME,
} from '#utils/map';

import {
    NSOngoingProjectStat,
    countSelector,
    projectPerSectorLabelSelector,
    projectPerSectorKeySelector,
} from '../common';
import styles from './styles.module.css';

const redPointCirclePaint = getPointCirclePaint(COLOR_RED);
const bluePointCirclePaint = getPointCirclePaint(COLOR_BLUE);
const orangePointCirclePaint = getPointCirclePaint(COLOR_ORANGE);
const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface GeoJsonProps {
    countryId: number;
    total: number;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, GeoJsonProps>;
    lngLat: mapboxgl.LngLatLike;
}

type NSProjectGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, GeoJsonProps>;

function getPointType(projectStat: NSOngoingProjectStat) {
    const {
        operation_types,
        operation_types_display,
    } = projectStat;

    if (operation_types.length === 1) {
        return {
            id: operation_types[0],
            title: operation_types_display[0],
        };
    }

    return {
        id: OPERATION_TYPE_MULTI,
        title: 'Multiple types',
    };
}

function getGeoJson(
    countries: Country[],
    nsProjectsMap: Record<number, {
        countryId: number;
        total: number;
        type: {
            id: number;
            title: string;
        };
    }>,
    operationType: number,
): NSProjectGeoJson {
    return {
        type: 'FeatureCollection' as const,
        features: countries.map((country) => {
            const nsProject = nsProjectsMap[country.id];
            if (!nsProject || nsProject.type.id !== operationType) {
                return undefined;
            }

            return {
                id: country.id,
                type: 'Feature' as const,
                properties: nsProject,
                geometry: {
                    type: 'Point' as const,
                    coordinates: country.centroid?.coordinates ?? [0, 0],
                },
            };
        }).filter(isDefined),
    };
}

interface OperationType {
    key: number;
    label: string;
}

interface Props {
    className?: string;
    projectList?: NSOngoingProjectStat[];
}

function GlobalThreeWMap(props: Props) {
    const {
        className,
        projectList,
    } = props;

    const {
        countryThreeW: countryThreeWRoute,
    } = useContext(RouteContext);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint| undefined>();

    const {
        response: countriesResponse,
    } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const {
        response: operationTypeResponse,
    } = useRequest<OperationType[]>({
        url: 'api/v2/operationtype/',
    });

    const countries = countriesResponse?.results;

    const maxProjectCount = useMemo(() => (
        Math.max(
            ...(projectList?.map((d) => d.ongoing_projects) ?? []),
            0,
        )
    ), [projectList]);

    const nsProjectsMap = useMemo(
        () => (
            listToMap(
                projectList ?? [],
                (item) => item.id,
                (item) => ({
                    countryId: item.id,
                    total: item.ongoing_projects,
                    type: getPointType(item),
                }),
            )
        ),
        [projectList],
    );

    const [
        programmesGeo,
        emergencyGeo,
        multiTypeGeo,
    ] = useMemo(
        () => (countries ? [
            getGeoJson(countries, nsProjectsMap, OPERATION_TYPE_PROGRAMME),
            getGeoJson(countries, nsProjectsMap, OPERATION_TYPE_EMERGENCY),
            getGeoJson(countries, nsProjectsMap, OPERATION_TYPE_MULTI),
        ] : []),
        [countries, nsProjectsMap],
    );

    const maxScaleValue = maxProjectCount ?? 0;

    const [
        redPointHaloCirclePaint,
        bluePointHaloCirclePaint,
        orangePointHaloCirclePaint,
    ] = useMemo(
        () => ([
            getPointCircleHaloPaint(COLOR_RED, 'total', maxScaleValue),
            getPointCircleHaloPaint(COLOR_BLUE, 'total', maxScaleValue),
            getPointCircleHaloPaint(COLOR_ORANGE, 'total', maxScaleValue),
        ]),
        [maxScaleValue],
    );

    const selectedNsProjectStats = useMemo(
        () => {
            if (!clickedPointProperties) {
                return undefined;
            }

            const clickedProjectItem = projectList?.find(
                (projectItem) => projectItem.id === clickedPointProperties.feature.id,
            );

            if (!clickedProjectItem) {
                return undefined;
            }
            // FIXME: we may not need maxScaleValue
            return {
                ...clickedProjectItem,
                maxScaleValue: max(
                    clickedProjectItem.projects_per_sector,
                    (projectItem) => projectItem.count,
                ),
            };
        },
        [clickedPointProperties, projectList],
    );

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                lngLat,
            });
            return true;
        },
        [setClickedPointProperties],
    );

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    return (
        <Map
            mapStyle={defaultMapStyle}
            mapOptions={defaultMapOptions}
            navControlShown
            navControlPosition="top-right"
            debug={false}
        >
            <div className={_cs(styles.mapContainerWrapper, className)}>
                <MapContainer className={_cs(styles.mapContainer, className)} />
                <GoMapDisclaimer className={styles.mapDisclaimer} />
            </div>
            {operationTypeResponse && (
                <div className={styles.legend}>
                    {operationTypeResponse.map((d) => (
                        <LegendItem
                            key={d.key}
                            label={d.label}
                            color={pointColorMap[d.key]}
                        />
                    ))}
                </div>
            )}
            {programmesGeo && (
                <MapSource
                    sourceKey="programme-points"
                    sourceOptions={sourceOption}
                    geoJson={programmesGeo}
                >
                    <MapLayer
                        layerKey="points-halo-circle"
                        onClick={handlePointClick}
                        layerOptions={{
                            type: 'circle',
                            paint: redPointHaloCirclePaint,
                        }}
                    />
                    <MapLayer
                        layerKey="points-circle"
                        layerOptions={{
                            type: 'circle',
                            paint: redPointCirclePaint,
                        }}
                    />
                </MapSource>
            )}
            {emergencyGeo && (
                <MapSource
                    sourceKey="emergency-points"
                    sourceOptions={sourceOption}
                    geoJson={emergencyGeo}
                >
                    <MapLayer
                        layerKey="points-halo-circle"
                        onClick={handlePointClick}
                        layerOptions={{
                            type: 'circle',
                            paint: bluePointHaloCirclePaint,
                        }}
                    />
                    <MapLayer
                        layerKey="points-circle"
                        layerOptions={{
                            type: 'circle',
                            paint: bluePointCirclePaint,
                        }}
                    />
                </MapSource>
            )}
            {multiTypeGeo && (
                <MapSource
                    sourceKey="multi-points"
                    sourceOptions={sourceOption}
                    geoJson={multiTypeGeo}
                >
                    <MapLayer
                        layerKey="points-halo-circle"
                        onClick={handlePointClick}
                        layerOptions={{
                            type: 'circle',
                            paint: orangePointHaloCirclePaint,
                        }}
                    />
                    <MapLayer
                        layerKey="points-circle"
                        layerOptions={{
                            type: 'circle',
                            paint: orangePointCirclePaint,
                        }}
                    />
                </MapSource>
            )}
            {clickedPointProperties?.lngLat && selectedNsProjectStats && (
                <MapPopup
                    childrenContainerClassName={styles.popupContent}
                    coordinates={clickedPointProperties.lngLat}
                    onCloseButtonClick={handlePointClose}
                    heading={(
                        <Link
                            to={
                                generatePath(
                                    countryThreeWRoute.absolutePath,
                                    {
                                        countryId: clickedPointProperties
                                            .feature
                                            .properties
                                            .countryId,
                                    },
                                )
                            }
                        >
                            {selectedNsProjectStats.name}
                        </Link>
                    )}
                >
                    <div className={styles.meta}>
                        <TextOutput
                            value={selectedNsProjectStats.ongoing_projects}
                            description="Ongoing Projects"
                        />
                        <TextOutput
                            value={selectedNsProjectStats.target_total}
                            description="Targeted Population"
                        />
                    </div>
                    <Container
                        heading="Top Project Sectors"
                        headingLevel={4}
                    >
                        <BarChart
                            className={styles.topProjectSectorsChart}
                            data={selectedNsProjectStats.projects_per_sector}
                            keySelector={projectPerSectorKeySelector}
                            labelSelector={projectPerSectorLabelSelector}
                            valueSelector={countSelector}
                        />
                    </Container>
                </MapPopup>
            )}
        </Map>
    );
}

export default GlobalThreeWMap;
