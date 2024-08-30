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
    CycloneFillLayerType,
    defaultLayersValue,
    ImminentEventSource,
    isValidFeatureCollection,
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LAYER_CYCLONE_TRACKS,
    LAYER_CYCLONE_UNCERTAINTY,
} from '#utils/domain/risk';
import {
    RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type ImminentEventResponse = RiskApiResponse<'/api/v1/gdacs/'>;
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

    if (feature.properties?.polygonlabel === 'Uncertainty Cones') {
        return 'uncertainty';
    }

    return 'exposure';
}

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

function Gdacs(props: Props) {
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
        url: '/api/v1/gdacs/',
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
    } = useRiskLazyRequest<'/api/v1/gdacs/{id}/exposure/', {
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/gdacs/{id}/exposure/',
        pathVariables: ({ eventId }) => ({ id: Number(eventId) }),
        onSuccess: (res) => {
            if (isNotDefined(res)) {
                return defaultLayersValue;
            }

            const { footprint_geojson } = res;

            if (isNotDefined(footprint_geojson)) {
                return defaultLayersValue;
            }

            const footprint = isValidFeatureCollection(footprint_geojson)
                ? footprint_geojson
                : undefined;

            if (!footprint) {
                return defaultLayersValue;
            }
            const updatedLayers = {} as typeof defaultLayersValue;
            footprint.features.reduce((_, feature) => {
                if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
                    updatedLayers[LAYER_CYCLONE_NODES] = true;
                }

                if (feature.geometry.type === 'LineString'
                    || feature.geometry.type === 'MultiLineString') {
                    updatedLayers[LAYER_CYCLONE_TRACKS] = true;
                }

                if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    updatedLayers[LAYER_CYCLONE_BUFFERS] = true;
                }

                if (feature.properties?.polygonlabel === 'Uncertainty Cones') {
                    updatedLayers[LAYER_CYCLONE_UNCERTAINTY] = true;
                }

                return updatedLayers;
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
        (exposure: RiskApiResponse<'/api/v1/gdacs/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const { footprint_geojson } = exposure;

            if (isNotDefined(footprint_geojson)) {
                return undefined;
            }

            const footprint = isValidFeatureCollection(footprint_geojson)
                ? footprint_geojson
                : undefined;

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...footprint?.features?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                type: getLayerType(feature),
                            },
                        }),
                    ) ?? [],

                    // Convert LineString to Point and add them
                    ...footprint?.features?.filter((feature) => feature.geometry.type === 'LineString')
                        ?.map(
                            (feature) => (feature.geometry as GeoJSON.LineString).coordinates.map(
                                (coordinate) => ({
                                    type: 'Feature' as const,
                                    geometry: {
                                        type: 'Point' as const,
                                        coordinates: coordinate,
                                    },
                                    properties: {
                                        ...feature.properties,
                                        type: getLayerType({
                                            ...feature,
                                            geometry: {
                                                type: 'Point',
                                                coordinates: coordinate,
                                            },
                                        }),
                                    },
                                }),
                            ),
                        )
                        ?.flat() ?? [],
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

export default Gdacs;
