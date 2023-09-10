import {
    useState,
    useMemo,
    useCallback,
} from 'react';
import {
    _cs,
    isDefined,
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

import Link from '#components/Link';
import List from '#components/List';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import TextOutput from '#components/TextOutput';
import useCountryRaw, { Country } from '#hooks/domain/useCountryRaw';
import useTranslation from '#hooks/useTranslation';
import { numericIdSelector } from '#utils/selectors';
import { resolveToString } from '#utils/translation';
import { type GoApiResponse } from '#utils/restRequest';
import { type RegionOutletContext } from '#utils/outletContext';
import {
    defaultMapStyle,
    defaultMapOptions,
    getPointCirclePaint,
    getPointCircleHaloPaint,
} from '#utils/map';
import {
    COLOR_RED,
    DURATION_MAP_ZOOM,
    DEFAULT_MAP_PADDING,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type MovementActivityResponse = GoApiResponse<'/api/v2/region-project/{id}/movement-activities/'>;
type MovementActivityByCountry = NonNullable<MovementActivityResponse>['countries_count'][number];
type ReportingNationalSociety = NonNullable<MovementActivityResponse>['country_ns_sector_count'][number]['reporting_national_societies'][number];

const redPointCirclePaint = getPointCirclePaint(COLOR_RED);
const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, MovementActivityByCountry>;
    lngLat: mapboxgl.LngLatLike;
}

type ProjectGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, MovementActivityByCountry>;

function getGeoJson(
    actvities?: MovementActivityByCountry[],
    countries?: Country[],
): ProjectGeoJson {
    if (isNotDefined(actvities)) {
        return {
            type: 'FeatureCollection' as const,
            features: [],
        };
    }

    return {
        type: 'FeatureCollection' as const,
        features: actvities?.map((activity) => ({
            type: 'Feature' as const,
            id: activity.id,
            geometry: countries?.find(
                (country) => country.id === activity.id,
            )?.centroid as {
                type: 'Point',
                coordinates: [number, number],
            },
            properties: activity,
        })),
    };
}

interface Props {
    className?: string;
    regionId?: string;
    movementActivitiesResponse: MovementActivityResponse | null | undefined;
    sidebarContent?: React.ReactNode;
}

function MovementActivitiesMap(props: Props) {
    const {
        className,
        regionId,
        movementActivitiesResponse,
        sidebarContent,
    } = props;

    const countries = useCountryRaw({ region: Number(regionId) });
    const strings = useTranslation(i18n);
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const countryBounds = useMemo(() => (
        regionResponse ? getBbox(regionResponse.bbox) : undefined
    ), [regionResponse]);

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const maxScaleValue = useMemo(() => (
        Math.max(
            ...(movementActivitiesResponse?.countries_count
                .map((activity) => activity.projects_count)
                .filter(isDefined) ?? []),
        )), [movementActivitiesResponse?.countries_count]);

    const activitiesGeoJson = useMemo(() => (
        getGeoJson(movementActivitiesResponse?.countries_count, countries)
    ), [movementActivitiesResponse?.countries_count, countries]);

    const selectedCountry = useMemo(() => (
        movementActivitiesResponse
            ?.countries_count.find(
                (country) => country.id === clickedPointProperties?.feature.properties.id,
            )
    ), [movementActivitiesResponse, clickedPointProperties?.feature.properties.id]);

    const activeNSinSelectedCountry = useMemo(() => movementActivitiesResponse
        ?.country_ns_sector_count.find(
            (country) => country.id === clickedPointProperties?.feature.properties.id,
        ), [movementActivitiesResponse, clickedPointProperties?.feature.properties.id]);

    const {
        redPointHaloCirclePaint,
    } = useMemo(
        () => ({
            redPointHaloCirclePaint: getPointCircleHaloPaint(COLOR_RED, 'projects_count', maxScaleValue),
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

    const nationalSocietyRendererParams = useCallback((
        _: number,
        val: ReportingNationalSociety,
    ) => ({
        className: styles.nationalSociety,
        labelClassName: styles.label,
        label: val.name,
        strongLabel: true,
        withoutLabelColon: true,
        value: val.sectors.map((sector) => (
            <TextOutput
                key={sector.id}
                label={sector.sector}
                value={sector.count}
                strongValue
                withoutLabelColon
            />
        )),
    }), []);

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
                    {activitiesGeoJson && (
                        <MapSource
                            sourceKey="movement-activity-points"
                            sourceOptions={sourceOption}
                            geoJson={activitiesGeoJson}
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
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        padding={DEFAULT_MAP_PADDING}
                        bounds={countryBounds}
                    />
                    {/* eslint-disable-next-line max-len */}
                    {clickedPointProperties?.lngLat && isDefined(clickedPointProperties.feature.id) && (
                        <MapPopup
                            className={styles.mapPopup}
                            coordinates={clickedPointProperties.lngLat}
                            onCloseButtonClick={handlePointClose}
                            heading={(
                                <Link
                                    to="countriesLayout"
                                    urlParams={{ countryId: clickedPointProperties.feature.id }}
                                    withUnderline
                                    withForwardIcon
                                >
                                    {clickedPointProperties.feature.properties.name}
                                </Link>
                            )}
                            childrenContainerClassName={styles.mapPopupContent}
                            withHeaderBorder
                        >
                            <div className={styles.projects}>
                                <span>
                                    {resolveToString(
                                        strings.plannedProjects,
                                        { count: selectedCountry?.planned_projects_count ?? '-' },
                                    )}
                                </span>
                                <span>
                                    {resolveToString(
                                        strings.ongoingProjects,
                                        { count: selectedCountry?.ongoing_projects_count ?? '-' },
                                    )}
                                </span>
                                <span>
                                    {resolveToString(
                                        strings.completedProjects,
                                        { count: selectedCountry?.completed_projects_count ?? '-' },
                                    )}
                                </span>
                            </div>
                            <div>
                                {resolveToString(
                                    strings.activeNsCount,
                                    { count: activeNSinSelectedCountry?.reporting_national_societies.length ?? '-' },
                                )}
                            </div>
                            <div>
                                <List
                                    className={styles.nationalSocietyList}
                                    data={activeNSinSelectedCountry
                                        ?.reporting_national_societies}
                                    renderer={TextOutput}
                                    rendererParams={nationalSocietyRendererParams}
                                    keySelector={numericIdSelector}
                                    withoutMessage
                                    compact
                                    pending={false}
                                    errored={false}
                                    filtered={false}
                                />
                            </div>
                        </MapPopup>
                    )}
                </Map>
            </div>
            {
                sidebarContent && (
                    <div className={styles.sidebar}>
                        {sidebarContent}
                    </div>
                )
            }
        </div>
    );
}

export default MovementActivitiesMap;
