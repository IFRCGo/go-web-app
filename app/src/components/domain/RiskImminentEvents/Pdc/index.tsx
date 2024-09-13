import {
    useCallback,
    useState,
} from 'react';
import {
    formatDate,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';

import RiskImminentEventMap, { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import {
    ClickedPoint,
    CYCLONE_BLUE_ALERT_LEVEL,
    CYCLONE_GREEN_ALERT_LEVEL,
    CYCLONE_ORANGE_ALERT_LEVEL,
    CYCLONE_RED_ALERT_LEVEL,
    defaultLayersValue,
    EventGeoJsonProperties,
    isValidFeature,
    isValidPointFeature,
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LAYER_CYCLONE_TRACKS,
    LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS,
    LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS,
    LayerType,
} from '#utils/domain/risk';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type AlertType = 'WARNING' | 'WATCH' | 'ADVISORY' | 'INFORMATION';

const WARNING_ALERT_TYPE = 'WARNING' satisfies AlertType;
const WATCH_ALERT_TYPE = 'WATCH' satisfies AlertType;
const ADVISORY_ALERT_TYPE = 'ADVISORY' satisfies AlertType;
const INFORMATION_ALERT_TYPE = 'INFORMATION' satisfies AlertType;

function getAlertType(alertType: AlertType) {
    if (alertType === WARNING_ALERT_TYPE) {
        return CYCLONE_RED_ALERT_LEVEL;
    }
    if (alertType === WATCH_ALERT_TYPE) {
        return CYCLONE_ORANGE_ALERT_LEVEL;
    }
    if (alertType === ADVISORY_ALERT_TYPE) {
        return CYCLONE_GREEN_ALERT_LEVEL;
    }
    if (alertType === INFORMATION_ALERT_TYPE) {
        return CYCLONE_BLUE_ALERT_LEVEL;
    }
    return undefined;
}

type ImminentEventResponse = RiskApiResponse<'/api/v1/pdc/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type BaseProps = {
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

type Props = BaseProps & ({
    variant: 'global';
} | {
    variant: 'region';
    regionId: number;
} | {
    variant: 'country';
    iso3: string;
})

function Pdc(props: Props) {
    const {
        title,
        bbox,
        variant,
    } = props;

    const [
        activeLayersMapping,
        setActiveLayersMapping,
    ] = useState<Record<number, boolean>>(defaultLayersValue);

    const [layers, setLayers] = useState<Record<number, boolean>>(defaultLayersValue);
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const {
        pending: pendingCountryRiskResponse,
        response: countryRiskResponse,
    } = useRiskRequest({
        apiType: 'risk',
        // eslint-disable-next-line react/destructuring-assignment
        skip: (variant === 'region' && isNotDefined(props.regionId))
        // eslint-disable-next-line react/destructuring-assignment
            || (variant === 'country' && isNotDefined(props.iso3)),
        url: '/api/v1/pdc/',
        query: {
            limit: 9999,
            // eslint-disable-next-line react/destructuring-assignment
            iso3: variant === 'country' ? props.iso3 : undefined,
            // eslint-disable-next-line react/destructuring-assignment
            region: variant === 'region' ? [props.regionId] : undefined,
        },
    });

    const {
        response: exposureResponse,
        pending: exposureResponsePending,
        trigger: getFootprint,
    } = useRiskLazyRequest<'/api/v1/pdc/{id}/exposure/', {
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/pdc/{id}/exposure/',
        pathVariables: ({ eventId }) => ({ id: Number(eventId) }),
        onSuccess: (res) => {
            const {
                footprint_geojson: footprintGeojson,
                storm_position_geojson: stormPositionGeojson,
                cyclone_five_days_cou: cycloneFiveDaysCou,
                cyclone_three_days_cou: cycloneThreeDaysCou,
            } = res;

            const layersWithStatus = {
                [LAYER_CYCLONE_NODES]: isDefined(stormPositionGeojson),
                [LAYER_CYCLONE_TRACKS]: isDefined(stormPositionGeojson),
                [LAYER_CYCLONE_BUFFERS]: isDefined(footprintGeojson),
                [LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS]: isDefined(cycloneFiveDaysCou),
                [LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS]: isDefined(cycloneThreeDaysCou),
            };

            setLayers(layersWithStatus);
            setActiveLayersMapping(layersWithStatus);

            return undefined;
        },

    });

    const pointFeatureSelector = useCallback(
        (event: EventItem): EventPointFeature | undefined => {
            const {
                id,
                latitude,
                longitude,
                hazard_type,
            } = event;

            if (
                isNotDefined(latitude)
                || isNotDefined(longitude)
                || isNotDefined(hazard_type)
                // FIXME: hazard_type should not be ''
                || hazard_type === ''
            ) {
                return undefined;
            }

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                properties: {
                    id,
                    hazard_type,
                },
            };
        },
        [],
    );

    const footprintSelector = useCallback(
        (exposure: RiskApiResponse<'/api/v1/pdc/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const {
                footprint_geojson: footprintGeojson,
                storm_position_geojson: stormPositionGeojson,
                cyclone_five_days_cou: cycloneFiveDaysCou,
                cyclone_three_days_cou: cycloneThreeDaysCou,
            } = exposure;

            if (
                isNotDefined(footprintGeojson)
                && isNotDefined(stormPositionGeojson)
                && isNotDefined(cycloneFiveDaysCou)
                && isNotDefined(cycloneThreeDaysCou)
            ) {
                return undefined;
            }

            const footprint = isValidFeature(footprintGeojson) ? footprintGeojson : undefined;
            // FIXME: fix typing in server (low priority)
            const stormPositions = (stormPositionGeojson as unknown as unknown[] | undefined)
                ?.filter(isValidPointFeature);

            const cycloneFiveDaysUncertainty = (cycloneFiveDaysCou as unknown as unknown[]
                | undefined)?.filter(isValidFeature);

            const cycloneThreeDaysUncertainty = (cycloneThreeDaysCou as unknown as unknown[]
                | undefined)?.filter(isValidFeature);

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, EventGeoJsonProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    footprint ? {
                        ...footprint,
                        properties: {
                            id: String(Date.now()),
                            alertType: getAlertType(footprint?.properties?.severity),
                            type: 'exposure',
                        },
                    } : undefined,

                    ...cycloneFiveDaysUncertainty?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                id: feature?.properties?.uuid,
                                type: 'uncertainty-five-days',
                            },
                        }),
                    ) ?? [],

                    ...cycloneThreeDaysUncertainty?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                id: feature?.properties?.uuid,
                                type: 'uncertainty-three-days',
                            },
                        }),
                    ) ?? [],

                    ...stormPositions?.map(
                        (pointFeature) => ({
                            ...pointFeature,
                            properties: {
                                id: pointFeature?.properties?.uuid,
                                eventId: pointFeature?.properties?.hazard_id,
                                eventName: pointFeature?.properties?.hazard_name,
                                trackDate: formatDate(
                                    pointFeature?.properties?.forecast_date_time,
                                    'MM/dd hh:mm',
                                ),
                                windSpeedMph: pointFeature?.properties?.wind_speed_mph,
                                stormName: pointFeature?.properties?.storm_name,
                                description: pointFeature?.properties?.description,
                                startDate: pointFeature?.properties?.start_date,
                                createdAt: pointFeature?.properties?.pdc_created_at,
                                updatedAt: pointFeature?.properties?.start_updated_at,
                                severity: pointFeature?.properties?.severity,
                                advisoryNumber: pointFeature?.properties?.advisory_number,
                                advisoryDate: formatDate(
                                    pointFeature?.properties?.advisory_date,
                                    'MM/dd',
                                ),
                                advisoryTime: pointFeature?.properties?.advisory_time,
                                trackSpeedMph: pointFeature?.properties?.track_speed_mph,
                                alertType: getAlertType(pointFeature?.properties?.severity),
                                type: 'track-point',
                            },
                        }),
                    ) ?? [],

                    stormPositions ? {
                        type: 'Feature' as const,
                        geometry: {
                            type: 'LineString' as const,
                            coordinates: stormPositions.map(
                                (pointFeature) => (
                                    pointFeature.geometry.coordinates
                                ),
                            ),
                        },
                        properties: {
                            id: Date.now(),
                            type: 'track',
                        },
                    } : undefined,
                ].filter(isDefined),
            };

            return geoJson;
        },
        [],
    );

    const handleActiveEventChange = useCallback(
        (eventId: number | undefined) => {
            if (isDefined(eventId)) {
                getFootprint({ eventId });
            } else {
                getFootprint(undefined);
            }
        },
        [getFootprint],
    );

    const handlePopupClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                lngLat,
            });
            return true;
        },
        [setClickedPointProperties],
    );

    const handlePopupClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    const handleLayerChange = useCallback((value: boolean, name: LayerType) => {
        // NOTE: when tracked point layer is not active
        // hiding the map popup
        if (name === LAYER_CYCLONE_NODES) {
            handlePopupClose();
        }
        setLayers((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    }, [handlePopupClose]);

    return (
        <RiskImminentEventMap
            events={countryRiskResponse?.results}
            pointFeatureSelector={pointFeatureSelector}
            keySelector={numericIdSelector}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pendingCountryRiskResponse}
            sidePanelHeading={title}
            footprintSelector={footprintSelector}
            bbox={bbox}
            activeEventExposure={exposureResponse}
            activeEventExposurePending={exposureResponsePending}
            onActiveEventChange={handleActiveEventChange}
            activeLayersMapping={activeLayersMapping}
            layers={layers}
            onLayerChange={handleLayerChange}
            handlePopupClick={handlePopupClick}
            handlePopupClose={handlePopupClose}
            clickedPointProperties={clickedPointProperties}
        />
    );
}

export default Pdc;
