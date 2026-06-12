import { useMemo } from 'react';
import {
    Container,
    InfoPopup,
    KeyFigure,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { encodeDate } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import Link from '#components/Link';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
import { FIELD_REPORT_STATUS_EARLY_WARNING } from '#utils/constants';
import { type PartialFormValue } from '#views/FieldReportForm/common';

import ActivationTimeline from '../../malawi/ActivationTimeline';
import { buildActivationSteps } from '../../malawi/ActivationTimeline/utils';
import {
    DISASTER_FLOOD_ID,
    JBA_IMPACT_THRESHOLD,
} from '../../malawi/constants';
import { formatFloodExposureContext } from '../../malawi/useFloodExposure';
import useGoFieldReport from '../../malawi/useGoFieldReport';
import { type JbaEvent } from '../index';
import LeadTimeChart from './LeadTimeChart';

type Props = RiskEventDetailProps<JbaEvent, JbaEvent[] | undefined>;

function buildDescription(data: JbaEvent) {
    const leadDay = data.leadTimeDays ?? '?';
    const mean = Math.round(data.band5Mean).toLocaleString();
    const nonZero = isDefined(data.ensemblesNonzeroCount)
        ? ` (${data.ensemblesNonzeroCount} of 51 ensembles non-zero)`
        : '';
    const forecastLine = `JBA flood forecast (issued ${data.forecastIssueDate}) for ${data.adminAreaName} crosses the impact threshold at lead day ${leadDay}. Ensemble-mean population exposed: ${mean}${nonZero}.`;
    const exposureLine = isDefined(data.floodExposure)
        ? formatFloodExposureContext(data.floodExposure)
        : undefined;
    return [forecastLine, exposureLine].filter(isDefined).join('\n');
}

function EventDetails(props: Props) {
    const {
        data,
        exposure,
        pending,
        children,
    } = props;

    const activeLeadTimeDays = data.leadTimeDays ?? 0;

    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();
    const malawiCountry = useCountry({ iso3: 'MWI' });

    // GO field report (and its auto-generated emergency) created from this
    // forecast row, matched via external_source / external_source_id.
    const {
        fieldReport: goFieldReport,
        pending: goFieldReportPending,
    } = useGoFieldReport('JBA', data.id, data.forecastIssueDate);

    const activationSteps = useMemo(() => buildActivationSteps([
        // FIXME: use strings
        { key: 'issued', label: 'Forecast issued', completed: true },
        {
            key: 'threshold',
            // Always true today (markers are pre-filtered on the same
            // threshold); kept as a real check so the step stays correct if
            // the marker filter and threshold ever diverge.
            label: 'Impact threshold exceeded',
            completed: data.band5Mean >= JBA_IMPACT_THRESHOLD,
        },
        {
            key: 'report',
            label: 'Early warning report created',
            completed: isDefined(goFieldReport),
        },
        {
            key: 'dref',
            // FIXME: use strings
            // TODO: derive completion from GO DREF data once the linkage exists.
            label: 'Imminent DREF launched',
            completed: false,
        },
    ]), [data.band5Mean, goFieldReport]);

    const canCreateReport = isAuthenticated && !isGuestUser;
    const initialReportValue: PartialFormValue | undefined = (
        malawiCountry?.id && data.districtId
            ? {
                status: FIELD_REPORT_STATUS_EARLY_WARNING,
                country: malawiCountry.id,
                dtype: DISASTER_FLOOD_ID,
                districts: [data.districtId],
                start_date: encodeDate(data.forecastTargetDate),
                // FIXME: use strings
                title: `Flood forecast — ${data.adminAreaName}`,
                description: buildDescription(data),
                num_potentially_affected: Math.round(data.band5Mean),
                external_source: 'JBA',
                external_source_id: data.id,
            }
            : undefined
    );

    return (
        <Container pending={pending}>
            <ListView layout="block">
                <TextOutput
                    // FIXME: use strings
                    label="Target date"
                    value={data.forecastTargetDate}
                    valueType="date"
                />
                {exposure && exposure.length > 1 && (
                    <Container
                        // FIXME: use strings
                        heading="Forecast trajectory"
                        headingLevel={5}
                        withBackground
                        withPadding
                    >
                        <LeadTimeChart
                            timeline={exposure}
                            activeLeadTimeDays={activeLeadTimeDays}
                        />
                    </Container>
                )}
                <Container
                    // FIXME: use strings
                    heading="Forecast population exposed"
                    headingLevel={5}
                    withBackground
                    withPadding
                    spacing="sm"
                    headerActions={(
                        <InfoPopup
                            // FIXME: use strings
                            title="Forecast population exposed"
                            description={(
                                <ListView layout="block" spacing="2xs">
                                    <div>
                                        Ensemble statistics of the JBA-forecast population exposed
                                        to flooding, across the 51 ensemble members, for this
                                        district at the selected lead time.
                                    </div>
                                    <div>
                                        Mean and Median are central estimates. P75 and P90 are the
                                        75th and 90th percentiles — a P90 well above the mean means
                                        a minority of members predict much higher exposure. Max is
                                        the highest single member.
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
                        <KeyFigure
                            // FIXME: use strings
                            label="Mean"
                            value={data.band5Mean}
                            valueType="number"
                            valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                            size="sm"
                        />
                        {isDefined(data.band5Median) && (
                            <KeyFigure
                                label="Median"
                                value={data.band5Median}
                                valueType="number"
                                valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                size="sm"
                            />
                        )}
                        {isDefined(data.band5P75) && (
                            <KeyFigure
                                label="P75"
                                value={data.band5P75}
                                valueType="number"
                                valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                size="sm"
                            />
                        )}
                        {isDefined(data.band5P90) && (
                            <KeyFigure
                                label="P90"
                                value={data.band5P90}
                                valueType="number"
                                valueOptions={{ compact: true, maximumFractionDigits: 0 }}
                                size="sm"
                            />
                        )}
                        {isDefined(data.band5Max) && (
                            <KeyFigure
                                label="Max"
                                value={data.band5Max}
                                valueType="number"
                                valueOptions={{ compact: true, maximumFractionDigits: 0 }}
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
                                            forecast&apos;s footprint or lead time. The groups
                                            overlap and are not additive.
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
                {isDefined(data.ensemblesNonzeroCount) && (
                    <TextOutput
                        // FIXME: use strings
                        label="Ensembles with non-zero impact"
                        value={`${data.ensemblesNonzeroCount} of 51`}
                        strongValue
                        withLightBackground
                    />
                )}
                <Container
                    // FIXME: use strings
                    heading="Activation status"
                    headingLevel={5}
                    withBackground
                    withPadding
                    spacing="sm"
                    pending={goFieldReportPending}
                >
                    <ActivationTimeline steps={activationSteps} />
                </Container>
                {canCreateReport && (
                    <Link
                        to="fieldReportFormNew"
                        state={initialReportValue
                            ? { initialValue: initialReportValue }
                            : undefined}
                        disabled={!initialReportValue}
                        styleVariant="outline"
                        colorVariant="primary"
                        withLinkIcon
                    >
                        {/* FIXME: use strings */}
                        Create early warning report
                    </Link>
                )}
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
