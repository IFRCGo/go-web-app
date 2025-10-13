import { type Language } from '@ifrc-go/ui/contexts';
import { DEFAULT_INVALID_TEXT } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import type { GoApiResponse } from '#utils/restRequest';

type SearchResponse = GoApiResponse<'/api/v1/search/'>;

type SearchResponseKeys = keyof SearchResponse;

export const defaultRanking: Record<SearchResponseKeys, number> = {
    regions: 1,
    countries: 2,
    district_province_response: 3,

    emergencies: 4,
    projects: 5,
    surge_alerts: 6,
    surge_deployments: 7,
    reports: 8,
    rapid_response_deployments: 9,
};

export function downloadFile(
    blob: Blob,
    filename: string,
    fileExtension: string,
): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${fileExtension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// NOTE: these doesn't need to be translated
export const languageNameMap: Record<Language, string> = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    ar: 'عربي',
};

export function getFirstTruthyString(
    primaryStr: string | null | undefined,
    secondaryStr: string | null | undefined,
    invalidText = DEFAULT_INVALID_TEXT,
) {
    if (isTruthyString(primaryStr)) {
        return primaryStr;
    }

    if (isTruthyString(secondaryStr)) {
        return secondaryStr;
    }

    return invalidText;
}

export function joinStrings(
    values: (string | undefined)[],
    separator: string = ', ',
): string {
    return values.filter(Boolean).join(separator);
}

export function formatSourceLink(value: string | undefined): string | undefined {
    if (
        isNotDefined(value)
            || value.startsWith('http://')
            || value.startsWith('https://')
            || value === 'h'
            || value === 'ht'
            || value === 'htt'
            || value === 'http'
            || value === 'http:'
            || value === 'http:/'
            || value === 'https'
            || value === 'https:'
            || value === 'https:/'
    ) {
        return value;
    }

    return `https://${value}`;
}

export function lengthSmallerOrEqualToCondition(x?: number) {
    return (value: string | undefined) => (
        (isDefined(value) && isDefined(x)) && value.length > x
            ? `Length must be smaller or equal to ${x}`
            : undefined
    );
}
