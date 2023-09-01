import { useCallback } from 'react';
import { type LngLatBoundsLike } from 'mapbox-gl';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { isValidFeatureCollection } from '#utils/domain/risk';

import EventListItem from './EventListItem';
import EventDetails from './EventDetails';

type ImminentEventResponse = RiskApiResponse<'/api/v1/adam-exposure/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

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
        (exposure: RiskApiResponse<'/api/v1/adam-exposure/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const { storm_position_geojson } = exposure;

            if (isNotDefined(storm_position_geojson)) {
                return undefined;
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
        />
    );
}

export default WfpAdam;
