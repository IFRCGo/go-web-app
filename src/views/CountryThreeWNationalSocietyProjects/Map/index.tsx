import {
    useState,
    useMemo,
    useCallback,
} from 'react';
import {
    _cs,
    isDefined,
    listToGroupList,
    mapToList,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';
import Map, {
    MapSource,
    MapLayer,
    MapImage,
} from '@togglecorp/re-map';
import {
    LineLayout,
    LinePaint,
    SymbolLayout,
    SymbolPaint,
} from 'mapbox-gl';

import LegendItem from '#components/LegendItem';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useCountryRaw, { Country } from '#hooks/domain/useCountryRaw';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import {
    defaultMapStyle,
    defaultMapOptions,
    getPointCirclePaint,
    getPointCircleHaloPaint,
} from '#utils/map';
import {
    COLOR_RED,
    COLOR_BLUE,
    COLOR_BLACK,
} from '#utils/constants';

import useCountry from '#hooks/domain/useCountry';
import Message from '#components/Message';
import Link from '#components/Link';

// FIXME: we should move this image to assets
import image from './arrow.png';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

const arrowImageOptions = {
    sdf: true,
};

const linePaint: LinePaint = {
    'line-color': COLOR_BLACK,
    'line-opacity': 0.4,
    'line-width': 1,
};
const lineLayout: LineLayout = {
    visibility: 'visible',
    'line-join': 'round',
    'line-cap': 'round',
};
const hiddenLayout: LineLayout = {
    visibility: 'none',
};

const arrowPaint: SymbolPaint = {
    'icon-color': COLOR_BLACK,
    'icon-opacity': 0.6,
};
const arrowLayout: SymbolLayout = {
    visibility: 'visible',
    'icon-image': 'equilateral-arrow-icon',
    'icon-size': 0.4,
    'symbol-placement': 'line-center',
    'icon-rotate': 90,
    'icon-rotation-alignment': 'map',
    'icon-ignore-placement': true,
};

const redPointCirclePaint = getPointCirclePaint(COLOR_RED);
const bluePointCirclePaint = getPointCirclePaint(COLOR_BLUE);
const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface GeoJsonProps {
    countryName: string | null | undefined;
    countryId: number;
    numProjects: number;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, GeoJsonProps>;
    lngLat: mapboxgl.LngLatLike;
}

type ProjectGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, GeoJsonProps>;
type ProjectLineGeoJson = GeoJSON.FeatureCollection<GeoJSON.LineString, {
    projectCountry: number;
    reportingNS: number;
}>;

function generateProjectsLineGeoJson(
    countries: Country[],
    projectList: Project[],
): ProjectLineGeoJson {
    const relationsMap = listToMap(
        projectList,
        (project) => `${project.project_country}-${project.reporting_ns}`,
        (project) => ({
            id: `${project.project_country}-${project.reporting_ns}`,
            projectCountry: project.project_country,
            reportingNS: project.reporting_ns,
        }),
    );

    const countriesMap = listToMap(
        countries,
        (country) => country.id,
        (country) => country,
    );

    const relationsList = mapToList(relationsMap);

    return {
        type: 'FeatureCollection' as const,
        features: relationsList.map((relation) => {
            const from = countriesMap[relation.reportingNS]
                ?.centroid.coordinates as [number, number] | undefined;
            const to = countriesMap[relation.projectCountry]
                ?.centroid.coordinates as [number, number] | undefined;
            if (isNotDefined(from) || isNotDefined(to)) {
                return undefined;
            }
            return {
                id: relation.id,
                type: 'Feature' as const,
                geometry: {
                    type: 'LineString' as const,
                    coordinates: [
                        from,
                        to,
                    ],
                },
                properties: {
                    projectCountry: relation.projectCountry,
                    reportingNS: relation.reportingNS,
                },
            };
        }).filter(isDefined),
    };
}

function generateProjectGeoJson(
    countries: Country[],
    projectList: Project[],
    keySelector: (item: Project) => number,
): ProjectGeoJson {
    const groupedProjects = listToGroupList(projectList, keySelector);

    return {
        type: 'FeatureCollection' as const,
        features: countries.map((country) => {
            const { centroid } = country;
            if (isNotDefined(centroid)) {
                return undefined;
            }

            const countryProjects = groupedProjects?.[country.id];
            if (isNotDefined(countryProjects)) {
                return undefined;
            }

            return {
                id: country.id,
                type: 'Feature' as const,
                properties: {
                    countryName: country.name,
                    countryId: country.id,
                    numProjects: countryProjects.length,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: centroid.coordinates as [number, number],
                },
            };
        }).filter(isDefined),
    };
}

interface Props {
    className?: string;
    projectList: Project[];
    sidebarContent?: React.ReactNode;
}
function CountryThreeWNationalSocietyProjectsMap(props: Props) {
    const {
        className,
        projectList,
        sidebarContent,
    } = props;

    const strings = useTranslation(i18n);
    const countries = useCountryRaw();
    const [iconReady, setIconReady] = useState(false);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const clickedPointCountry = useCountry({
        id: Number(clickedPointProperties?.feature?.id ?? -1),
    });

    const iso3 = clickedPointCountry?.iso3;

    const {
        response: clickedPointProjectsResponse,
        pending: clickedPointProjectsResponsePending,
    } = useRequest({
        skip: isNotDefined(clickedPointCountry?.iso3),
        url: '/api/v2/project/',
        query: {
            country_iso3: isTruthyString(iso3)
                ? [iso3]
                : undefined,
        },
    });

    const {
        receivingCountryProjectGeoJson,
        reportingNSProjectGeoJson,
        projectsLineGeoJson,
    } = useMemo(
        () => ({
            receivingCountryProjectGeoJson: generateProjectGeoJson(
                countries ?? [],
                projectList,
                (project) => project.project_country,
            ),
            reportingNSProjectGeoJson: generateProjectGeoJson(
                countries ?? [],
                projectList,
                (project) => project.reporting_ns,
            ),
            projectsLineGeoJson: generateProjectsLineGeoJson(
                countries ?? [],
                projectList,
            ),
        }),
        [countries, projectList],
    );

    const maxScaleValue = projectList?.length ?? 0;

    const {
        redPointHaloCirclePaint,
        bluePointHaloCirclePaint,
    } = useMemo(
        () => ({
            redPointHaloCirclePaint: getPointCircleHaloPaint(COLOR_RED, 'numProjects', maxScaleValue),
            bluePointHaloCirclePaint: getPointCircleHaloPaint(COLOR_BLUE, 'numProjects', maxScaleValue),
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

    const handleIconLoad = useCallback(() => {
        setIconReady(true);
    }, []);

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
                    {/* FIXME: Add bounds */}
                    <MapContainerWithDisclaimer className={styles.mapContainer} />
                    {receivingCountryProjectGeoJson && (
                        <MapSource
                            sourceKey="receiving-points"
                            sourceOptions={sourceOption}
                            geoJson={receivingCountryProjectGeoJson}
                        >
                            <MapLayer
                                layerKey="reporting-points-halo-circle"
                                onClick={handlePointClick}
                                layerOptions={{
                                    type: 'circle',
                                    paint: redPointHaloCirclePaint,
                                }}
                            />
                            <MapLayer
                                layerKey="receiving-points-circle"
                                onClick={handlePointClick}
                                layerOptions={{
                                    type: 'circle',
                                    paint: redPointCirclePaint,
                                }}
                            />
                        </MapSource>
                    )}
                    {reportingNSProjectGeoJson && (
                        <MapSource
                            sourceKey="reporting-points"
                            sourceOptions={sourceOption}
                            geoJson={reportingNSProjectGeoJson}
                        >
                            <MapLayer
                                layerKey="reporting-points-halo-circle"
                                onClick={handlePointClick}
                                layerOptions={{
                                    type: 'circle',
                                    paint: bluePointHaloCirclePaint,
                                }}
                            />
                            <MapLayer
                                layerKey="reporting-points-circle"
                                onClick={handlePointClick}
                                layerOptions={{
                                    type: 'circle',
                                    paint: bluePointCirclePaint,
                                }}
                            />
                        </MapSource>
                    )}
                    <MapImage
                        name="equilateral-arrow-icon"
                        url={image}
                        imageOptions={arrowImageOptions}
                        onLoad={handleIconLoad}
                    />
                    {projectsLineGeoJson && (
                        <MapSource
                            sourceKey="lines"
                            sourceOptions={sourceOption}
                            geoJson={projectsLineGeoJson}
                        >
                            <MapLayer
                                layerKey="points-line"
                                layerOptions={{
                                    type: 'line',
                                    layout: lineLayout,
                                    paint: linePaint,
                                }}
                            />
                            <MapLayer
                                layerKey="arrow-icon"
                                layerOptions={{
                                    type: 'symbol',
                                    paint: arrowPaint,
                                    layout: iconReady ? arrowLayout : hiddenLayout,
                                }}
                            />
                        </MapSource>
                    )}
                    {/* eslint-disable-next-line max-len */}
                    {clickedPointProperties?.lngLat && isDefined(clickedPointProperties.feature.id) && (
                        <MapPopup
                            coordinates={clickedPointProperties.lngLat}
                            onCloseButtonClick={handlePointClose}
                            heading={clickedPointProperties.feature.properties.countryName}
                            childrenContainerClassName={styles.mapPopupContent}
                        >
                            {(clickedPointProjectsResponsePending
                                || clickedPointProjectsResponse?.count === 0) && (
                                <Message
                                    pending={clickedPointProjectsResponsePending}
                                    description={!clickedPointProjectsResponsePending && 'Data not available!'}
                                    compact
                                />
                            )}
                            {clickedPointProjectsResponse?.results?.map(
                                (project) => (
                                    <Link
                                        className={styles.project}
                                        key={project.id}
                                        to="threeWProjectDetail"
                                        urlParams={{ projectId: project.id }}
                                        withLinkIcon
                                    >
                                        {project.name}
                                    </Link>
                                ),
                            )}
                        </MapPopup>
                    )}
                </Map>
                <div className={styles.legend}>
                    <LegendItem
                        color={COLOR_BLUE}
                        label={strings.reportingNationalSociety}
                    />
                    <LegendItem
                        color={COLOR_RED}
                        label={strings.receivingCountry}
                    />
                </div>
            </div>
            {sidebarContent && (
                <div className={styles.sidebar}>
                    {sidebarContent}
                </div>
            )}
        </div>
    );
}

export default CountryThreeWNationalSocietyProjectsMap;
