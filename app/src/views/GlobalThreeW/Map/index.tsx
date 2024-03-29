import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BarChart,
    Container,
    LegendItem,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
    max,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';

import BaseMap from '#components/domain/BaseMap';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    COLOR_BLUE,
    COLOR_ORANGE,
    COLOR_RED,
    OPERATION_TYPE_EMERGENCY,
    OPERATION_TYPE_MULTI,
    OPERATION_TYPE_PROGRAMME,
} from '#utils/constants';
import {
    adminFillLayerOptions,
    getPointCircleHaloPaint,
    getPointCirclePaint,
    pointColorMap,
} from '#utils/map';
import type { GoApiResponse } from '#utils/restRequest';

import {
    countSelector,
    projectPerSectorKeySelector,
    projectPerSectorLabelSelector,
} from '../common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryResponse = GoApiResponse<'/api/v2/country/'>;
type CountryListItem = NonNullable<CountryResponse['results']>[number];

type NsProjectsResponse = GoApiResponse<'/api/v2/global-project/ns-ongoing-projects-stats/'>;

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
    countryId: number;
    lngLat: mapboxgl.LngLatLike;
}

type NSProjectGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, GeoJsonProps>;

function getGeoJson(
    countries: CountryListItem[],
    nsProjectsMap: Record<number, {
        countryId: number;
        total: number | undefined;
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
            if (
                isNotDefined(nsProject)
                || nsProject.type.id !== operationType
                || isNotDefined(country.centroid)
            ) {
                return undefined;
            }

            return {
                id: country.id,
                type: 'Feature' as const,
                properties: {
                    ...nsProject,
                    total: nsProject.total ?? 0,
                },
                geometry: country.centroid as {
                    type: 'Point',
                    coordinates: [number, number],
                },
            };
        }).filter(isDefined),
    };
}

interface Props {
    className?: string;
    projectList: NsProjectsResponse | undefined;
}

function GlobalThreeWMap(props: Props) {
    const {
        className,
        projectList: projectListFromProps,
    } = props;

    const strings = useTranslation(i18n);

    const getPointType = useCallback((projectStat: NonNullable<NsProjectsResponse>[number]) => {
        const {
            operation_types,
            operation_types_display,
        } = projectStat;

        // FIXME: what if operation_types length has zero length
        if (operation_types?.length === 1) {
            return {
                id: operation_types[0],
                title: operation_types_display?.[0] ?? '?',
            };
        }

        return {
            id: OPERATION_TYPE_MULTI,
            title: strings.multipleTypesLegend,
        };
    }, [
        strings.multipleTypesLegend,
    ]);

    const {
        deployments_project_operation_type: operationTypeOptions,
    } = useGlobalEnums();

    const projectList = projectListFromProps;

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint| undefined>();

    const countries = useCountryRaw();

    const maxProjectCount = useMemo(() => (
        Math.max(
            ...(projectList?.map((d) => d.ongoing_projects ?? 0) ?? []),
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
                    total: item.ongoing_projects ?? undefined,
                    type: getPointType(item),
                }),
            )
        ),
        [projectList, getPointType],
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
            if (isNotDefined(clickedPointProperties)) {
                return undefined;
            }

            const clickedProjectItem = projectList?.find(
                (projectItem) => projectItem.id === clickedPointProperties.countryId,
            );

            if (isNotDefined(clickedProjectItem)) {
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

    const handleCountryClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                countryId: feature.properties?.country_id,
                lngLat,
            });
            return true;
        },
        [setClickedPointProperties],
    );

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                countryId: feature.properties?.countryId,
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
        <BaseMap
            baseLayers={(
                <MapLayer
                    layerKey="admin-0"
                    hoverable
                    layerOptions={adminFillLayerOptions}
                    onClick={handleCountryClick}
                />
            )}
        >
            <MapContainerWithDisclaimer
                className={_cs(styles.mapContainer, className)}
                title={strings.mapNSOngoingProjects}
                footer={operationTypeOptions && (
                    <div className={styles.legend}>
                        {operationTypeOptions.map((d) => (
                            <LegendItem
                                key={d.key}
                                label={d.value}
                                color={pointColorMap[d.key]}
                            />
                        ))}
                        <LegendItem
                            key={OPERATION_TYPE_MULTI}
                            label={strings.multipleTypesLegend}
                            color={pointColorMap[OPERATION_TYPE_MULTI]}
                        />
                    </div>
                )}
            />
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
                            to="countryOngoingActivitiesThreeWProjects"
                            urlParams={{
                                countryId: clickedPointProperties
                                    .countryId,
                            }}
                        >
                            {selectedNsProjectStats.name}
                        </Link>
                    )}
                >
                    <div className={styles.meta}>
                        <TextOutput
                            value={selectedNsProjectStats.ongoing_projects}
                            description={strings.ongoingProjectsMap}
                        />
                        <TextOutput
                            value={selectedNsProjectStats.target_total}
                            description={strings.mapTargetedPopulation}
                        />
                    </div>
                    <Container
                        heading={strings.mapTopProjectSectors}
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
        </BaseMap>
    );
}

export default GlobalThreeWMap;
