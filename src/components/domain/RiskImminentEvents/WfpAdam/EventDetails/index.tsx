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
import useTranslation from '#hooks/useTranslation';
import { isValidFeatureCollection, isValidPointFeature } from '#utils/domain/risk';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
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

    const strings = useTranslation(i18n);

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
                    label={strings.wfpEventDetailsPublishedOn}
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
                                // FIXME: Use percent function
                                style={{ height: `${100 * (point.windSpeed / maxWindSpeed)}%` }}
                                title={resolveToString(
                                    strings.wfpEventDetailsKm,
                                    {
                                        point: point.windSpeed,
                                        pontDate: point.date.toLocaleString(),
                                    },
                                )}
                            />
                        ),
                    )}
                </div>
            )}
            {isDefined(eventDetails)
                && (isDefined(eventDetails.url) || isDefined(eventDetails.dashboard_url)) && (
                <Container
                    heading={strings.wfpUsefulLinks}
                    headingLevel={5}
                    childrenContainerClassName={styles.usefulLinksContent}
                    spacing="compact"
                >
                    {isDefined(dashboardUrl) && (
                        <Link
                            href={dashboardUrl}
                            external
                            withLinkIcon
                        >
                            {strings.wfpDashboard}
                        </Link>
                    )}
                    {isDefined(eventDetails?.url) && (
                        <>
                            {isDefined(eventDetails.url.shakemap) && (
                                <Link
                                    href={eventDetails?.url.shakemap}
                                    external
                                    withLinkIcon
                                >
                                    {strings.wfpShakemap}
                                </Link>
                            )}
                            {isDefined(eventDetails.url.population) && (
                                <Link
                                    href={eventDetails.url.population}
                                    external
                                    withLinkIcon
                                >
                                    {strings.wfpPopulationTable}
                                </Link>
                            )}
                            {isDefined(eventDetails.url.wind) && (
                                <Link
                                    href={eventDetails.url.wind}
                                    external
                                    withLinkIcon
                                >
                                    {strings.wfpWind}
                                </Link>
                            )}
                            {isDefined(eventDetails.url.rainfall) && (
                                <Link
                                    href={eventDetails.url.rainfall}
                                    external
                                    withLinkIcon
                                >
                                    {strings.wfpRainfall}
                                </Link>
                            )}
                            {isDefined(eventDetails.url.shapefile) && (
                                <Link
                                    href={eventDetails.url.shapefile}
                                    external
                                    withLinkIcon
                                >
                                    {strings.wfpShapefile}
                                </Link>
                            )}
                        </>
                    )}
                </Container>
            )}
            <div>
                {isDefined(eventDetails?.wind_speed) && (
                    <TextOutput
                        label={strings.wfpWindSpeed}
                        value={eventDetails?.wind_speed}
                    />
                )}
                {isDefined(populationImpact) && (
                    <TextOutput
                        label={strings.wfpPeopleExposed}
                        value={populationImpact}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
            </div>
            <div>
                {isDefined(eventDetails?.source) && (
                    <TextOutput
                        label={strings.wfpSource}
                        value={eventDetails?.source}
                    />
                )}
                {isDefined(eventDetails?.sitrep) && (
                    <TextOutput
                        label={strings.wfpSitrep}
                        value={eventDetails?.sitrep}
                    />
                )}
                {isDefined(eventDetails?.mag) && (
                    <TextOutput
                        label={strings.wfpMagnitude}
                        value={eventDetails?.mag}
                        valueType="number"
                    />
                )}
                {isDefined(eventDetails?.depth) && (
                    <TextOutput
                        label={strings.wfpDepth}
                        value={eventDetails?.depth}
                        valueType="number"
                    />
                )}
                {isDefined(eventDetails?.alert_level) && (
                    <TextOutput
                        label={strings.wfpAlertType}
                        value={eventDetails?.alert_level}
                    />
                )}
                {isDefined(eventDetails?.effective_date) && (
                    <TextOutput
                        label={strings.wfpEffective}
                        value={eventDetails?.effective_date}
                        valueType="date"
                    />
                )}
                {isDefined(eventDetails?.from_date) && (
                    <TextOutput
                        label={strings.wfpFromDate}
                        value={eventDetails?.from_date}
                        valueType="date"
                    />
                )}
                {isDefined(eventDetails?.to_date) && (
                    <TextOutput
                        label={strings.wfpToDate}
                        value={eventDetails?.to_date}
                        valueType="date"
                    />
                )}
            </div>
            <div>
                {isDefined(populationExposure?.exposure_60_kmh) && (
                    <TextOutput
                        label={strings.wfpExposed60}
                        value={populationExposure?.exposure_60_kmh}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(populationExposure?.exposure_90_kmh) && (
                    <TextOutput
                        label={strings.wfpExposed90}
                        value={populationExposure?.exposure_90_kmh}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(populationExposure?.exposure_120_kmh) && (
                    <TextOutput
                        label={strings.wfpExposed120}
                        value={populationExposure?.exposure_120_kmh}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(eventDetails?.flood_area) && (
                    <TextOutput
                        label={strings.wfpFloodArea}
                        value={eventDetails?.flood_area}
                        valueType="number"
                        suffix="hectares"
                    />
                )}
                {isDefined(eventDetails?.fl_croplnd) && (
                    <TextOutput
                        label={strings.wfpFloodCropland}
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
