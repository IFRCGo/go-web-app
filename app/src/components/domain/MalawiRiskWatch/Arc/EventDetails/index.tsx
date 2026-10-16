import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import { FIELD_REPORT_STATUS_EVENT } from '#utils/constants';

import ActivationChecklist from '../../ActivationChecklist';
import { ARC_CONFIRMED_STATUSES } from '../../constants';
import CreateReportLink from '../../CreateReportLink';
import { type ArcDistrictEvent } from '../utils';

import i18n from './i18n.json';

type Props = RiskEventDetailProps<ArcDistrictEvent, undefined>;

function EventDetails(props: Props) {
    const {
        data,
        children,
    } = props;

    const strings = useTranslation(i18n);

    const { observation, adminArea } = data;
    const { impact } = observation;

    // The review belongs to the national event, shown here for the districts it covers
    let reviewLabel: string | undefined;
    if (isDefined(data.triggerEventStatus)) {
        if (ARC_CONFIRMED_STATUSES.includes(data.triggerEventStatus)) {
            reviewLabel = strings.arcActivationReviewConfirmed;
        } else if (data.triggerEventStatus === 'rejected') {
            reviewLabel = strings.arcActivationReviewRejected;
        } else {
            reviewLabel = strings.arcActivationReviewPending;
        }
    }

    return (
        <Container>
            <ListView
                layout="block"
                spacing="xs"
            >
                <TextOutput
                    label={strings.arcEventDetailsObservationDate}
                    value={observation.observationDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                <TextOutput
                    label={strings.arcEventDetailsPopulationImpacted}
                    value={impact}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                    withLightBackground
                />
                <ActivationChecklist
                    source="ARC"
                    pcode={data.id}
                    recordDate={observation.observationDate}
                    steps={[
                        {
                            key: 'observed',
                            label: strings.arcActivationRainfallObserved,
                            completed: true,
                        },
                        {
                            key: 'trigger',
                            label: strings.arcActivationThresholdExceeded,
                            completed: observation.cellTrigger,
                        },
                        {
                            key: 'confirmed',
                            label: strings.arcActivationMrcsConfirmed,
                            completed: isDefined(data.triggerEventStatus)
                                && ARC_CONFIRMED_STATUSES.includes(data.triggerEventStatus),
                            description: reviewLabel,
                        },
                    ]}
                    reportCreatedLabel={strings.arcActivationReportCreated}
                    withEmergencyStep
                />
                <CreateReportLink
                    source="ARC"
                    status={FIELD_REPORT_STATUS_EVENT}
                    label={strings.arcEventDetailsCreateReport}
                    pcode={data.id}
                    recordDate={observation.observationDate}
                    adminArea={adminArea}
                    impact={impact}
                    startDate={observation.observationDate}
                    title={resolveToString(
                        strings.arcEventDetailsReportTitle,
                        { district: data.name },
                    )}
                    description={resolveToString(
                        strings.arcEventDetailsReportDescription,
                        {
                            date: formatDate(observation.observationDate) ?? '',
                            impact: formatNumber(Math.round(impact ?? 0)) ?? '',
                            district: data.name,
                        },
                    )}
                />
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
