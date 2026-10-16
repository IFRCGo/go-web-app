import {
    Checklist,
    Container,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { APPEAL_TYPE_DREF } from '#components/domain/ActiveOperationMap/utils';
import Link from '#components/Link';
import { useRequest } from '#utils/restRequest';

import useGoFieldReport, {
    type ExternalSource,
    getExternalSourceId,
} from '../useGoFieldReport';

import i18n from './i18n.json';

interface ChecklistItem {
    key: string;
    label: string;
    completed: boolean;
    description?: React.ReactNode;
}

function stepKeySelector(step: ChecklistItem) {
    return step.key;
}
function stepLabelSelector(step: ChecklistItem) {
    return step.label;
}
function stepDescriptionSelector(step: ChecklistItem) {
    return step.description;
}
function noop() {}

interface Props {
    source: ExternalSource;
    pcode: string;
    recordDate: string;
    // Source-specific steps shown before the GO report step
    steps: ChecklistItem[];
    reportCreatedLabel: string;
    // Forecasts track the DREF, observed triggers track the emergency
    withDrefStep?: boolean;
    withEmergencyStep?: boolean;
}

function ActivationChecklist(props: Props) {
    const {
        source,
        pcode,
        recordDate,
        steps,
        reportCreatedLabel,
        withDrefStep,
        withEmergencyStep,
    } = props;

    const strings = useTranslation(i18n);
    const {
        fieldReport,
        pending: reportPending,
    } = useGoFieldReport(source, getExternalSourceId(pcode, recordDate), recordDate);

    const eventId = fieldReport?.event ?? undefined;
    const {
        response: event,
        pending: eventPending,
    } = useRequest({
        skip: !withDrefStep || isNotDefined(eventId),
        url: '/api/v2/event/{id}/',
        pathVariables: isDefined(eventId) ? { id: eventId } : undefined,
    });
    const drefLaunched = event?.appeals?.some(
        (appeal) => appeal.atype === APPEAL_TYPE_DREF,
    ) ?? false;
    const pending = reportPending || (withDrefStep && eventPending);

    const items: ChecklistItem[] = [
        ...steps,
        {
            key: 'report',
            label: reportCreatedLabel,
            completed: isDefined(fieldReport),
            description: isDefined(fieldReport) && (
                <Link
                    to="fieldReportDetails"
                    urlParams={{ fieldReportId: fieldReport.id }}
                    withUnderline
                >
                    {strings.activationChecklistViewReport}
                </Link>
            ),
        },
        ...(withEmergencyStep ? [{
            key: 'emergency',
            label: strings.activationChecklistEmergencyCreated,
            completed: isDefined(eventId),
            description: isDefined(eventId) && (
                <Link
                    to="emergenciesLayout"
                    urlParams={{ emergencyId: eventId }}
                    withUnderline
                >
                    {strings.activationChecklistViewEmergency}
                </Link>
            ),
        }] : []),
        ...(withDrefStep ? [{
            key: 'dref',
            label: strings.activationChecklistDrefLaunched,
            completed: drefLaunched,
        }] : []),
    ];

    return (
        <Container
            heading={strings.activationChecklistHeading}
            headingLevel={5}
            pending={pending}
            withBackground
            withPadding
        >
            <Checklist
                name={undefined}
                options={items}
                keySelector={stepKeySelector}
                labelSelector={stepLabelSelector}
                descriptionSelector={stepDescriptionSelector}
                value={items.filter((item) => item.completed).map(stepKeySelector)}
                onChange={noop}
                checkListLayout="block"
                readOnly
            />
        </Container>
    );
}

export default ActivationChecklist;
