import type { LngLatBoundsLike } from 'mapbox-gl';
import { useCallback, useState } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import RiskImminentEventMap from '#components/RiskImminentEventMap';
import type { EventPointFeature } from '#components/RiskImminentEventMap';
import { useRiskLazyRequest, useRiskRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { isValidFeatureCollection } from '#utils/risk';
import type { paths } from '#generated/riskTypes';

import EventListItem from './EventListItem';
import EventDetails from './EventDetails';

type GetImminentEvents = paths['/api/v1/gdacs/']['get'];
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

function Gdacs(props: Props) {
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
        url: '/api/v1/gdacs/',
        query: {
            limit: 500,
            // eslint-disable-next-line react/destructuring-assignment
            iso3: variant === 'country' ? props.iso3 : undefined,
            // eslint-disable-next-line react/destructuring-assignment
            region: variant === 'region' ? [props.regionId] : undefined,
        },
    });

    const [activeEventId, setActiveEventId] = useState<number | string | undefined>(undefined);

    const { trigger: getFootprint } = useRiskLazyRequest<'/api/v1/gdacs/{id}/exposure/', { successCallback: FootprintCallback }>({
        apiType: 'risk',
        url: '/api/v1/gdacs/{id}/exposure/',
        pathVariables: isDefined(activeEventId) ? {
            id: Number(activeEventId),
        } : undefined,
        onSuccess: (response, { successCallback }) => {
            // FIXME: typings should be fixed in the server
            const { footprint_geojson } = response as unknown as { footprint_geojson: unknown };

            if (!footprint_geojson) {
                return;
            }

            // FIXME: typings should be fixed in the server
            const footprint = isValidFeatureCollection(footprint_geojson)
                ? footprint_geojson : undefined;

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...footprint?.features?.map(
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

export default Gdacs;
