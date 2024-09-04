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
    CycloneFillLayerType,
    defaultLayersValue,
    EventGeoJsonProperties,
    isValidFeatureCollection,
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LAYER_CYCLONE_TRACKS,
    LAYER_CYCLONE_UNCERTAINTY,
    LayerType,
} from '#utils/domain/risk';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type ImminentEventResponse = RiskApiResponse<'/api/v1/adam-exposure/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

function getLayerType(
    feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
): CycloneFillLayerType {
    if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
        return 'track-point';
    }

    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
        return 'track';
    }

    if (feature.properties?.alert_level === 'Cones') {
        return 'uncertainty';
    }

    return 'exposure';
}

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

function WfpAdam(props: Props) {
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
        url: '/api/v1/adam-exposure/',
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
    } = useRiskLazyRequest<'/api/v1/adam-exposure/{id}/exposure/', {
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/adam-exposure/{id}/exposure/',
        pathVariables: ({ eventId }) => ({ id: Number(eventId) }),
        onSuccess: (res) => {
            if (isNotDefined(res)) {
                return defaultLayersValue;
            }

            const { storm_position_geojson } = res;

            if (isNotDefined(storm_position_geojson)) {
                return defaultLayersValue;
            }

            const stormPositions = isValidFeatureCollection(storm_position_geojson)
                ? storm_position_geojson
                : undefined;

            const updatedLayers = {} as typeof defaultLayersValue;

            stormPositions?.features?.reduce((_, feature) => {
                if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
                    updatedLayers[LAYER_CYCLONE_NODES] = true;
                }

                if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                    updatedLayers[LAYER_CYCLONE_TRACKS] = true;
                }
                if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    updatedLayers[LAYER_CYCLONE_BUFFERS] = true;
                }

                if (feature.properties?.alert_level === 'Cones') {
                    updatedLayers[LAYER_CYCLONE_UNCERTAINTY] = true;
                }
                return updatedLayers as typeof defaultLayersValue;
            }, { ...defaultLayersValue });

            setLayers(updatedLayers);
            setActiveLayersMapping(updatedLayers);

            return true;
        },
    });

    const pointFeatureSelector = useCallback(
        (event: EventItem): EventPointFeature | undefined => {
            const {
                id,
                event_details,
                hazard_type,
            } = event;

            const latitude = event_details?.latitude as number | undefined;
            const longitude = event_details?.longitude as number | undefined;

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
        (exposure: RiskApiResponse<'/api/v1/adam-exposure/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const { storm_position_geojson } = exposure;

            if (isNotDefined(storm_position_geojson)) {
                return undefined;
            }

            const stormPositions = isValidFeatureCollection(storm_position_geojson)
                ? storm_position_geojson
                : undefined;

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, EventGeoJsonProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...stormPositions?.features?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                eventId: feature?.properties?.event_id,
                                eventName: feature?.properties?.name,
                                populationImpact: feature?.properties?.population_impact,
                                windSpeedMph: feature?.properties?.wind_speed,
                                trackDate: formatDate(feature?.properties?.track_date, 'yyyy-MM-dd, hh:mm'),
                                maxStormSurge: feature?.properties?.max_storm_surge,
                                alertType: feature?.properties?.alert_level,
                                type: getLayerType(feature),
                            },
                        }),
                    ) ?? [],
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

export default WfpAdam;
