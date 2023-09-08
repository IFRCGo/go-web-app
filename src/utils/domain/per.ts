import { isNotDefined, isDefined } from '@togglecorp/fujs';
import { type GoApiResponse } from '#utils/restRequest';
import { type components } from '#generated/types';

type PerPhase = components<'read'>['schemas']['PhaseEnum'];

export const PER_PHASE_OVERVIEW = 1 satisfies PerPhase;
export const PER_PHASE_ASSESSMENT = 2 satisfies PerPhase;
export const PER_PHASE_PRIORITIZATION = 3 satisfies PerPhase;
export const PER_PHASE_WORKPLAN = 4 satisfies PerPhase;
export const PER_PHASE_ACTION = 5 satisfies PerPhase;

type PerProcessStatusResponse = GoApiResponse<'/api/v2/per-process-status/{id}/'>;

export function getCurrentPerProcessStep(status: PerProcessStatusResponse | undefined) {
    if (isNotDefined(status)) {
        return undefined;
    }

    if (isDefined(status.workplan)) {
        return PER_PHASE_WORKPLAN;
    }

    if (isDefined(status.prioritization)) {
        return PER_PHASE_PRIORITIZATION;
    }

    if (isDefined(status.assessment)) {
        return PER_PHASE_ASSESSMENT;
    }

    return PER_PHASE_OVERVIEW;
}
