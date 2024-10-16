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

export const perRatingColors = [
    'var(--go-ui-color-dark-blue-40)',
    'var(--go-ui-color-dark-blue-30)',
    'var(--go-ui-color-dark-blue-20)',
    'var(--go-ui-color-dark-blue-10)',
    'var(--go-ui-color-gray-40)',
    'var(--go-ui-color-gray-30)',
];

export const perRatingColorMap: {
    [key: string]: string;
} = {
    5: 'var(--go-ui-color-dark-blue-40)',
    4: 'var(--go-ui-color-dark-blue-30)',
    3: 'var(--go-ui-color-dark-blue-20)',
    2: 'var(--go-ui-color-dark-blue-10)',
    1: 'var(--go-ui-color-gray-40)',
    0: 'var(--go-ui-color-gray-30)',
};

export const perAreaColorMap: { [key: number]: string } = {
    1: 'var(--go-ui-color-purple-per)',
    2: 'var(--go-ui-color-orange-per)',
    3: 'var(--go-ui-color-blue-per)',
    4: 'var(--go-ui-color-teal-per)',
    5: 'var(--go-ui-color-red-per)',
};

export const perBenchmarkColorMap: {
    [key: string]: string;
} = {
    1: 'var(--go-ui-color-dark-blue-40)',
    2: 'var(--go-ui-color-dark-blue-30)',
    5: 'var(--go-ui-color-dark-blue-10)',
};

export function perRatingColorSelector(item: {
    value: number;
}) {
    return perRatingColorMap[item.value];
}

export function perBenchmarkColorSelector(item: {
    id: number;
    label: string;
    count: number;
}) {
    return perBenchmarkColorMap[item.id];
}

export const PER_FALLBACK_COLOR = 'var(--go-ui-color-gray-40)';
