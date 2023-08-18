import {
    useState,
    useMemo,
    useCallback,
} from 'react';
import {
    _cs,
    isDefined,
    unique,
    listToGroupList,
} from '@togglecorp/fujs';
import {
    useOutletContext,
} from 'react-router-dom';
import Map, {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';

import MapPopup from '#components/MapPopup';
import TextOutput from '#components/TextOutput';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import LegendItem from '#components/LegendItem';
import { denormalizeList } from '#utils/common';
import type { GoApiResponse } from '#utils/restRequest';
import type { CountryOutletContext } from '#utils/outletContext';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useTranslation from '#hooks/useTranslation';

import {
    defaultMapStyle,
    defaultMapOptions,
    getPointCirclePaint,
    getPointCircleHaloPaint,
    pointColorMap,
} from '#utils/map';
import {
    COLOR_RED,
    COLOR_BLUE,
    COLOR_ORANGE,
    OPERATION_TYPE_EMERGENCY,
    OPERATION_TYPE_MULTI,
    OPERATION_TYPE_PROGRAMME,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type District = NonNullable<GoApiResponse<'/api/v2/district/'>['results']>[number];
type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

const redPointCirclePaint = getPointCirclePaint(COLOR_RED);
const bluePointCirclePaint = getPointCirclePaint(COLOR_BLUE);
const orangePointCirclePaint = getPointCirclePaint(COLOR_ORANGE);
const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface GeoJsonProps {
    districtId: number;
    numProjects: number;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, GeoJsonProps>;
    lngLat: mapboxgl.LngLatLike;
}

type ProjectGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, GeoJsonProps>;

function getOperationType(projectList: Project[]) {
    const operationTypeList = unique(
        projectList
            .filter((d) => isDefined(d.operation_type))
            .map((d) => ({
                // FIXME: typings should be fixed in the server
                id: d.operation_type as number,
                title: d.operation_type_display,
            })),
        (d) => d.id,
    ) ?? [];

    if (operationTypeList.length === 0) {
        return undefined;
    }

    if (operationTypeList.length === 1) {
        return operationTypeList[0];
    }

    return {
        id: OPERATION_TYPE_MULTI,
        title: 'Multiple types',
    };
}

function getGeoJson(
    districtList: District[],
    districtDenormalizedProjectList: (Project & {
        project_district_detail: Pick<
            District,
            'code'
            | 'id'
            | 'is_deprecated'
            | 'is_enclave'
            | 'name'
        >;
    })[],
    requiredOperationTypeId: number,
): ProjectGeoJson {
    return {
        type: 'FeatureCollection' as const,
        features: districtList.map((district) => {
            const projects = districtDenormalizedProjectList
                .filter((project) => project.project_district_detail.id === district.id);

            if (projects.length === 0) {
                return undefined;
            }

            const operationType = getOperationType(projects);

            if (operationType?.id !== requiredOperationTypeId) {
                return undefined;
            }

            return {
                id: district.id,
                type: 'Feature' as const,
                properties: {
                    districtId: district.id,
                    numProjects: projects.length,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: district.centroid?.coordinates as [number, number] ?? [0, 0],
                },
            };
        }).filter(isDefined),
    };
}

interface Props {
    className?: string;
    projectList: Project[];
    districtList: District[];
}

function CountryThreeWMap(props: Props) {
    const {
        className,
        projectList,
        districtList,
    } = props;

    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const {
        deployments_project_operation_type: operationTypeOptions,
    } = useGlobalEnums();

    const countryBounds = useMemo(() => (
        countryResponse ? getBbox(countryResponse.bbox) : undefined
    ), [countryResponse]);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const [
        districtDenormalizedProjectList,
    ] = useMemo(() => ([
        denormalizeList(
            projectList ?? [],
            (project) => project.project_districts_detail,
            (project, district) => ({
                ...project,
                project_district_detail: district,
            }),
        ),
    ]), [projectList]);

    const districtGroupedProjects = listToGroupList(
        districtDenormalizedProjectList,
        (d) => d.project_district_detail.id,
    );

    const selectedDistrictProjectDetail = useMemo(
        () => {
            if (!clickedPointProperties?.feature?.id) {
                return undefined;
            }

            // eslint-disable-next-line max-len
            const selectedDistrictProjectList = districtGroupedProjects[clickedPointProperties.feature.id];

            if (!selectedDistrictProjectList) {
                return undefined;
            }

            return selectedDistrictProjectList;
        },
        [clickedPointProperties, districtGroupedProjects],
    );

    const [
        programmesGeo,
        emergencyGeo,
        multiTypeGeo,
    ] = useMemo(
        () => (districtList ? [
            getGeoJson(districtList, districtDenormalizedProjectList, OPERATION_TYPE_PROGRAMME),
            getGeoJson(districtList, districtDenormalizedProjectList, OPERATION_TYPE_EMERGENCY),
            getGeoJson(districtList, districtDenormalizedProjectList, OPERATION_TYPE_MULTI),
        ] : []),
        [districtList, districtDenormalizedProjectList],
    );

    const maxScaleValue = projectList?.length ?? 0;

    const [
        redPointHaloCirclePaint,
        bluePointHaloCirclePaint,
        orangePointHaloCirclePaint,
    ] = useMemo(
        () => ([
            getPointCircleHaloPaint(COLOR_RED, 'numProjects', maxScaleValue),
            getPointCircleHaloPaint(COLOR_BLUE, 'numProjects', maxScaleValue),
            getPointCircleHaloPaint(COLOR_ORANGE, 'numProjects', maxScaleValue),
        ]),
        [maxScaleValue],
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
            scaleControlShown
            mapStyle={defaultMapStyle}
            mapOptions={defaultMapOptions}
            navControlShown
            navControlPosition="top-right"
            debug={false}
        >
            <MapContainerWithDisclaimer
                className={_cs(styles.mapContainer, className)}
            />
            {operationTypeOptions && (
                <div className={styles.legend}>
                    {operationTypeOptions.map((d) => (
                        <LegendItem
                            key={d.key}
                            label={d.value}
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
            <MapBounds
                // FIXME: use defined constants
                duration={1000}
                padding={10}
                bounds={countryBounds}
            />
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
            {clickedPointProperties?.lngLat && selectedDistrictProjectDetail && (
                <MapPopup
                    coordinates={clickedPointProperties.lngLat}
                    onCloseButtonClick={handlePointClose}
                    heading={(
                        selectedDistrictProjectDetail[0].project_district_detail.name
                    )}
                >
                    <div>
                        {selectedDistrictProjectDetail.map((project) => (
                            <div
                                className={styles.projectDetailItem}
                                key={project.id}
                            >
                                <TextOutput
                                    label={project.reporting_ns_detail.name}
                                    value={project.name}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.threeWMapLastUpdate}
                                    value={project.modified_at}
                                    valueType="date"
                                />
                                <TextOutput
                                    label={strings.threeWMapStatus}
                                    value={project.status_display}
                                />
                                <TextOutput
                                    label={strings.threeWMapProgrammeType}
                                    value={project.programme_type_display}
                                />
                                <TextOutput
                                    label={strings.threeWMapBudget}
                                    value={project.budget_amount}
                                    valueType="number"
                                />
                            </div>
                        ))}
                    </div>
                </MapPopup>
            )}
        </Map>
    );
}

export default CountryThreeWMap;
