import { isDefined } from '@togglecorp/fujs';
import type { paths } from '#generated/types';

export const PER_PHASE_OVERVIEW = 1;
export const PER_PHASE_ASSESSMENT = 2;
export const PER_PHASE_PRIORITIZATION = 3;
export const PER_PHASE_WORKPLAN = 4;
export const PER_PHASE_ACTION = 5;

type PerProcessStatusResponse = paths['/api/v2/per-process-status/{id}/']['get']['responses']['200']['content']['application/json'];

export function getCurrentPerProcessStep(status: PerProcessStatusResponse | undefined) {
    if (!status) {
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
