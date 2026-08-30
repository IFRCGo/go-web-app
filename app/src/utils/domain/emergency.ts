import { sumSafe } from '@ifrc-go/ui/utils';
import {
    compareDate,
    isDefined,
    isNotDefined,
    max,
} from '@togglecorp/fujs';

import { type components } from '#generated/types';
import { DREF_TYPE_IMMINENT } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

type EmergencyStage = components['schemas']['ApiEmergencyStageEnumKey'];
export const STAGE_EMERGENCY_APPEAL = 1 satisfies EmergencyStage;
export const STAGE_DREF_APPLICATION = 2 satisfies EmergencyStage;
export const STAGE_OPERATIONAL_UPDATE = 3 satisfies EmergencyStage;
export const STAGE_FINAL_REPORT = 4 satisfies EmergencyStage;
export const STAGE_FIELD_REPORT = 5 satisfies EmergencyStage;
export const STAGE_DREF_APPEAL_ONLY = 6 satisfies EmergencyStage;

// NOTE: ordering on /api/v2/event/ replaces the server's default ordering
// with just the requested column, which is mostly empty or duplicate values,
// so we add a fallback ordering to keep the pages deterministic
// FIXME(frozenhelium): go-api, add a deterministic ordering fallback
// (e.g. -disaster_start_date, id) with nulls/empty-last handling for the
// ordering on /api/v2/event/ and remove this client-side fallback
const defaultEventOrdering = '-disaster_start_date';
export function getEventOrderingWithFallback(ordering: string | undefined) {
    // NOTE: '-id' is the initial ordering from useFilterState, which the
    // server does not support and silently ignores
    if (isNotDefined(ordering) || ordering === '-id') {
        return undefined;
    }

    if (ordering === 'disaster_start_date' || ordering === '-disaster_start_date') {
        return [ordering, '-created_at'].join(',');
    }

    return [ordering, defaultEventOrdering, '-created_at'].join(',');
}

export function getNumAffected(event: EventListItem) {
    const latestFieldReport = max(
        event.field_reports,
        (fieldReport) => new Date(fieldReport.updated_at).getTime(),
    );

    return sumSafe([
        event.num_affected,
        latestFieldReport?.num_affected,
    ]);
}

type EmergencyDetail = GoApiResponse<'/api/v2/emergency/{id}/'>;

export function getEmergencyMeta(emergency: EmergencyDetail | undefined) {
    if (isNotDefined(emergency)) {
        return undefined;
    }

    const {
        disaster_start_date,
        appeal,
        dref,
        stage,
    } = emergency;

    // FIXME(frozenhelium): go-api, dref on the emergency detail response can
    // be null but the schema marks it non-nullable, so the optional chaining
    // below is not enforced by the types

    // total_dref_allocation on a revision includes allocations granted after
    // the application
    const amountRequested = stage === STAGE_DREF_APPLICATION
        && dref?.type_of_dref === DREF_TYPE_IMMINENT
        ? dref?.total_cost
        : dref?.final_report_details?.total_dref_allocation
            ?? dref?.operational_update_details?.total_dref_allocation
            ?? dref?.amount_requested
            ?? appeal?.amount_requested
            ?? dref?.total_cost;

    const plannedInterventions = [
        dref?.final_report_details?.planned_interventions,
        dref?.operational_update_details?.planned_interventions,
        dref?.planned_interventions,
    ].find((interventions) => isDefined(interventions) && interventions.length > 0);

    const drefPlannedBudget = sumSafe(
        plannedInterventions?.map(({ budget }) => budget).filter(isDefined),
    ) ?? dref?.total_cost;

    const amountFunded = drefPlannedBudget ?? appeal?.amount_funded;

    const startDate = dref?.final_report_details?.operation_start_date
        ?? dref?.operational_update_details?.new_operational_start_date
        ?? dref?.date_of_approval
        ?? appeal?.start_date
        ?? disaster_start_date;

    const endDate = dref?.final_report_details?.operation_end_date
        ?? dref?.operational_update_details?.new_operational_end_date
        ?? dref?.end_date
        ?? appeal?.end_date;

    // a revision stores its targeted population in the field matching its
    // own dref type (imminent DREFs use people_targeted_with_early_actions
    // and convert to response in their first ops update), so read whichever
    // field the latest revision filled instead of branching on the base type
    const peopleTargeted = dref?.final_report_details?.total_targeted_population
        ?? dref?.final_report_details?.number_of_people_targeted
        ?? dref?.final_report_details?.people_targeted_with_early_actions
        ?? dref?.operational_update_details?.total_targeted_population
        ?? dref?.operational_update_details?.number_of_people_targeted
        ?? dref?.operational_update_details?.people_targeted_with_early_actions
        ?? dref?.total_targeted_population
        ?? dref?.people_targeted_with_early_actions
        ?? appeal?.num_beneficiaries;

    return {
        startDate,
        endDate,
        amountFunded,
        amountRequested,
        peopleTargeted,
    };
}

