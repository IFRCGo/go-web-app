import { DEFAULT_INVALID_TEXT } from '@ifrc-go/ui/utils';
import { isTruthyString } from '@togglecorp/fujs';

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

export function compareArrays(newArray: unknown[], oldArray: unknown[]): boolean {
    if (newArray.length !== oldArray.length) {
        return false;
    }
    return newArray.every((id) => oldArray.includes(id));
}

export function flattenObject<T extends Record<string, unknown>>(
    inputObject: T,
    prefix?: string,
): Record<string, unknown> {
    return Object.entries(inputObject).reduce((acc, [key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return { ...acc, ...flattenObject(value as Record<string, unknown>, newKey) };
        }
        return { ...acc, [newKey]: value };
    }, {} as Record<string, unknown>);
}

export function getLastSegment(str: string, delimiter: string) {
    const parts = str.split(delimiter);
    return parts[parts.length - 1];
}
