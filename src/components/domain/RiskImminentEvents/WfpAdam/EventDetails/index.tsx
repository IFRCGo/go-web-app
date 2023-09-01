import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import { roundSafe } from '#utils/common';
import { type RiskApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

type WfpAdamResponse = RiskApiResponse<'/api/v1/adam-exposure/'>;
type WfpAdamItem = NonNullable<WfpAdamResponse['results']>[number];
type WfpAdamExposure = RiskApiResponse<'/api/v1/adam-exposure/{id}/exposure/'>;

interface WfpAdamPopulationExposure {
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
    'exposure_60km/h'?: number;
    'exposure_90km/h'?: number;
    'exposure_120km/h'?: number;
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

    const {
        from_date,
        to_date,
        population_impact,
        population,
        depth,
        wind_speed,
        effective_date,
        dashboard_url,
        alert_level,
        flood_area,
        fl_croplnd,
        source,
        sitrep,
        url,
        mag,
        'exposure_60km/h': exposure_60,
        'exposure_90km/h': exposure_90,
        'exposure_120km/h': exposure_120,
        // FIXME: replace event_details with exposure
    } = ((
            exposure?.population_exposure ?? event_details
        ) as WfpAdamPopulationExposure | undefined) ?? {};

    const dashboardUrl = dashboard_url ?? url?.map;
    const populationImpact = roundSafe(population_impact) ?? roundSafe(population);

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
            {(isDefined(url) || isDefined(dashboard_url)) && (
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
                    {isDefined(url) && (
                        <>
                            {isDefined(url.shakemap) && (
                                <Link
                                    to={url.shakemap}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Shakemap
                                </Link>
                            )}
                            {isDefined(url.population) && (
                                <Link
                                    to={url.population}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Population table
                                </Link>
                            )}
                            {isDefined(url.wind) && (
                                <Link
                                    to={url.wind}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Wind
                                </Link>
                            )}
                            {isDefined(url.rainfall) && (
                                <Link
                                    to={url.rainfall}
                                    external
                                    withExternalLinkIcon
                                >
                                    {/* FIXME: use translation */}
                                    Rainfall
                                </Link>
                            )}
                            {isDefined(url.shapefile) && (
                                <Link
                                    to={url.shapefile}
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
            {isDefined(populationImpact) && (
                <TextOutput
                    // FIXME: use translation
                    label="People Exposed / Potentiall Affected"
                    value={populationImpact}
                    valueType="number"
                    maximumFractionDigits={0}
                />
            )}
            <div className={styles.exposureDetails}>
                {isDefined(source) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Source"
                        value={source}
                    />
                )}
                {isDefined(sitrep) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Sitrep"
                        value={sitrep}
                    />
                )}
                {isDefined(mag) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Magnitude"
                        value={mag}
                        valueType="number"
                    />
                )}
                {isDefined(depth) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Depth (km)"
                        value={depth}
                        valueType="number"
                    />
                )}
                {isDefined(alert_level) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Alert Type"
                        value={alert_level}
                    />
                )}
                {isDefined(effective_date) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Effective"
                        value={effective_date}
                        valueType="date"
                    />
                )}
                {isDefined(from_date) && (
                    <TextOutput
                        // FIXME: use translation
                        label="From date"
                        value={from_date}
                        valueType="date"
                    />
                )}
                {isDefined(to_date) && (
                    <TextOutput
                        // FIXME: use translation
                        label="To date"
                        value={to_date}
                        valueType="date"
                    />
                )}
                {isDefined(exposure_60) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Exposure (60km/h)"
                        value={exposure_60}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(exposure_90) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Exposure (90km/h)"
                        value={exposure_90}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(exposure_120) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Exposure (120km/h)"
                        value={exposure_120}
                        valueType="number"
                        maximumFractionDigits={0}
                    />
                )}
                {isDefined(flood_area) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Flood Area"
                        value={flood_area}
                        valueType="number"
                        suffix="hectares"
                    />
                )}
                {isDefined(fl_croplnd) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Flood Cropland"
                        value={fl_croplnd}
                        valueType="number"
                        suffix="hectares"
                    />
                )}
                {isDefined(wind_speed) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Wind speed"
                        value={wind_speed}
                    />
                )}
            </div>
        </Container>
    );
}

export default EventDetails;