export type EmergencyDrefRevisionKind = 'application' | 'operational-update' | 'final-report';

// The base dref row is never mutated when an imminent operation converts to a
// response, so its type_of_dref records where the operation started and must
// not be used to decide what to render now.
export function getEmergencyDrefStrategy(emergency: EmergencyDetail | undefined) {
    const dref = emergency?.dref;
    if (isNotDefined(dref)) {
        return undefined;
    }

    const stage = emergency?.stage;
    const opsUpdate = dref.operational_update_details;
    const finalReport = dref.final_report_details;

    let revisionKind: EmergencyDrefRevisionKind = 'application';
    let plannedInterventions = dref.planned_interventions;
    let earlyActions = dref.proposed_action;
    let needsIdentified = dref.needs_identified;

    if (stage === STAGE_FINAL_REPORT && isDefined(finalReport)) {
        revisionKind = 'final-report';
        plannedInterventions = finalReport.planned_interventions;
        needsIdentified = finalReport.needs_identified;
        // the final report's own copy is where expenditure is recorded
        earlyActions = finalReport.proposed_action ?? dref.proposed_action;
    } else if ((stage === STAGE_FINAL_REPORT || stage === STAGE_OPERATIONAL_UPDATE)
        && isDefined(opsUpdate)
    ) {
        revisionKind = 'operational-update';
        plannedInterventions = opsUpdate.planned_interventions;
        needsIdentified = opsUpdate.needs_identified;
    }

    return {
        revisionKind,
        plannedInterventions: plannedInterventions ?? [],
        earlyActions: earlyActions ?? [],
        needsIdentified: needsIdentified ?? [],
        beganAsImminent: dref.type_of_dref === DREF_TYPE_IMMINENT,
        // only populated from an approved ops update, and stays populated at
        // final report stage, so this is exactly "converted to a response"
        hasApprovedOpsUpdate: isDefined(opsUpdate),
    };
}

export type EmergencyOperationType = 'imminent-dref' | 'response-dref' | 'emergency-appeal';

// stage names the last document to move the operation forward, not the type
// of operation, so it cannot be used for this.
// NOTE: Assessment and Loan DREFs report as a response, since the agreed
// vocabulary is only these three values.
export function getEmergencyOperationType(
    emergency: EmergencyDetail | undefined,
): EmergencyOperationType | undefined {
    const stage = emergency?.stage;

    if (stage === STAGE_EMERGENCY_APPEAL) {
        return 'emergency-appeal';
    }

    if (stage === STAGE_DREF_APPLICATION
        || stage === STAGE_OPERATIONAL_UPDATE
        || stage === STAGE_FINAL_REPORT
    ) {
        const strategy = getEmergencyDrefStrategy(emergency);

        // FIXME(frozenhelium): go-api, only an imminent v2 operation is
        // rewritten to a response on approval of its ops update, and the
        // emergency payload exposes neither is_dref_imminent_v2 nor the
        // revision's type_of_dref, so a legacy imminent operation reads as
        // converted here and in the anticipatory-phase checks on the pages
        return (strategy?.beganAsImminent && !strategy.hasApprovedOpsUpdate)
            ? 'imminent-dref'
            : 'response-dref';
    }

    // no approved application to read a type from; ERP-only DREF appeals are
    // response allocations
    if (stage === STAGE_DREF_APPEAL_ONLY) {
        return 'response-dref';
    }

    return undefined;
}

