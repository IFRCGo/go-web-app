import { isDefined } from '@togglecorp/fujs';

export interface PerProcessStatusItem {
    assessment: number | null;
    prioritization: number | null;
    workplan: number | null;
    id: number;
    phase: number;
    phase_display: string;
}

export const STEP_OVERVIEW = 0;
export const STEP_ASSESSMENT = 1;
export const STEP_PRIORITIZATION = 2;
export const STEP_WORKPLAN = 3;

export function getCurrentPerProcessStep(status: PerProcessStatusItem | undefined) {
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
