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

function getAlertType(alertType: 'WARNING' | 'WATCH' | 'ADVISORY' | 'INFORMATION') {
    if (alertType === 'WARNING') {
        return 'Red';
    }
    if (alertType === 'WATCH') {
        return 'Orange';
    }
    if (alertType === 'ADVISORY') {
        return 'Green';
    }
    if (alertType === 'INFORMATION') {
        return 'Blue';
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
            if (isNotDefined(res)) {
                return defaultLayersValue;
            }

            const {
                footprint_geojson,
                storm_position_geojson,
                cyclone_five_days_cou,
                cyclone_three_days_cou,
            } = res;

            const layersWithStatus = {
                [LAYER_CYCLONE_NODES]: isDefined(storm_position_geojson),
                [LAYER_CYCLONE_TRACKS]: isDefined(storm_position_geojson),
                [LAYER_CYCLONE_BUFFERS]: isDefined(footprint_geojson),
                [LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS]: isDefined(cyclone_five_days_cou),
                [LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS]: isDefined(cyclone_three_days_cou),
            } as typeof defaultLayersValue;

            setLayers(layersWithStatus);
            setActiveLayersMapping(layersWithStatus);

            return true;
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
                footprint_geojson,
                storm_position_geojson,
                cyclone_five_days_cou,
                cyclone_three_days_cou,
            } = exposure;

            if (
                isNotDefined(footprint_geojson)
                && isNotDefined(storm_position_geojson)
                && isNotDefined(cyclone_five_days_cou)
                && isNotDefined(cyclone_three_days_cou)
            ) {
                return undefined;
            }

            const footprint = isValidFeature(footprint_geojson) ? footprint_geojson : undefined;
            // FIXME: fix typing in server (low priority)
            const stormPositions = (storm_position_geojson as unknown as unknown[] | undefined)
                ?.filter(isValidPointFeature);

            const cycloneFiveDays = (cyclone_five_days_cou as unknown as unknown[] | undefined)
                ?.filter(isValidFeature);

            const cycloneThreeDays = (cyclone_three_days_cou as unknown as unknown[] | undefined)
                ?.filter(isValidFeature);
            // forecast_date_time : "2023 SEP 04, 00:00Z"
            // severity : "WARNING"
            // storm_name : "HAIKUI"
            // track_heading : "WNW"
            // wind_speed_mph : 75

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, EventGeoJsonProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    footprint ? {
                        ...footprint,
                        properties: {
                            alertType: getAlertType(footprint?.properties?.severity),
                            type: 'exposure',
                        },
                    } : undefined,

                    ...cycloneFiveDays?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                alertType: getAlertType(feature?.properties?.severity),
                                type: 'uncertainty-five-days',
                            },
                        }),
                    ) ?? [],

                    ...cycloneThreeDays?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                alertType: getAlertType(feature?.properties?.severity),
                                type: 'uncertainty-three-days',
                            },
                        }),
                    ) ?? [],

                    ...stormPositions?.map(
                        (pointFeature) => ({
                            ...pointFeature,
                            properties: {
                                eventId: pointFeature?.properties?.hazard_id,
                                eventName: pointFeature?.properties?.hazard_name,
                                trackDate: formatDate(
                                    pointFeature?.properties?.forecast_date_time,
                                    'yyyy-MM-dd, hh:mm',
                                ),
                                windSpeedMph: pointFeature?.properties?.wind_speed_mph,
                                stormName: pointFeature?.properties?.storm_name,
                                description: pointFeature?.properties?.description,
                                startDate: pointFeature?.properties?.start_date,
                                createdAt: pointFeature?.properties?.pdc_created_at,
                                updatedAt: pointFeature?.properties?.start_updated_at,
                                severity: pointFeature?.properties?.severity,
                                advisoryNumber: pointFeature?.properties?.advisory_number,
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
