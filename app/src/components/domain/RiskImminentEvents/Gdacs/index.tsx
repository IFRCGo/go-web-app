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
    CYCLONE_GREEN_ALERT_LEVEL,
    CYCLONE_ORANGE_ALERT_LEVEL,
    CYCLONE_RED_ALERT_LEVEL,
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
    RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type AlertClassType = 'Poly_Red' | 'Poly_Orange' | 'Poly_Green';

const RED_ALERT_CLASS = 'Poly_Red' satisfies AlertClassType;
const ORANGE_ALERT_CLASS = 'Poly_Orange' satisfies AlertClassType;
const GREEN_ALERT_CLASS = 'Poly_Green' satisfies AlertClassType;

function getAlertType(alertClass: AlertClassType) {
    if (alertClass === RED_ALERT_CLASS) {
        return CYCLONE_RED_ALERT_LEVEL;
    }
    if (alertClass === ORANGE_ALERT_CLASS) {
        return CYCLONE_ORANGE_ALERT_LEVEL;
    }
    if (alertClass === GREEN_ALERT_CLASS) {
        return CYCLONE_GREEN_ALERT_LEVEL;
    }
    return undefined;
}

function getLayerType(
    feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
): CycloneFillLayerType {
    if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
        return 'track-point';
    }

    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
        return 'track';
    }

    if (feature.properties?.Class === 'Poly_Cones') {
        return 'uncertainty';
    }

    return 'exposure';
}

type ImminentEventResponse = RiskApiResponse<'/api/v1/gdacs/'>;
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

function Gdacs(props: Props) {
    const {
        title,
        bbox,
        variant,
    } = props;

    const [
        activeLayersMapping,
        setActiveLayersMapping,
    ] = useState<Record<number, boolean>>(defaultLayersValue);
    const [visibleLayers, setVisibleLayers] = useState<Record<number, boolean>>(defaultLayersValue);

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
            const { footprint_geojson: footprintGeojson } = res;

            const footprint = isValidFeatureCollection(footprintGeojson)
                ? footprintGeojson
                : undefined;

            footprint?.features?.find((feature) => {
                if (feature?.geometry.type === 'Point' || feature?.geometry.type === 'MultiPoint') {
                    setVisibleLayers((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_NODES]: true,
                    }));
                    setActiveLayersMapping((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_NODES]: true,
                    }));
                }
                return undefined;
            });

            footprint?.features?.find((feature) => {
                if (feature?.geometry.type === 'LineString' || feature?.geometry.type === 'MultiLineString') {
                    setVisibleLayers((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_TRACKS]: true,
                    }));
                    setActiveLayersMapping((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_TRACKS]: true,
                    }));
                }
                return undefined;
            });

            footprint?.features?.find((feature) => {
                if (feature?.geometry.type === 'Polygon' || feature?.geometry.type === 'MultiPolygon') {
                    setVisibleLayers((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_BUFFERS]: true,
                    }));
                    setActiveLayersMapping((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_BUFFERS]: true,
                    }));
                }
                return undefined;
            });

            footprint?.features?.find((feature) => {
                if (feature?.properties?.Class === 'Poly_Cones') {
                    setVisibleLayers((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_UNCERTAINTY]: true,
                    }));
                    setActiveLayersMapping((prevValue) => ({
                        ...prevValue,
                        [LAYER_CYCLONE_UNCERTAINTY]: true,
                    }));
                }
                return undefined;
            });

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

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, EventGeoJsonProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...footprint?.features?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                id: String(Date.now()),
                                eventName: feature?.properties?.eventname,
                                eventType: feature?.properties?.eventtype,
                                trackDate: formatDate(feature?.properties?.trackdate, 'MM/dd hh:mm'),
                                source: feature?.properties?.source,
                                stormStatus: feature?.properties?.stormstatus,
                                alertLevel: feature?.properties?.alertlevel,
                                alertType: getAlertType(feature?.properties?.Class),
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

    const handleLayerChange = useCallback((value: boolean, name: LayerType) => {
        setVisibleLayers((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    }, []);

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
            visibleLayers={visibleLayers}
            onLayerVisibilityChange={handleLayerChange}
        />
    );
}

export default Gdacs;
