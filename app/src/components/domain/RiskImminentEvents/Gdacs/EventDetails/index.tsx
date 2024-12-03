import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import Link from '#components/Link';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

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

type Props = RiskEventDetailProps<GdacsItem, GdacsExposure | undefined>;

function EventDetails(props: Props) {
    const {
        data: {
            event_details,
        },
        exposure,
        pending,
        children,
    } = props;

    const strings = useTranslation(i18n);

    const populationExposure = exposure?.population_exposure as GdacsPopulationExposure | undefined;
    const eventDetails = event_details as GdacsEventDetails | undefined;

    return (
        <Container
            contentViewType="vertical"
            spacing="cozy"
            withBorderAndHeaderBackground
            pending={pending}
        >
            <Container
                contentViewType="vertical"
                spacing="compact"
            >
                {isDefined(eventDetails?.source) && (
                    <TextOutput
                        label={strings.eventSourceLabel}
                        value={eventDetails?.source}
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(populationExposure?.death) && (
                    <TextOutput
                        label={strings.eventDeathLabel}
                        value={populationExposure?.death}
                        maximumFractionDigits={2}
                        compact
                        valueType="number"
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(populationExposure?.displaced) && (
                    <TextOutput
                        label={strings.eventDisplacedLabel}
                        value={populationExposure?.displaced}
                        maximumFractionDigits={2}
                        compact
                        valueType="number"
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(populationExposure?.exposed_population) && (
                    <TextOutput
                        label={strings.eventPopulationLabel}
                        value={populationExposure?.exposed_population}
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(populationExposure?.people_affected) && (
                    <TextOutput
                        label={strings.eventPeopleAffectedLabel}
                        value={populationExposure?.people_affected}
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(populationExposure?.impact) && (
                    <TextOutput
                        label={strings.eventImpactLabel}
                        value={populationExposure?.impact}
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(eventDetails?.severitydata)
                    && (isDefined(eventDetails) && (eventDetails?.eventtype) && !(eventDetails.eventtype === 'FL')) && (
                    <TextOutput
                        label={strings.eventSeverityLabel}
                        value={eventDetails?.severitydata?.severitytext}
                        strongValue
                        withBackground
                    />
                )}
                {isDefined(eventDetails?.alertlevel) && (
                    <TextOutput
                        label={strings.eventAlertType}
                        value={eventDetails?.alertlevel}
                        strongValue
                        withBackground
                    />
                )}
            </Container>
            {isDefined(eventDetails)
                && isDefined(eventDetails.url)
                && isDefined(eventDetails.url.report)
                && (
                    <Link
                        href={eventDetails?.url.report}
                        external
                        withLinkIcon
                    >
                        {strings.eventMoreDetailsLink}
                    </Link>
                )}
            {/* NOTE: Intentional additional div to maintain gap */}
            {children && <div />}
            {children}
        </Container>
    );
}

export default EventDetails;
