import { useCallback } from 'react';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';

import RiskImminentEventMap, { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import {
    type RiskLayerProperties,
    type RiskLayerSeverity,
} from '#components/domain/RiskImminentEventMap/utils';
import { isValidFeatureCollection } from '#utils/domain/risk';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type ImminentEventResponse = RiskApiResponse<'/api/v1/gdacs/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

function hazardTypeSelector(item: EventItem) {
    return item.hazard_type;
}

interface CommonFeatureProperties {
    Class: string;
}

type FeatureAlertLevel = 'Green' | 'Red' | 'Orange';

interface HazardPointFeatureProperties extends CommonFeatureProperties {
    alertlevel: FeatureAlertLevel,
}

const severityMapping: Record<string, RiskLayerSeverity> = {
    Red: 'red',
    Orange: 'orange',
    Green: 'green',
};

// Currently observed classes for TC are
// Point_ are points
// Poly_ are polygons
// Line_ are linestrings
// Point_0 is track point
// Poly_Green is exposure polygon
// Poly_Polygon_Point_0 is circle around the Point_0
// Line_Line_0 is a line from Point_0 to Point_1
// Poly_Cones is cone of uncertainty
function getLayerProperties(
    feature: GeoJSON.Feature<GeoJSON.Geometry>,
    hazardDate: string | undefined,
): RiskLayerProperties {
    if (isNotDefined(feature.properties) || !('Class' in feature.properties)) {
        return {
            type: 'unknown',
        };
    }

    const {
        Class: featureClass,
    } = feature.properties;

    const splits = featureClass.split('_');

    if (splits[0] === 'Point') {
        if (splits[1] === 'Centroid') {
            const severityStr = (feature.properties as HazardPointFeatureProperties).alertlevel;

            return {
                type: 'hazard-point',
                severity: severityMapping[severityStr] ?? 'unknown',
            };
        }

        // Converting format from 'dd/MM/yyyy hh:mm:ss' to 'yyyy-MM-ddThh:mm:ss.sssZ'
        const [date, time] = feature.properties.trackdate.split(' ');
        const [d, m, y] = date.split('/');
        const standardDateTime = `${y}-${m}-${d}T${time}.000Z`;

        return {
            type: 'track-point',
            isFuture: hazardDate
                ? new Date(standardDateTime).getTime() > new Date(hazardDate).getTime()
                : false,
        };
    }

    if (splits[0] === 'Line') {
        return {
            type: 'track-linestring',
        };
    }

    if (splits[0] === 'Poly') {
        if (splits[1] === 'Cones') {
            return {
                type: 'uncertainty-cone',
                forecastDays: undefined,
            };
        }

        if (splits[1] === 'Red' || splits[1] === 'Orange' || splits[1] === 'Green') {
            return {
                type: 'exposure',
                severity: severityMapping[splits[1]] ?? 'unknown',
            };
        }

        if (splits[1] === 'Polygon' && splits[2] === 'Point') {
            return {
                type: 'track-point-boundary',
            };
        }
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
    } = useRiskLazyRequest<'/api/v1/gdacs/{id}/exposure/', {
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/gdacs/{id}/exposure/',
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
        (exposure: RiskApiResponse<'/api/v1/gdacs/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const { footprint_geojson } = exposure;

            if (isNotDefined(footprint_geojson)) {
                return undefined;
            }

            // FIXME: the type from server is not correct
            const footprint = isValidFeatureCollection(footprint_geojson)
                ? footprint_geojson
                : undefined;

            const hazardDate = (footprint?.metadata as ({ todate?: string } | undefined))?.todate;

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    ...footprint?.features?.map(
                        (feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                // NOTE: the todate format is 'dd MMM yyyy hh:mm:ss'
                                ...getLayerProperties(feature, hazardDate),
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
                fetchExposure({ eventId });
            } else {
                fetchExposure(undefined);
            }
        },
        [fetchExposure],
    );

    return (
        <RiskImminentEventMap
            source="gdacs"
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

export default Gdacs;
