import { useMemo } from 'react';
import {
    compareDate,
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import { maxSafe, roundSafe } from '#utils/common';
import { type RiskApiResponse } from '#utils/restRequest';

import { isValidFeatureCollection, isValidPointFeature } from '#utils/domain/risk';
import styles from './styles.module.css';

type WfpAdamResponse = RiskApiResponse<'/api/v1/adam-exposure/'>;
type WfpAdamItem = NonNullable<WfpAdamResponse['results']>[number];
type WfpAdamExposure = RiskApiResponse<'/api/v1/adam-exposure/{id}/exposure/'>;

interface WfpAdamPopulationExposure {
    exposure_60_kmh?: number;
    exposure_90_kmh?: number;
    exposure_120_kmh?: number;
}

interface WfpAdamEventDetails {
    event_id: string;
    mag?: number;
    mmni?: number;
    url?: {
        map?: string;
        shakemap?: string;
        population?: string;
        population_csv?: string;
        wind?: string;
        rainfall?: string;
        shapefile?: string
    }
    iso3?: string;
    depth?: number;
    place?: string;
    title?: string;
    latitude?: number;
    longitude?: number;
    mag_type?: string;
    admin1_name?: string;
    published_at?: string;
    population_impact?: number;
    country?: number | null;
    alert_sent?: boolean;
    alert_level?: 'Red' | 'Orange' | 'Green' | 'Cones' | null;
    from_date?: string;
    to_date?: string;
    wind_speed?: number;
    effective_date?: string;
    date_processed?: string;
    population?: number;
    dashboard_url?: string;
    flood_area?: number;
    fl_croplnd?: number;
    source?: string;
    sitrep?: string;
}

interface Props {
    data: WfpAdamItem;
    exposure: WfpAdamExposure | undefined;
    pending: boolean;
}

function EventDetails(props: Props) {
    const {
        data: {
            title,
            publish_date,
            event_details,
        },
        exposure,
        pending,
    } = props;

    const stormPoints = useMemo(
        () => {
            if (isNotDefined(exposure)) {
                return undefined;
            }

            const { storm_position_geojson } = exposure;

            const geoJson = isValidFeatureCollection(storm_position_geojson)
                ? storm_position_geojson
                : undefined;

            const points = geoJson?.features.map(
                (pointFeature) => {
                    if (
                        !isValidPointFeature(pointFeature)
                            || isNotDefined(pointFeature.properties)
                    ) {
                        return undefined;
                    }

                    const {
                        wind_speed,
                        track_date,
                    } = pointFeature.properties;

                    if (isNotDefined(wind_speed) || isFalsyString(track_date)) {
                        return undefined;
                    }

                    const date = new Date(track_date);

                    return {
                        id: date.getTime(),
                        windSpeed: wind_speed,
                        date,
                    };
                },
            ).filter(isDefined).sort(
                (a, b) => compareDate(a.date, b.date),
            );

            return points;
        },
        [exposure],
    );

    const eventDetails = event_details as WfpAdamEventDetails | undefined;

    // eslint-disable-next-line max-len
    const populationExposure = exposure?.population_exposure as WfpAdamPopulationExposure | undefined;

    const dashboardUrl = eventDetails?.dashboard_url ?? eventDetails?.url?.map;
    const populationImpact = roundSafe(eventDetails?.population_impact)
        ?? roundSafe(eventDetails?.population);
    const maxWindSpeed = maxSafe(
        stormPoints?.map(({ windSpeed }) => windSpeed),
    );

    // TODO: add exposure details
    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={title}
            headingLevel={4}
            spacing="compact"
            headingDescription={(
                <TextOutput
                    // FIXME: use translation
                    label="Published on"
                    value={publish_date}
                    valueType="date"
                    strongValue
                />
            )}
        >
            {pending && <BlockLoading />}
            {stormPoints && stormPoints.length > 0 && isDefined(maxWindSpeed) && (
                /* TODO: use proper svg charts */
                <div className={styles.windSpeedChart}>
                    {stormPoints.map(
                        (point) => (
                            <div
                                key={point.id}
                                className={styles.bar}
                                style={{ height: `${100 * (point.windSpeed / maxWindSpeed)}%` }}
                                title={`${point.windSpeed} Km/h on ${point.date.toLocaleString()}`}
                            />
                        ),
                    )}
                </div>
            )}
            {isDefined(eventDetails)
                && (isDefined(eventDetails.url) || isDefined(eventDetails.dashboard_url)) && (
                <Container
                    // FIXME: use translation
                    heading="Useful links:"
                    headingLevel={5}
                    childrenContainerClassName={styles.usefulLinksContent}
                    spacing="compact"
                >
                    {isDefined(dashboardUrl) && (
                        <Link
                            to={dashboardUrl}
                            external
                            withExternalLinkIcon
                        >
                            {/* FIXME: use translation */}
                            Dashboard
                        </Link>
                    )}
                    {isDefined(eventDetails?.url) && (
                        <>
                            {isDefined(eventDetails.url.shakemap) && (
                                <Link
                                    to={eventDetails?.url.shakemap}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Shakemap
                                </Link>
                            )}
                            {isDefined(eventDetails.url.population) && (
                                <Link
                                    to={eventDetails.url.population}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Population table
                                </Link>
                            )}
                            {isDefined(eventDetails.url.wind) && (
                                <Link
                                    to={eventDetails.url.wind}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Wind
                                </Link>
                            )}
                            {isDefined(eventDetails.url.rainfall) && (
                                <Link
                                    to={eventDetails.url.rainfall}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Rainfall
                                </Link>
                            )}
                            {isDefined(eventDetails.url.shapefile) && (
                                <Link
                                    to={eventDetails.url.shapefile}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Shapefile
                                </Link>
                            )}
                        </>
                    )}
                </Container>
            )}
            <div>
                {isDefined(eventDetails?.wind_speed) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Wind speed"
                        value={eventDetails?.wind_speed}
                    />
                )}
                {isDefined(populationImpact) && (
                    <TextOutput
                        // FIXME: use translation
                        label="People Exposed / Potentiall Affected"
                        value={populationImpact}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
            </div>
            <div>
                {isDefined(eventDetails?.source) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Source"
                        value={eventDetails?.source}
                    />
                )}
                {isDefined(eventDetails?.sitrep) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Sitrep"
                        value={eventDetails?.sitrep}
                    />
                )}
                {isDefined(eventDetails?.mag) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Magnitude"
                        value={eventDetails?.mag}
                        valueType="number"
                    />
                )}
                {isDefined(eventDetails?.depth) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Depth (km)"
                        value={eventDetails?.depth}
                        valueType="number"
                    />
                )}
                {isDefined(eventDetails?.alert_level) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Alert Type"
                        value={eventDetails?.alert_level}
                    />
                )}
                {isDefined(eventDetails?.effective_date) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Effective"
                        value={eventDetails?.effective_date}
                        valueType="date"
                    />
                )}
                {isDefined(eventDetails?.from_date) && (
                    <TextOutput
                        // FIXME: use translation
                        label="From date"
                        value={eventDetails?.from_date}
                        valueType="date"
                    />
                )}
                {isDefined(eventDetails?.to_date) && (
                    <TextOutput
                        // FIXME: use translation
                        label="To date"
                        value={eventDetails?.to_date}
                        valueType="date"
                    />
                )}
            </div>
            <div>
                {isDefined(populationExposure?.exposure_60_kmh) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Exposure (60km/h)"
                        value={populationExposure?.exposure_60_kmh}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(populationExposure?.exposure_90_kmh) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Exposure (90km/h)"
                        value={populationExposure?.exposure_90_kmh}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(populationExposure?.exposure_120_kmh) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Exposure (120km/h)"
                        value={populationExposure?.exposure_120_kmh}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(eventDetails?.flood_area) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Flood Area"
                        value={eventDetails?.flood_area}
                        valueType="number"
                        suffix="hectares"
                    />
                )}
                {isDefined(eventDetails?.fl_croplnd) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Flood Cropland"
                        value={eventDetails?.fl_croplnd}
                        valueType="number"
                        suffix="hectares"
                    />
                )}
            </div>
        </Container>
    );
}

export default EventDetails;
