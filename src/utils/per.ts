import { isDefined } from '@togglecorp/fujs';
import type { GET } from '#types/serverResponse';

export const STEP_OVERVIEW = 1;
export const STEP_ASSESSMENT = 2;
export const STEP_PRIORITIZATION = 3;
export const STEP_WORKPLAN = 4;

export function getCurrentPerProcessStep(status: GET['api/v2/per-process-status/:id'] | undefined) {
    if (!status) {
        return undefined;
    }

    if (isDefined(status.workplan)) {
        return STEP_WORKPLAN;
    }

    if (isDefined(status.prioritization)) {
        return STEP_PRIORITIZATION;
    }

    if (isDefined(status.assessment)) {
        return STEP_ASSESSMENT;
    }

    return STEP_OVERVIEW;
}
