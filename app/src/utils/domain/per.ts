import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type components } from '#generated/types';
import { type GoApiResponse } from '#utils/restRequest';

type PerPhase = components<'read'>['schemas']['PerPerphasesEnumKey'];
type PerComponent = Pick<components<'read'>['schemas']['FormComponent'], 'title' | 'component_letter' | 'component_num'>;

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

export function getFormattedComponentName(component: PerComponent): string {
    const { component_num, component_letter, title } = component;

    const prefix = [component_num, component_letter].filter(isDefined).join(' ').trim();

    return `${prefix} : ${title}`;
}
