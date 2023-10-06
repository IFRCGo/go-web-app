import {
    useState,
    useMemo,
    useCallback,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';

import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import Link from '#components/Link';
import RawList from '#components/RawList';
import MapPopup from '#components/MapPopup';
import TextOutput, { Props as TextOutputProps } from '#components/TextOutput';
import useCountryRaw, { Country } from '#hooks/domain/useCountryRaw';
import useTranslation from '#hooks/useTranslation';
import { numericIdSelector } from '#utils/selectors';
import { type GoApiResponse } from '#utils/restRequest';
import { type RegionOutletContext } from '#utils/outletContext';
import {
    getPointCirclePaint,
    getPointCircleHaloPaint,
    adminFillLayerOptions,
} from '#utils/map';
import {
    COLOR_RED,
    DURATION_MAP_ZOOM,
    DEFAULT_MAP_PADDING,
} from '#utils/constants';
import BaseMap from '#components/domain/BaseMap';

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
    countryId: number;
    countryName: string;
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

    const countriesCount = useMemo(() => (
        movementActivitiesResponse?.countries_count
            .filter((country) => country.projects_count > 0)
    ), [movementActivitiesResponse?.countries_count]);

    const maxScaleValue = useMemo(() => (
        Math.max(
            ...(countriesCount
                ?.map((activity) => activity.projects_count)
                .filter(isDefined) ?? []),
        )), [countriesCount]);

    const activitiesGeoJson = useMemo(() => (
        getGeoJson(countriesCount, countries)
    ), [countriesCount, countries]);

    const selectedCountry = useMemo(() => (
        movementActivitiesResponse
            ?.countries_count.find(
                (country) => country.id === clickedPointProperties?.countryId,
            )
    ), [movementActivitiesResponse, clickedPointProperties?.countryId]);

    const activeNSinSelectedCountry = useMemo(() => movementActivitiesResponse
        ?.country_ns_sector_count.find(
            (country) => country.id === clickedPointProperties?.countryId,
        ), [movementActivitiesResponse, clickedPointProperties?.countryId]);

    const { redPointHaloCirclePaint } = useMemo(
        () => ({
            redPointHaloCirclePaint: getPointCircleHaloPaint(COLOR_RED, 'projects_count', maxScaleValue),
        }),
        [maxScaleValue],
    );

    const handleCountryClick = useCallback((
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            countryId: feature.properties?.country_id,
            countryName: feature.properties?.name,
            lngLat,
        });
        return false;
    }, [setClickedPointProperties]);

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                countryId: feature.properties?.id,
                countryName: feature.properties?.name,
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

    const nationalSocietyRendererParams = useCallback(
        (_: number, val: ReportingNationalSociety): TextOutputProps => ({
            className: styles.mainTextOutput,
            labelClassName: styles.mainLabel,
            strongLabel: true,
            valueClassName: styles.mainValue,
            withoutLabelColon: true,
            label: val.name,
            // FIXME a separate component should be created
            value: val.sectors.map((sector) => (
                <TextOutput
                    className={styles.sectorTextOutput}
                    valueClassName={styles.sectorValue}
                    key={sector.id}
                    label={sector.sector}
                    value={sector.count}
                    strongValue
                    withoutLabelColon
                />
            )),
        }),
        [],
    );

    return (
        <div className={_cs(styles.map, className)}>
            <div className={styles.mapWithLegend}>
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
                    {clickedPointProperties?.lngLat && isDefined(clickedPointProperties.countryId) && (
                        <MapPopup
                            className={styles.mapPopup}
                            coordinates={clickedPointProperties.lngLat}
                            onCloseButtonClick={handlePointClose}
                            headingLevel={5}
                            heading={(
                                <Link
                                    to="countriesLayout"
                                    urlParams={{ countryId: clickedPointProperties.countryId }}
                                    withUnderline
                                >
                                    {clickedPointProperties.countryName}
                                </Link>
                            )}
                            childrenContainerClassName={styles.mapPopupContent}
                            withHeaderBorder
                            headerDescriptionContainerClassName={styles.stats}
                            headerDescription={(
                                <>
                                    <TextOutput
                                        label={strings.plannedProjects}
                                        labelClassName={styles.label}
                                        value={selectedCountry?.planned_projects_count}
                                        strongValue
                                        withoutLabelColon
                                    />
                                    <TextOutput
                                        label={strings.ongoingProjects}
                                        labelClassName={styles.label}
                                        value={selectedCountry?.ongoing_projects_count}
                                        strongValue
                                        withoutLabelColon
                                    />
                                    <TextOutput
                                        label={strings.completedProjects}
                                        labelClassName={styles.label}
                                        value={selectedCountry?.completed_projects_count}
                                        strongValue
                                        withoutLabelColon
                                    />
                                    <TextOutput
                                        label={strings.activeNsCount}
                                        labelClassName={styles.label}
                                        value={activeNSinSelectedCountry
                                            ?.reporting_national_societies.length}
                                        strongValue
                                        withoutLabelColon
                                    />
                                </>
                            )}
                            contentViewType="vertical"
                        >
                            <div className={styles.nationalSocietyList}>
                                <RawList
                                    data={activeNSinSelectedCountry
                                        ?.reporting_national_societies}
                                    renderer={TextOutput}
                                    rendererParams={nationalSocietyRendererParams}
                                    keySelector={numericIdSelector}
                                />
                            </div>
                        </MapPopup>
                    )}
                </BaseMap>
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
