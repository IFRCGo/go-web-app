import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import { type RiskApiResponse } from '#utils/restRequest';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

type GdacsResponse = RiskApiResponse<'/api/v1/gdacs/'>;
type GdacsItem = NonNullable<GdacsResponse['results']>[number];
type GdacsExposure = RiskApiResponse<'/api/v1/gdacs/{id}/exposure/'>;

interface GdacsEventDetails {
    Class?: string;
    affectedcountries?: {
        iso3: string;
        countryname: string;
    }[];
    alertlevel?: string;
    alertscore?: number;
    country?: string;
    countryonland?: string;
    description?: string;
    episodealertlevel?: string;
    episodealertscore?: number;
    episodeid?: number;
    eventid?: number;
    eventname?: string;
    eventtype?: string;
    fromdate?: string;
    glide?: string;
    htmldescription?: string;
    icon?: string;
    iconoverall?: null,
    iscurrent?: string;
    iso3?: string;
    istemporary?: string;
    name?: string;
    polygonlabel?: string;
    todate?: string;
    severitydata?: {
        severity?: number;
        severitytext?: string;
        severityunit?: string;
    },
    source?: string;
    sourceid?: string;
    url?: {
        report?: string;
        details?: string;
        geometry?: string;
    },
}

interface GdacsPopulationExposure {
    death?: number;
    displaced?: number;
    exposed_population?: string;
    people_affected?: string;
    impact?: string;
}

interface Props {
    data: GdacsItem;
    exposure: GdacsExposure | undefined;
    pending: boolean;
}

function EventDetails(props: Props) {
    const {
        data: {
            hazard_name,
            start_date,
            event_details,
        },
        exposure,
        pending,
    } = props;

    const populationExposure = exposure?.population_exposure as GdacsPopulationExposure | undefined;
    const eventDetails = event_details as GdacsEventDetails | undefined;

    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={hazard_name}
            headingLevel={4}
            spacing="compact"
            headerDescription={(
                <TextOutput
                    // FIXME: use translation
                    label="Started on"
                    value={start_date}
                    valueType="date"
                    strongValue
                />
            )}
        >
            {pending && <BlockLoading />}
            {isDefined(eventDetails?.url) && (
                <Container
                    // FIXME: use translation
                    heading="Useful links:"
                    headingLevel={5}
                    childrenContainerClassName={styles.usefulLinksContent}
                    spacing="compact"
                >
                    {isDefined(eventDetails?.url.details) && (
                        <Link
                            href={eventDetails?.url.details}
                            external
                            withLinkIcon
                        >
                            {/* FIXME: use translation */}
                            More Details
                        </Link>
                    )}
                    {isDefined(eventDetails?.url.geometry) && (
                        <Link
                            href={eventDetails?.url.geometry}
                            external
                            withLinkIcon
                        >
                            {/* FIXME: use translation */}
                            Geometry
                        </Link>
                    )}
                    {isDefined(eventDetails?.url.report) && (
                        <Link
                            href={eventDetails?.url.report}
                            external
                            withLinkIcon
                        >
                            {/* FIXME: use translation */}
                            Report
                        </Link>
                    )}
                </Container>
            )}
            <div className={styles.eventDetails}>
                {isDefined(eventDetails?.source) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Source"
                        value={eventDetails?.source}
                    />
                )}
                {isDefined(populationExposure?.death) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Death"
                        value={populationExposure?.death}
                        valueType="number"
                    />
                )}
                {isDefined(populationExposure?.displaced) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Displaced"
                        value={populationExposure?.displaced}
                        valueType="number"
                    />
                )}
                {isDefined(populationExposure?.exposed_population) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Population exposed"
                        value={populationExposure?.exposed_population}
                    />
                )}
                {isDefined(populationExposure?.people_affected) && (
                    <TextOutput
                        // FIXME: use translation
                        label="People affected"
                        value={populationExposure?.people_affected}
                    />
                )}
                {isDefined(populationExposure?.impact) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Impact"
                        value={populationExposure?.impact}
                    />
                )}
                {isDefined(eventDetails?.severitydata) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Severity"
                        value={eventDetails?.severitydata?.severitytext}
                    />
                )}
            </div>
        </Container>
    );
}

export default EventDetails;
