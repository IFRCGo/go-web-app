import { isNotDefined, isDefined } from '@togglecorp/fujs';
import type { paths, components } from '#generated/types';

type PerPhase = components['schemas']['PhaseEnum'];

export const PER_PHASE_OVERVIEW = 1 satisfies PerPhase;
export const PER_PHASE_ASSESSMENT = 2 satisfies PerPhase;
export const PER_PHASE_PRIORITIZATION = 3 satisfies PerPhase;
export const PER_PHASE_WORKPLAN = 4 satisfies PerPhase;
export const PER_PHASE_ACTION = 5 satisfies PerPhase;

type PerProcessStatusResponse = paths['/api/v2/per-process-status/{id}/']['get']['responses']['200']['content']['application/json'];

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
