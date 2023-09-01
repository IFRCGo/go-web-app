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

    const {
        death,
        displaced,
        exposed_population,
        people_affected,
        impact,
    } = (exposure?.population_exposure as GdacsPopulationExposure | undefined) ?? {};

    const {
        url,
        severitydata,
        source,
    } = (event_details as GdacsEventDetails | undefined) ?? {};

    // TODO: add exposure details
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
            {isDefined(url) && (
                <Container
                    // FIXME: use translation
                    heading="Useful links:"
                    headingLevel={5}
                    childrenContainerClassName={styles.usefulLinksContent}
                    spacing="compact"
                >
                    {isDefined(url.details) && (
                        <Link
                            to={url.details}
                            external
                            withExternalLinkIcon
                        >
                            {/* FIXME: use translation */}
                            More Details
                        </Link>
                    )}
                    {isDefined(url.geometry) && (
                        <Link
                            to={url.geometry}
                            external
                            withExternalLinkIcon
                        >
                            {/* FIXME: use translation */}
                            Geometry
                        </Link>
                    )}
                    {isDefined(url.report) && (
                        <Link
                            to={url.report}
                            external
                            withExternalLinkIcon
                        >
                            {/* FIXME: use translation */}
                            Report
                        </Link>
                    )}
                </Container>
            )}
            <div className={styles.eventDetails}>
                {isDefined(source) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Source"
                        value={source}
                    />
                )}
                {isDefined(death) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Death"
                        value={death}
                        valueType="number"
                    />
                )}
                {isDefined(displaced) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Displaced"
                        value={displaced}
                        valueType="number"
                    />
                )}
                {isDefined(exposed_population) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Population exposed"
                        value={exposed_population}
                    />
                )}
                {isDefined(people_affected) && (
                    <TextOutput
                        // FIXME: use translation
                        label="People affected"
                        value={people_affected}
                    />
                )}
                {isDefined(impact) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Impact"
                        value={impact}
                    />
                )}
                {isDefined(severitydata) && (
                    <TextOutput
                        // FIXME: use translation
                        label="Severity"
                        value={severitydata?.severitytext}
                    />
                )}
            </div>
        </Container>
    );
}

export default EventDetails;
