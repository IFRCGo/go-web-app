import { sumSafe } from '@ifrc-go/ui/utils';
import {
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

    // Add default ordering as second ordering
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

    const amountRequested = stage === STAGE_DREF_APPLICATION
        && dref?.type_of_dref === DREF_TYPE_IMMINENT
        ? dref?.total_cost
        : dref?.amount_requested ?? appeal?.amount_requested ?? dref?.total_cost;

    const drefPlannedBudget = sumSafe(
        dref?.planned_interventions?.map(({ budget }) => budget).filter(isDefined),
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

    return {
        startDate,
        endDate,
        amountFunded,
        amountRequested,
    };
}
