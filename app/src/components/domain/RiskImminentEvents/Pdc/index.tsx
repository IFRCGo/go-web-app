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
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import {
    isValidFeature,
    isValidPointFeature,
} from '#utils/domain/risk';
import {
    type RiskApiResponse,
    useRiskLazyRequest,
    useRiskRequest,
} from '#utils/restRequest';

import EventDetails from './EventDetails';
import EventListItem from './EventListItem';

type ImminentEventResponse = RiskApiResponse<'/api/v1/pdc/'>;
type EventItem = NonNullable<ImminentEventResponse['results']>[number];

function hazardTypeSelector(item: EventItem) {
    return item.hazard_type;
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

function Pdc(props: Props) {
    const {
        title,
        bbox,
        variant,
    } = props;

    const [activeEventId, setActiveEventId] = useState<number | undefined>();

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
    } = useRiskLazyRequest<'/api/v1/pdc/{id}/exposure/', {
        eventId: number | string,
    }>({
        apiType: 'risk',
        url: '/api/v1/pdc/{id}/exposure/',
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

    const activeEvent = countryRiskResponse?.results?.find(
        (item) => item.id === activeEventId,
    );

    const footprintSelector = useCallback(
        (exposure: RiskApiResponse<'/api/v1/pdc/{id}/exposure/'> | undefined) => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const {
                footprint_geojson,
                storm_position_geojson,
                cyclone_five_days_cou,
                cyclone_three_days_cou,
            } = exposure;

            // FIXME: showing five days cou when three days cou is not available
            const cyclone_cou = cyclone_three_days_cou?.[0] ?? cyclone_five_days_cou?.[0];

            if (isNotDefined(footprint_geojson) && isNotDefined(storm_position_geojson)) {
                return undefined;
            }

            const footprint = isValidFeature(footprint_geojson) ? footprint_geojson : undefined;
            // FIXME: fix typing in server (low priority)
            const stormPositions = (storm_position_geojson as unknown as unknown[] | undefined)
                ?.filter(isValidPointFeature);

            // FIXME: fix typing in server (low priority)
            const forecastUncertainty = isValidFeature(cyclone_cou)
                ? cyclone_cou
                : undefined;

            // severity
            // WARNING: Adverse or significant impacts to population are imminent or occurring.
            // WATCH: Conditions are possible for adverse or significant impacts to population.
            // ADVISORY: Conditions are possible for limited or minor impacts to population
            // INFORMATION: Conditions are possible for limited or minor impacts to population

            // advisory_date: "28-Sep-2024"
            // advisory_number: 4
            // advisory_time: "0000Z"
            // hazard_name: "Super Typhoon - Krathon"
            //
            // forecast_date_time : "2023 SEP 04, 00:00Z"
            // severity : "WARNING"
            // storm_name : "HAIKUI"
            // track_heading : "WNW"
            // wind_speed_mph : 75
            // track_speed_mph: xx

            const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> = {
                type: 'FeatureCollection' as const,
                features: [
                    footprint ? {
                        ...footprint,
                        properties: {
                            ...footprint.properties,
                            type: 'exposure' as const,
                            severity: 'unknown' as const,
                        },
                    } : undefined,
                    forecastUncertainty ? {
                        ...forecastUncertainty,
                        properties: {
                            ...forecastUncertainty.properties,
                            type: 'uncertainty-cone' as const,
                            forecastDays: 3,
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
                            type: 'track-linestring' as const,
                        },
                    } : undefined,
                    ...stormPositions?.map(
                        (pointFeature) => ({
                            ...pointFeature,
                            properties: {
                                ...pointFeature.properties,
                                type: 'track-point' as const,
                                isFuture: (
                                    activeEvent
                                    && activeEvent.pdc_updated_at
                                    && pointFeature.properties?.forecast_date_time
                                        ? (
                                            new Date(pointFeature.properties.forecast_date_time)
                                            > new Date(activeEvent.pdc_updated_at)
                                        )
                                        : false
                                ),
                            },
                        }),
                    ) ?? [],
                ].filter(isDefined),
            };

            return geoJson;
        },
        [activeEvent],
    );

    const handleActiveEventChange = useCallback(
        (eventId: number | undefined) => {
            if (isDefined(eventId)) {
                fetchExposure({ eventId });
            } else {
                fetchExposure(undefined);
            }
            setActiveEventId(eventId);
        },
        [fetchExposure],
    );

    return (
        <RiskImminentEventMap
            source="pdc"
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

export default Pdc;
