import { useMemo } from 'react';
import {
    Container,
    InfoPopup,
    KeyFigure,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { encodeDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { useQuery } from 'urql';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import Link from '#components/Link';
import { malawiRiskWatchAdminUrl } from '#config';
import { graphql } from '#generated/gql';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
import { FIELD_REPORT_STATUS_EVENT } from '#utils/constants';
import { type PartialFormValue } from '#views/FieldReportForm/common';

import ActivationTimeline from '../../malawi/ActivationTimeline';
import { buildActivationSteps } from '../../malawi/ActivationTimeline/utils';
import { DISASTER_FLOOD_ID } from '../../malawi/constants';
import { formatFloodExposureContext } from '../../malawi/useFloodExposure';
import useGoFieldReport from '../../malawi/useGoFieldReport';
import { type ArcEvent } from '../index';
import RainfallChart from './RainfallChart';

const ARC_TRIGGER_EVENT_QUERY = graphql(`
    query ArcTriggerEventForDate($date: Date!) {
      arcTriggerEvents(filters: { triggerDate: { exact: $date } }) {
        results {
          id
          triggerDate
          status
          affectedAdminAreas
        }
      }
    }
`);

// An ArcTriggerEvent counts as MRCS-confirmed once staff have confirmed it;
// sent / send_failed are post-confirmation notification states.
const MRCS_CONFIRMED_STATUSES = ['confirmed', 'sent', 'send_failed'];

type Props = RiskEventDetailProps<ArcEvent, ArcEvent[] | undefined>;

function buildDescription(data: ArcEvent) {
    const metrics = [
        isDefined(data.rainfall) ? `rainfall ${data.rainfall.toFixed(2)} mm` : undefined,
        isDefined(data.impact) ? `impact ${data.impact.toFixed(3)}` : undefined,
        isDefined(data.eventRp) ? `return period ${data.eventRp} years` : undefined,
    ].filter(isDefined);
    const observationLine = `ARC rainfall observation on ${data.observationDate} for ${data.adminAreaName}: ${metrics.join(', ')}.`;
    const exposureLine = isDefined(data.floodExposure)
        ? formatFloodExposureContext(data.floodExposure)
        : undefined;
    return [observationLine, exposureLine].filter(isDefined).join('\n');
}

function EventDetails(props: Props) {
    const {
        data,
        exposure,
        pending,
        children,
    } = props;

    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();
    const malawiCountry = useCountry({ iso3: 'MWI' });

    // Only rows with a rainfall value can be plotted; gate the chart on those.
    const rainfallTimeline = useMemo(
        () => exposure?.filter((d) => isDefined(d.rainfall)),
        [exposure],
    );

    // MRW trigger event for this observation date that covers this district —
    // drives the "MRCS confirmed" step and the review deep link.
    const [{ data: triggerEventData, fetching: pendingTriggerEvent }] = useQuery({
        query: ARC_TRIGGER_EVENT_QUERY,
        variables: { date: data.observationDate },
    });

    const triggerEvent = useMemo(
        () => triggerEventData?.arcTriggerEvents?.results?.find(
            (event) => event.affectedAdminAreas?.includes(Number(data.adminAreaMrwId)),
        ),
        [triggerEventData, data.adminAreaMrwId],
    );

    // GO field report (and its auto-generated emergency) created from this
    // observation row, matched via external_source / external_source_id.
    const {
        fieldReport: goFieldReport,
        pending: goFieldReportPending,
    } = useGoFieldReport('ARC', data.id, data.observationDate);

    const activationSteps = useMemo(() => buildActivationSteps([
        // FIXME: use strings
        { key: 'observed', label: 'Rainfall observed', completed: true },
        {
            key: 'trigger',
            label: 'Trigger threshold exceeded',
            completed: data.cellTrigger,
        },
        {
            key: 'confirmed',
            label: 'MRCS confirmed',
            completed: isDefined(triggerEvent)
                && MRCS_CONFIRMED_STATUSES.includes(triggerEvent.status),
        },
        {
            key: 'report',
            label: 'Field report created',
            completed: isDefined(goFieldReport),
        },
        {
            key: 'dref',
            // FIXME: use strings
            // TODO: derive completion from GO DREF data once the linkage exists.
            label: 'DREF launched',
            completed: false,
        },
    ]), [data.cellTrigger, triggerEvent, goFieldReport]);

    // Deep link to the trigger event's review page; only relevant while the
    // event is still pending MRCS review.
    const reviewEventUrl = useMemo(() => {
        if (isNotDefined(triggerEvent)) {
            return undefined;
        }
        const adminBase = malawiRiskWatchAdminUrl.endsWith('/')
            ? malawiRiskWatchAdminUrl
            : `${malawiRiskWatchAdminUrl}/`;
        return `${adminBase}pipeline/arctriggerevent/${triggerEvent.id}/change/`;
    }, [triggerEvent]);

    const showReviewEventLink = isDefined(reviewEventUrl)
        && triggerEvent?.status === 'pending_review';

    const canCreateReport = isAuthenticated && !isGuestUser;
    const initialReportValue: PartialFormValue | undefined = (
        malawiCountry?.id && data.districtId
            ? {
                status: FIELD_REPORT_STATUS_EVENT,
                country: malawiCountry.id,
                dtype: DISASTER_FLOOD_ID,
                districts: [data.districtId],
                start_date: encodeDate(data.observationDate),
                // FIXME: use strings
                title: `Flood observation — ${data.adminAreaName}`,
                description: buildDescription(data),
                // The edit flow treats a non-empty description as consented
                // (see FieldReportForm/index.tsx); mirror that here so the
                // prefilled overview doesn't land in a locked editor.
                situationalOverviewConsented: true,
                external_source: 'ARC',
                external_source_id: data.id,
            }
            : undefined
    );

    return (
        <Container pending={pending}>
            <ListView layout="block" spacing="xs">
                <TextOutput
                    // FIXME: use strings
                    label="Observation date"
                    value={data.observationDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                {rainfallTimeline && rainfallTimeline.length > 1 && (
                    <Container
                        // FIXME: use strings
                        heading="Rainfall history"
                        headingLevel={5}
                        withBackground
                        withPadding
                    >
                        <RainfallChart
                            timeline={rainfallTimeline}
                            activeObservationDate={data.observationDate}
                        />
                    </Container>
                )}
                <Container
                    // FIXME: use strings
                    heading="Rainfall observation"
                    headingLevel={5}
                    withBackground
                    withPadding
                    spacing="sm"
                    headerActions={(
                        <InfoPopup
                            // FIXME: use strings
                            title="Rainfall observation"
                            description={(
                                <ListView layout="block" spacing="2xs">
                                    <div>
                                        Daily ARC satellite-derived rainfall for this district.
                                        Impact is a derived metric (rainfall × an impact factor)
                                        used for the parametric trigger.
                                    </div>
                                    <div>
                                        The return period estimates how rare the observed
                                        rainfall is, in years.
                                    </div>
                                </ListView>
                            )}
                        />
                    )}
                >
                    <ListView
                        withSpaceBetweenContents
                        withWrap
                    >
                        {isDefined(data.rainfall) && (
                            <KeyFigure
                                // FIXME: use strings
                                label="Rainfall (mm)"
                                value={data.rainfall}
                                valueType="number"
                                valueOptions={{ maximumFractionDigits: 2 }}
                                size="sm"
                            />
                        )}
                        {isDefined(data.rainfallRaw) && (
                            <KeyFigure
                                // FIXME: use strings
                                label="Raw (mm)"
                                value={data.rainfallRaw}
                                valueType="number"
                                valueOptions={{ maximumFractionDigits: 2 }}
                                size="sm"
                            />
                        )}
                        {isDefined(data.impact) && (
                            <KeyFigure
                                // FIXME: use strings
                                label="Impact"
                                value={data.impact}
                                valueType="number"
                                valueOptions={{ maximumFractionDigits: 3 }}
                                size="sm"
                            />
                        )}
                        {isDefined(data.eventRp) && (
                            <KeyFigure
                                // FIXME: use strings
                                label="Return period (yrs)"
                                value={data.eventRp}
                                valueType="number"
                                size="sm"
                            />
                        )}
                    </ListView>
                </Container>
                {isDefined(data.floodExposure) && (
                    <Container
                        // FIXME: use strings
                        heading="District flood-exposed population"
                        headingLevel={5}
                        withBackground
                        withPadding
                        spacing="sm"
                        headerActions={(
                            <InfoPopup
                                // FIXME: use strings
                                title="District flood-exposed population"
                                description={(
                                    <ListView layout="block" spacing="2xs">
                                        <div>
                                            HDX 1-in-100-year (RP100) flood-exposed population at
                                            30 cm depth, for the whole district.
                                        </div>
                                        <div>
                                            Static district-wide baseline — not matched to this
                                            rainfall observation. The groups overlap and are not
                                            additive.
                                        </div>
                                    </ListView>
                                )}
                            />
                        )}
                    >
                        <ListView
                            withSpaceBetweenContents
                            withWrap
                        >
                            {isDefined(data.floodExposure.popU15) && (
                                <KeyFigure
                                    // FIXME: use strings
                                    label="Under-15"
                                    value={data.floodExposure.popU15}
                                    valueType="number"
                                    valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                    size="sm"
                                />
                            )}
                            {isDefined(data.floodExposure.elderly) && (
                                <KeyFigure
                                    // FIXME: use strings
                                    label="Elderly (65+)"
                                    value={data.floodExposure.elderly}
                                    valueType="number"
                                    valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                    size="sm"
                                />
                            )}
                            {isDefined(data.floodExposure.female) && (
                                <KeyFigure
                                    // FIXME: use strings
                                    label="Female"
                                    value={data.floodExposure.female}
                                    valueType="number"
                                    valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                    size="sm"
                                />
                            )}
                            {isDefined(data.floodExposure.childrenU5) && (
                                <KeyFigure
                                    // FIXME: use strings
                                    label="Under-5"
                                    value={data.floodExposure.childrenU5}
                                    valueType="number"
                                    valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                    size="sm"
                                />
                            )}
                        </ListView>
                    </Container>
                )}
                <Container
                    // FIXME: use strings
                    heading="Activation status"
                    headingLevel={5}
                    withBackground
                    withPadding
                    spacing="sm"
                    pending={goFieldReportPending || pendingTriggerEvent}
                >
                    <ActivationTimeline steps={activationSteps} />
                </Container>
                {canCreateReport && (
                    <ListView
                        spacing="sm"
                        withWrap
                    >
                        <Link
                            to="fieldReportFormNew"
                            state={initialReportValue
                                ? { initialValue: initialReportValue }
                                : undefined}
                            disabled={!initialReportValue}
                            styleVariant="filled"
                            colorVariant="primary"
                            withLinkIcon
                        >
                            {/* FIXME: use strings */}
                            Create field report
                        </Link>
                        {showReviewEventLink && (
                            <Link
                                href={reviewEventUrl}
                                external
                                withLinkIcon
                                styleVariant="outline"
                                colorVariant="primary"
                            >
                                {/* FIXME: use strings */}
                                Review event
                            </Link>
                        )}
                    </ListView>
                )}
                {children && <div />}
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
