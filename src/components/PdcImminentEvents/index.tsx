import type { LngLatBoundsLike } from 'mapbox-gl';
import { useCallback, useRef, useState } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import RiskImminentEventMap from '#components/RiskImminentEventMap';
import type { EventPointFeature } from '#components/RiskImminentEventMap';
import { useRiskLazyRequest, useRiskRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { isValidFeature, isValidPointFeature } from '#utils/risk';
import type { paths } from '#generated/riskTypes';

import EventListItem from './EventListItem';
import EventDetails from './EventDetails';

type GetImminentEvents = paths['/api/v1/imminent/']['get'];
type ImminentEventResponse = GetImminentEvents['responses']['200']['content']['application/json'];
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type FootprintCallback = (footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry>) => void;

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

function ImminentEvents(props: Props) {
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
        url: '/api/v1/imminent/',
        query: {
            limit: 500,
            // eslint-disable-next-line react/destructuring-assignment
            iso3: variant === 'country' ? props.iso3 : undefined,
            // eslint-disable-next-line react/destructuring-assignment
            region: variant === 'region' ? [props.regionId] : undefined,
        },
    });

    const [activeEventId, setActiveEventId] = useState<number | string | undefined>(undefined);
    const footprintCallbackRef = useRef<FootprintCallback | undefined>();

    const { trigger: getFootprint } = useRiskLazyRequest({
        apiType: 'risk',
        url: '/api/v1/imminent/{id}/exposure/',
        pathVariables: isDefined(activeEventId) ? {
            id: Number(activeEventId),
        } : undefined,
        onSuccess: (response) => {
            const {
                footprint_geojson,
                storm_position_geojson,
            } = response;

            if (!footprint_geojson && !storm_position_geojson) {
                return;
            }

            const footprint = isValidFeature(footprint_geojson) ? footprint_geojson : undefined;
            const stormPositions = (storm_position_geojson as unknown as unknown[] | undefined)
                ?.filter(isValidPointFeature);

            if (footprintCallbackRef.current) {
                const geoJson = {
                    type: 'FeatureCollection' as const,
                    features: [
                        footprint ? {
                            ...footprint,
                            properties: {
                                ...footprint.properties,
                                type: 'exposure',
                            },
                        } : undefined,
                        stormPositions ? {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
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
                        ...stormPositions?.map(
                            (pointFeature) => ({
                                ...pointFeature,
                                properties: {
                                    ...pointFeature.properties,
                                    type: 'track-point',
                                },
                            }),
                        ) ?? [],
                    ].filter(isDefined),
                };

                footprintCallbackRef.current(
                    geoJson as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
                );
            }
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
            footprintCallbackRef.current = callback;
            getFootprint(null);
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

export default ImminentEvents;
