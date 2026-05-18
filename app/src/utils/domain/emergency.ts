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

    const amountRequested = stage === STAGE_DREF_APPLICATION
        && dref.type_of_dref === DREF_TYPE_IMMINENT
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
