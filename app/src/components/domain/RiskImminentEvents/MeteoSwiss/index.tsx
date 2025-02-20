import { useCallback } from 'react';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import type { LngLatBoundsLike } from 'mapbox-gl';

import type { EventPointFeature } from '#components/domain/RiskImminentEventMap';
import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import { isValidFeatureCollection } from '#utils/domain/risk';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type ImminentEventResponse = RiskApiResponse<'/api/v1/meteoswiss/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

function hazardTypeSelector(item: EventItem) {
    return item.hazard_type;
}

function getLayerProperties(
    feature: GeoJSON.Feature<GeoJSON.Geometry>,
): RiskLayerProperties {
    if (isNotDefined(feature)
        || isNotDefined(feature.properties)
        || isNotDefined(feature.geometry)
    ) {
        return {
            type: 'unknown',
        };
    }

    const geometryType = feature.geometry.type;

    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        // FIXME: calculate isFuture
        return { type: 'track-point', isFuture: true };
    }

    if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        return { type: 'track-linestring' };
    }

    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        return {
            type: 'exposure',
            severity: 'unknown',
        };
    }

    return {
        type: 'unknown',
    };
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

function MeteoSwiss(props: Props) {
    const {
        title,
        bbox,
        variant,
    } = props;

    const {
        pending: pendingCountryRiskResponse,
        response: countryRiskResponse,
    } = useRiskRequest({
        apiType: 'risk',
        // eslint-disable-next-line react/destructuring-assignment
        skip: (variant === 'region' && isNotDefined(props.regionId))
        // eslint-disable-next-line react/destructuring-assignment
            || (variant === 'country' && isNotDefined(props.iso3)),
        url: '/api/v1/meteoswiss/',
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
        trigger: fetchExposure,
    } = useRiskLazyRequest<'/api/v1/meteoswiss/{id}/exposure/', {
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/meteoswiss/{id}/exposure/',
        pathVariables: ({ eventId }) => ({ id: Number(eventId) }),
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
        (exposure: RiskApiResponse<'/api/v1/meteoswiss/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            // FIXME: fix typing in server (low priority)
            const footprint_geojson = exposure?.footprint_geojson?.footprint_geojson;

            if (isNotDefined(footprint_geojson)) {
                return undefined;
            }

            const footprint = isValidFeatureCollection(footprint_geojson)
                ? footprint_geojson
                : undefined;

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...footprint?.features?.map(
                        (feature) => {
                            if (isNotDefined(feature)) {
                                return undefined;
                            }

                            const { geometry } = feature;
                            if (isNotDefined(geometry)) {
                                return undefined;
                            }

                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    ...getLayerProperties(feature),
                                },
                            };
                        },
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
                fetchExposure({ eventId });
            } else {
                fetchExposure(undefined);
            }
        },
        [fetchExposure],
    );

    return (
        <RiskImminentEventMap
            source="meteoSwiss"
            events={countryRiskResponse?.results}
            pointFeatureSelector={pointFeatureSelector}
            keySelector={numericIdSelector}
            hazardTypeSelector={hazardTypeSelector}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pendingCountryRiskResponse}
            sidePanelHeading={title}
            footprintSelector={footprintSelector}
            bbox={bbox}
            activeEventExposure={exposureResponse}
            activeEventExposurePending={exposureResponsePending}
            onActiveEventChange={handleActiveEventChange}
        />
    );
}

export default MeteoSwiss;
