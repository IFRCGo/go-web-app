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
    isNotDefined,
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
import { type GoApiResponse } from '#utils/restRequest';
import { type CountryOutletContext } from '#utils/outletContext';
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
    DURATION_MAP_ZOOM,
    DEFAULT_MAP_PADDING,
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
            .map((d) => {
                if (isNotDefined(d.operation_type)) {
                    return undefined;
                }
                return {
                    id: d.operation_type,
                };
            })
            .filter(isDefined),
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
    };
}

function getGeoJson(
    districtList: District[],
    districtDenormalizedProjectList: (Project & {
        project_district_detail: Pick<
            District,
            | 'id'
            | 'name'
        >;
    })[],
    requiredOperationTypeId: number,
): ProjectGeoJson {
    return {
        type: 'FeatureCollection' as const,
        features: districtList.map((district) => {
            if (isNotDefined(district.centroid)) {
                return undefined;
            }
            const projects = districtDenormalizedProjectList
                .filter((project) => project.project_district_detail.id === district.id);
            if (projects.length === 0) {
                return undefined;
            }
            const operationType = getOperationType(projects);
            if (isNotDefined(operationType) || operationType.id !== requiredOperationTypeId) {
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
                    coordinates: district.centroid.coordinates as [number, number],
                },
            };
        }).filter(isDefined),
    };
}

interface Props {
    className?: string;
    projectList: Project[];
    districtList: District[];
    sidebarContent?: React.ReactNode;
}

function CountryThreeWMap(props: Props) {
    const {
        className,
        projectList,
        districtList,
        sidebarContent,
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

    const {
        districtDenormalizedProjectList,
    } = useMemo(() => ({
        districtDenormalizedProjectList: denormalizeList(
            projectList ?? [],
            (project) => project.project_districts_detail,
            (project, district) => ({
                ...project,
                project_district_detail: district,
            }),
        ),
    }), [projectList]);

    const districtGroupedProjects = listToGroupList(
        districtDenormalizedProjectList,
        (d) => d.project_district_detail.id,
    );

    const selectedDistrictProjectDetail = useMemo(
        () => {
            const id = clickedPointProperties?.feature?.id;
            if (isNotDefined(id)) {
                return undefined;
            }

            // eslint-disable-next-line max-len
            const selectedDistrictProjectList = districtGroupedProjects[id];

            if (isNotDefined(selectedDistrictProjectList)) {
                return undefined;
            }

            return selectedDistrictProjectList;
        },
        [clickedPointProperties, districtGroupedProjects],
    );

    const {
        programmesGeo,
        emergencyGeo,
        multiTypeGeo,
    } = useMemo(
        () => (districtList ? {
            programmesGeo: getGeoJson(
                districtList,
                districtDenormalizedProjectList,
                OPERATION_TYPE_PROGRAMME,
            ),
            emergencyGeo: getGeoJson(
                districtList,
                districtDenormalizedProjectList,
                OPERATION_TYPE_EMERGENCY,
            ),
            multiTypeGeo: getGeoJson(
                districtList,
                districtDenormalizedProjectList,
                OPERATION_TYPE_MULTI,
            ),
        } : {}),
        [districtList, districtDenormalizedProjectList],
    );

    const maxScaleValue = projectList?.length ?? 0;

    const {
        redPointHaloCirclePaint,
        bluePointHaloCirclePaint,
        orangePointHaloCirclePaint,
    } = useMemo(
        () => ({
            redPointHaloCirclePaint: getPointCircleHaloPaint(COLOR_RED, 'numProjects', maxScaleValue),
            bluePointHaloCirclePaint: getPointCircleHaloPaint(COLOR_BLUE, 'numProjects', maxScaleValue),
            orangePointHaloCirclePaint: getPointCircleHaloPaint(COLOR_ORANGE, 'numProjects', maxScaleValue),
        }),
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
        <div className={_cs(styles.map, className)}>
            <div className={styles.mapWithLegend}>
                <Map
                    scaleControlShown
                    mapStyle={defaultMapStyle}
                    mapOptions={defaultMapOptions}
                    navControlShown
                    navControlPosition="top-right"
                    debug={false}
                >
                    <MapContainerWithDisclaimer className={styles.mapContainer} />
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
                        duration={DURATION_MAP_ZOOM}
                        padding={DEFAULT_MAP_PADDING}
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
                            // NOTE: selectedDistrictProjectDetail will always have an element
                            heading={(
                                selectedDistrictProjectDetail[0].project_district_detail.name
                            )}
                        >
                            {/* FIXME: use List */}
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
                        </MapPopup>
                    )}
                </Map>
                {operationTypeOptions && operationTypeOptions.length > 0 && (
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
            </div>
            {sidebarContent && (
                <div className={styles.sidebar}>
                    {sidebarContent}
                </div>
            )}
        </div>
    );
}

export default CountryThreeWMap;