type AppealDocumentResponse = GoApiResponse<'/api/v2/appeal_document/'>;
type AppealDocument = NonNullable<AppealDocumentResponse['results']>[number];

// ERP names the same document differently across two naming generations
const APPLICATION_DOCUMENT_TYPES = new Set([
    'DREF Operation',
    'DREF/EAP Activation',
]);
const OPERATIONAL_UPDATE_DOCUMENT_TYPES = new Set([
    'DREF Operation Update',
    'DREF/EAP Update',
]);
const FINAL_REPORT_DOCUMENT_TYPES = new Set([
    'Preliminary DREF Operation Final Report',
    'DREF Operation Final Report',
    'DREF/EAP Final Report',
]);

function getDocumentUrl(document: AppealDocument | undefined) {
    return document?.document ?? document?.document_url ?? undefined;
}

export function getDrefAppealDocumentUrls(documents: AppealDocument[] | undefined) {
    const sortedDocuments = documents?.toSorted(
        (a, b) => compareDate(a.created_at, b.created_at),
    ) ?? [];

    const finalReports = sortedDocuments.filter(
        (document) => FINAL_REPORT_DOCUMENT_TYPES.has(document.type),
    );

    return {
        application: getDocumentUrl(
            sortedDocuments.find((document) => APPLICATION_DOCUMENT_TYPES.has(document.type)),
        ),
        // FIXME(frozenhelium): go-api, nothing ties an appeal document to the
        // revision it belongs to, so the nth update document is read as
        // Operational Update #n; a gap in ERP shifts every later one
        operationalUpdates: sortedDocuments
            .filter((document) => OPERATIONAL_UPDATE_DOCUMENT_TYPES.has(document.type))
            .map(getDocumentUrl),
        finalReport: getDocumentUrl(finalReports[finalReports.length - 1]),
    };
}

const DREF_SUMMARY_STATUS_SUCCESS = 300 satisfies components['schemas']['DrefSummaryStatusEnum'];

const DREF_SUMMARY_STATUS_PENDING = 100 satisfies components['schemas']['DrefSummaryStatusEnum'];
const DREF_SUMMARY_STATUS_PROCESSING = 200 satisfies components['schemas']['DrefSummaryStatusEnum'];

// NOTE: deliberately false for a null summary. The API serves null both while
// the generation task has yet to create the row and, permanently, for DREFs
// approved before summaries existed, so polling on null would never settle.
// The row is written as PROCESSING almost immediately, so this misses little.
export function isDrefSummaryInProgress(emergency: EmergencyDetail | undefined) {
    const status = emergency?.dref?.summary?.status;

    return status === DREF_SUMMARY_STATUS_PENDING
        || status === DREF_SUMMARY_STATUS_PROCESSING;
}

export type DrefSummarySource = components['schemas']['DrefSummarySourceEnum'];
export const DREF_SUMMARY_SOURCE_OPERATIONAL_UPDATE = 200 satisfies DrefSummarySource;
export const DREF_SUMMARY_SOURCE_FINAL_REPORT = 300 satisfies DrefSummarySource;

export function getDrefSummary(emergency: EmergencyDetail | undefined) {
    const summary = emergency?.dref?.summary;
    if (isNotDefined(summary) || summary.status !== DREF_SUMMARY_STATUS_SUCCESS) {
        return undefined;
    }
    return summary;
}
