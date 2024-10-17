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
    return `${prefix}: ${title}`;
}

export const PER_FALLBACK_COLOR = 'var(--go-ui-color-gray-40)';

export type PerRatingValue = 0 | 1 | 2 | 3 | 4 | 5;
const PER_RATING_VALUE_NOT_REVIEWED = 0 satisfies PerRatingValue;
const PER_RATING_VALUE_DOES_NOT_EXIST = 1 satisfies PerRatingValue;
const PER_RATING_VALUE_PARTIALLY_EXISTS = 2 satisfies PerRatingValue;
const PER_RATING_VALUE_NEEDS_IMPROVEMENT = 3 satisfies PerRatingValue;
const PER_RATING_VALUE_EXISTS_COULD_BE_STRENGTHENED = 4 satisfies PerRatingValue;
const PER_RATING_VALUE_HIGH_PERFORMANCE = 5 satisfies PerRatingValue;

const perRatingColorMap: Record<PerRatingValue, string> = {
    [PER_RATING_VALUE_HIGH_PERFORMANCE]: 'var(--go-ui-color-dark-blue-40)',
    [PER_RATING_VALUE_EXISTS_COULD_BE_STRENGTHENED]: 'var(--go-ui-color-dark-blue-30)',
    [PER_RATING_VALUE_NEEDS_IMPROVEMENT]: 'var(--go-ui-color-dark-blue-20)',
    [PER_RATING_VALUE_PARTIALLY_EXISTS]: 'var(--go-ui-color-dark-blue-10)',
    [PER_RATING_VALUE_DOES_NOT_EXIST]: 'var(--go-ui-color-gray-40)',
    [PER_RATING_VALUE_NOT_REVIEWED]: 'var(--go-ui-color-gray-30)',
};

export function getPerRatingColor(value: number | undefined) {
    if (isDefined(value)) {
        return perRatingColorMap[value as PerRatingValue] ?? PER_FALLBACK_COLOR;
    }
    return PER_FALLBACK_COLOR;
}
export function perRatingColorSelector(item: { value: number | undefined }) {
    return getPerRatingColor(item.value);
}

export type PerAreaNumber = 1 | 2 | 3 | 4 | 5;
const PER_AREA_NUMBER_1 = 1 satisfies PerAreaNumber;
const PER_AREA_NUMBER_2 = 2 satisfies PerAreaNumber;
const PER_AREA_NUMBER_3 = 3 satisfies PerAreaNumber;
const PER_AREA_NUMBER_4 = 4 satisfies PerAreaNumber;
const PER_AREA_NUMBER_5 = 5 satisfies PerAreaNumber;

const perAreaColorMap: Record<PerAreaNumber, string> = {
    [PER_AREA_NUMBER_1]: 'var(--go-ui-color-purple-per)',
    [PER_AREA_NUMBER_2]: 'var(--go-ui-color-orange-per)',
    [PER_AREA_NUMBER_3]: 'var(--go-ui-color-blue-per)',
    [PER_AREA_NUMBER_4]: 'var(--go-ui-color-teal-per)',
    [PER_AREA_NUMBER_5]: 'var(--go-ui-color-red-per)',
};

export function getPerAreaColor(value: number | undefined) {
    if (isDefined(value)) {
        return perAreaColorMap[value as PerAreaNumber] ?? PER_FALLBACK_COLOR;
    }
    return PER_FALLBACK_COLOR;
}
export function perAreaColorSelector(item: {
    value: number | undefined;
}) {
    return getPerAreaColor(item.value);
}

type PerBenchmarkId = 1 | 2 | 5;
const PER_BENCHMARK_YES = 1 satisfies PerBenchmarkId;
const PER_BENCHMARK_NO = 2 satisfies PerBenchmarkId;
const PER_BENCHMARK_PARTIALLY_EXISTS = 5 satisfies PerBenchmarkId;

const perBenchmarkColorMap: Record<PerBenchmarkId, string> = {
    [PER_BENCHMARK_YES]: 'var(--go-ui-color-dark-blue-40)',
    [PER_BENCHMARK_NO]: 'var(--go-ui-color-dark-blue-30)',
    [PER_BENCHMARK_PARTIALLY_EXISTS]: 'var(--go-ui-color-dark-blue-10)',
};

export function getPerBenchmarkColor(id: number | undefined) {
    return perBenchmarkColorMap[id as PerBenchmarkId] ?? PER_FALLBACK_COLOR;
}
export function perBenchmarkColorSelector(item: {
    id: number;
    label: string;
    count: number;
}) {
    return getPerBenchmarkColor(item.id);
}
