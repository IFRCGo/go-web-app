import {
    useCallback,
    useState,
} from 'react';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';

import RiskImminentEventMap, { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import {
    defaultLayersValue,
    ImminentEventSource,
    isValidFeature,
    isValidPointFeature,
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LAYER_CYCLONE_TRACKS,
    LAYER_CYCLONE_UNCERTAINTY_FIVE_DAYS,
    LAYER_CYCLONE_UNCERTAINTY_THREE_DAYS,
} from '#utils/domain/risk';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type ImminentEventResponse = RiskApiResponse<'/api/v1/pdc/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type BaseProps = {
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    activeView: ImminentEventSource;
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
        activeView,
    } = props;

    const [
        activeLayersMapping,
        setActiveLayersMapping,
    ] = useState<Record<number, boolean>>(defaultLayersValue);

    const [layers, setLayers] = useState<Record<number, boolean>>(defaultLayersValue);
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

            const geoJson: GeoJSON.FeatureCollection<
                GeoJSON.Geometry, GeoJSON.GeoJsonProperties
            > = {
                type: 'FeatureCollection' as const,
                features: [
                    footprint ? {
                        ...footprint,
                        properties: {
                            ...footprint.properties,
                            type: 'exposure',
                        },
                    } : undefined,

                    ...cycloneFiveDays?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                type: 'uncertainty-five-days',
                            },
                        }),
                    ) ?? [],

                    ...cycloneThreeDays?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                type: 'uncertainty-three-days',
                            },
                        }),
                    ) ?? [],

                    ...stormPositions?.map(
                        (pointFeature) => ({
                            ...pointFeature,
                            properties: {
                                ...pointFeature.properties,
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
            activeView={activeView}
            activeLayersMapping={activeLayersMapping}
            layers={layers}
            onLayerChange={setLayers}
        />
    );
}

export default Pdc;
