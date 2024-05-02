import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    LocationIcon,
    MailIcon,
} from '@ifrc-go/icons';
import {
    Container,
    LegendItem,
    List,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import type {
    CircleLayer,
    CirclePaint,
    FillLayer,
} from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import Link, { type Props as LinkProps } from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import {
    COLOR_BLUE,
    COLOR_DARK_GREY,
    COLOR_DARK_RED,
    COLOR_ORANGE,
    COLOR_PRIMARY_BLUE,
    COLOR_RED,
    COLOR_YELLOW,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import {
    TYPE_ADMINISTRATIVE,
    TYPE_EMERGENCY_RESPONSE,
    TYPE_HEALTHCARE,
    TYPE_HUMANITARIAN,
    TYPE_OTHER,
    TYPE_TRAINING,
} from '../common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetLocalUnitResponseType = GoApiResponse<'/api/v2/public-local-units/'>;

const circleColor: CirclePaint['circle-color'] = [
    'match',
    ['get', 'type'],
    TYPE_ADMINISTRATIVE,
    COLOR_RED,
    TYPE_HEALTHCARE,
    COLOR_ORANGE,
    TYPE_EMERGENCY_RESPONSE,
    COLOR_BLUE,
    TYPE_HUMANITARIAN,
    COLOR_YELLOW,
    TYPE_TRAINING,
    COLOR_PRIMARY_BLUE,
    TYPE_OTHER,
    COLOR_DARK_RED,
    COLOR_DARK_RED,
];
const basePointPaint: CirclePaint = {
    'circle-radius': 5,
    'circle-color': circleColor,
    'circle-opacity': 0.6,
    'circle-stroke-color': circleColor,
    'circle-stroke-width': 1,
    'circle-stroke-opacity': 1,
};

const basePointLayerOptions: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: basePointPaint,
};

const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface ClickedPoint {
    id: string;
    localUnitId: number;
    lngLat: mapboxgl.LngLatLike;
}

function emailKeySelector(email: string) {
    return email;
}

interface Props {
    localUnitListResponse?: GetLocalUnitResponseType;
}

function LocalUnitsMap(props: Props) {
    const { localUnitListResponse } = props;
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const strings = useTranslation(i18n);
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const legendOptions = useMemo(() => ([
        {
            value: TYPE_ADMINISTRATIVE,
            label: strings.localUnitLegendAdministrative,
            color: COLOR_RED,
        },
        {
            value: TYPE_HEALTHCARE,
            label: strings.localUnitLegendHealthCare,
            color: COLOR_ORANGE,
        },
        {
            value: TYPE_EMERGENCY_RESPONSE,
            label: strings.localUnitLegendEmergency,
            color: COLOR_BLUE,
        },
        {
            value: TYPE_HUMANITARIAN,
            label: strings.localUnitLegendHumanitarian,
            color: COLOR_YELLOW,
        },
        {
            value: TYPE_TRAINING,
            label: strings.localUnitLegendTraining,
            color: COLOR_PRIMARY_BLUE,
        },
        {
            value: TYPE_OTHER,
            label: strings.localUnitLegendOther,
            color: COLOR_DARK_RED,
        },
    ]), [
        strings.localUnitLegendAdministrative,
        strings.localUnitLegendHealthCare,
        strings.localUnitLegendEmergency,
        strings.localUnitLegendHumanitarian,
        strings.localUnitLegendTraining,
        strings.localUnitLegendOther,
    ]);

    const countryBounds = useMemo(() => (
        countryResponse ? getBbox(countryResponse.bbox) : undefined
    ), [countryResponse]);

    const {
        response: localUnitMapTooltipResponse,
    } = useRequest({
        skip: isNotDefined(clickedPointProperties?.localUnitId),
        url: '/api/v2/local-units/{id}/',
        pathVariables: {
            id: isDefined(clickedPointProperties) ? clickedPointProperties?.localUnitId : -1,
        },
    });

    const localUnitsGeoJson = useMemo((): GeoJSON.FeatureCollection<GeoJSON.Geometry> => ({
        type: 'FeatureCollection' as const,
        features: isDefined(localUnitListResponse)
            && isDefined(localUnitListResponse.results)
            ? localUnitListResponse?.results?.map((localUnit) => ({
                type: 'Feature' as const,
                geometry: localUnit.location_details as unknown as {
                    type: 'Point',
                    coordinates: [number, number],
                },
                properties: {
                    id: localUnit.local_branch_name,
                    localUnitId: localUnit.id,
                    type: localUnit.type,
                },
            })) : [],
    }), [localUnitListResponse]);

    const adminZeroHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            filter: isDefined(countryResponse) ? [
                '!in',
                'country_id',
                countryResponse.id,
            ] : undefined,
        }),
        [countryResponse],
    );

    const selectedLocalUnitDetail = useMemo(
        () => {
            const id = clickedPointProperties?.id;
            if (isNotDefined(id)) {
                return undefined;
            }

            const selectedLocalUnit = localUnitListResponse?.results?.find(
                (localUnit) => localUnit.local_branch_name === id,
            );

            if (isNotDefined(selectedLocalUnit)) {
                return undefined;
            }

            return selectedLocalUnit;
        },
        [clickedPointProperties, localUnitListResponse?.results],
    );

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                id: feature.properties?.id,
                localUnitId: feature.properties?.localUnitId,
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

    const emailRendererParams = useCallback(
        (_: string, email: string): LinkProps => ({
            className: styles.email,
            withUnderline: true,
            external: true,
            href: `mailto:${email}`,
            children: email,
        }),
        [],
    );

    return (
        <>
            <BaseMap
                baseLayers={(
                    <MapLayer
                        layerKey="admin-0-highlight"
                        layerOptions={adminZeroHighlightLayerOptions}
                    />
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                    footer={(
                        <div className={styles.footer}>
                            {strings.localUnitLegendTitle}
                            <div className={styles.legend}>
                                {legendOptions.map((legendItem) => (
                                    <LegendItem
                                        key={legendItem.value}
                                        className={styles.legendItem}
                                        color={legendItem.color}
                                        label={legendItem.label}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                />
                <MapSource
                    sourceKey="points"
                    sourceOptions={sourceOption}
                    geoJson={localUnitsGeoJson}
                >
                    <MapLayer
                        layerKey="point-circle"
                        layerOptions={basePointLayerOptions}
                        onClick={handlePointClick}
                    />
                </MapSource>
                <MapBounds
                    duration={DURATION_MAP_ZOOM}
                    padding={DEFAULT_MAP_PADDING}
                    bounds={countryBounds}
                />
                {clickedPointProperties?.lngLat && selectedLocalUnitDetail && (
                    <MapPopup
                        coordinates={clickedPointProperties.lngLat}
                        onCloseButtonClick={handlePointClose}
                        heading={(
                            <Link
                                className={styles.localUnitInfo}
                                href={localUnitMapTooltipResponse?.link}
                                external
                                withLinkIcon
                            >
                                {isTruthyString(localUnitMapTooltipResponse?.english_branch_name)
                                    ? localUnitMapTooltipResponse?.english_branch_name
                                    : localUnitMapTooltipResponse?.local_branch_name}
                            </Link>
                        )}
                        childrenContainerClassName={styles.popupContent}
                        contentViewType="vertical"
                    >
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailLastUpdate}
                            value={localUnitMapTooltipResponse?.modified_at}
                            strongLabel
                            valueType="date"
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailAddress}
                            strongLabel
                            value={localUnitMapTooltipResponse?.address_en
                                ?? localUnitMapTooltipResponse?.address_loc}
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailPhoneNumber}
                            strongLabel
                            value={localUnitMapTooltipResponse?.phone}
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailFocalPerson}
                            strongLabel
                            value={localUnitMapTooltipResponse?.focal_person_en
                                ?? localUnitMapTooltipResponse?.focal_person_loc}
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailEmail}
                            strongLabel
                            value={(
                                <Link
                                    href={`mailto:${localUnitMapTooltipResponse?.email}`}
                                    external
                                >
                                    {localUnitMapTooltipResponse?.email}
                                </Link>
                            )}
                        />
                    </MapPopup>
                )}
            </BaseMap>
            {isDefined(countryResponse)
                && (isDefined(countryResponse.address_1)
                        || (
                            isDefined(countryResponse.emails)
                            && countryResponse.emails.length > 0
                        ))
                    && (
                        <Container
                            className={styles.mapDetail}
                            childrenContainerClassName={styles.infoContainer}
                        >
                            {isDefined(countryResponse)
                                && isDefined(countryResponse.address_1)
                                && (
                                    <TextOutput
                                        className={styles.info}
                                        labelClassName={styles.label}
                                        label={(
                                            <LocationIcon className={styles.icon} />
                                        )}
                                        withoutLabelColon
                                        value={(
                                            <>
                                                <div>{countryResponse.address_1}</div>
                                                <div>{countryResponse.address_2}</div>
                                            </>
                                        )}
                                    />
                                )}
                            {isDefined(countryResponse)
                                && isDefined(countryResponse.emails)
                                && countryResponse.emails.length > 0
                                && (
                                    <TextOutput
                                        className={styles.info}
                                        labelClassName={styles.label}
                                        label={(
                                            <MailIcon className={styles.icon} />
                                        )}
                                        withoutLabelColon
                                        value={(
                                            <List
                                                data={countryResponse.emails.filter(isDefined)}
                                                renderer={Link}
                                                rendererParams={emailRendererParams}
                                                keySelector={emailKeySelector}
                                                withoutMessage
                                                compact
                                                pending={false}
                                                errored={false}
                                                filtered={false}
                                            />
                                        )}
                                    />
                                )}
                        </Container>
                    )}
        </>
    );
}

export default LocalUnitsMap;
