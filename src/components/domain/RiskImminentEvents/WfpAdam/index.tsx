import type { LngLatBoundsLike } from 'mapbox-gl';
import { useCallback, useState } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import type { EventPointFeature } from '#components/domain/RiskImminentEventMap';
import { useRiskLazyRequest, useRiskRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { isValidFeatureCollection } from '#utils/domain/risk';
import type { paths } from '#generated/riskTypes';

import EventListItem from './EventListItem';
import EventDetails from './EventDetails';

type GetImminentEvents = paths['/api/v1/adam-exposure/']['get'];
type ImminentEventResponse = GetImminentEvents['responses']['200']['content']['application/json'];
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type FootprintCallback = (footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry>) => void;

function getLayerType(geometryType: GeoJSON.Geometry['type']) {
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        return 'track-point';
    }

    if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        return 'track';
    }

    return 'exposure';
}

type BaseProps = {
    title: React.ReactNode;
    bbox: LngLatBoundsLike;
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
            limit: 500,
            // eslint-disable-next-line react/destructuring-assignment
            iso3: variant === 'country' ? props.iso3 : undefined,
            // eslint-disable-next-line react/destructuring-assignment
            region: variant === 'region' ? [props.regionId] : undefined,
        },
    });

    const [activeEventId, setActiveEventId] = useState<number | string | undefined>(undefined);

    const { trigger: getFootprint } = useRiskLazyRequest<'/api/v1/adam-exposure/{id}/', { successCallback: FootprintCallback }>({
        apiType: 'risk',
        url: '/api/v1/adam-exposure/{id}/',
        pathVariables: isDefined(activeEventId) ? {
            id: Number(activeEventId),
        } : undefined,
        onSuccess: (response, { successCallback }) => {
            const {
                geojson,
                storm_position_geojson,
            } = response;

            if (!geojson && !storm_position_geojson) {
                return;
            }

            const stormPositions = isValidFeatureCollection(storm_position_geojson)
                ? storm_position_geojson : undefined;

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...stormPositions?.features?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                type: getLayerType(feature.geometry.type),
                            },
                        }),
                    ) ?? [],
                ].filter(isDefined),
            };

            successCallback(geoJson);
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

            if (isNotDefined(latitude)
                || isNotDefined(longitude)
                || isNotDefined(hazard_type)
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
        (eventId: number | string | undefined, callback: FootprintCallback) => {
            setActiveEventId(eventId);
            getFootprint({ successCallback: callback });
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
        />
    );
}

export default WfpAdam;
