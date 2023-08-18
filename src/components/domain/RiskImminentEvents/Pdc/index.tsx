import type { LngLatBoundsLike } from 'mapbox-gl';
import { useCallback } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import type { EventPointFeature } from '#components/domain/RiskImminentEventMap';
import { useRiskLazyRequest, useRiskRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { isValidFeature, isValidPointFeature } from '#utils/domain/risk';
import type { paths } from '#generated/riskTypes';

import EventListItem from './EventListItem';
import EventDetails from './EventDetails';

type GetImminentEvents = paths['/api/v1/pdc/']['get'];
type ImminentEventResponse = GetImminentEvents['responses']['200']['content']['application/json'];
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

type FootprintCallback = (footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry>) => void;

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
            limit: 500,
            // eslint-disable-next-line react/destructuring-assignment
            iso3: variant === 'country' ? props.iso3 : undefined,
            // eslint-disable-next-line react/destructuring-assignment
            region: variant === 'region' ? [props.regionId] : undefined,
        },
    });

    const { trigger: getFootprint } = useRiskLazyRequest<'/api/v1/pdc/{id}/exposure/', {
        successCallback: FootprintCallback,
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/pdc/{id}/exposure/',
        pathVariables: ({ eventId }) => ({ id: Number(eventId) }),
        onSuccess: (response, { successCallback }) => {
            const {
                footprint_geojson,
                storm_position_geojson,
            } = response;

            if (!footprint_geojson && !storm_position_geojson) {
                return;
            }

            const footprint = isValidFeature(footprint_geojson) ? footprint_geojson : undefined;
            // FIXME: typings should be fixed in the server
            const stormPositions = (storm_position_geojson as unknown as unknown[] | undefined)
                ?.filter(isValidPointFeature);

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
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

            successCallback(geoJson);
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
            if (isDefined(eventId)) {
                getFootprint({
                    eventId,
                    successCallback: callback,
                });
            } else {
                // NOTE: using undefined in context clears out the response
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
        />
    );
}

export default Pdc;
