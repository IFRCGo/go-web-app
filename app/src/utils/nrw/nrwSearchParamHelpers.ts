/**
 * Helper functions related to URL search parameters used for the NRW map
 */

import { noCountrySelectedValue } from './nrwConstants';

// URL search parameter keys
export const countryParamsKey = 'c';
export const eventIdParamsKey = 'e';
export const mapZoomParamsKey = 'z';
export const mapCenterLatParamsKey = 'lat';
export const mapCenterLonParamsKey = 'lon';
export const adminParamsKey = 'a';
export const mapLayersParamsKey = 'l';

// Parse a numeric event ID from a URL search parameter string.
// Returns null if the value is missing, empty, or not a valid positive integer.
export function sanitizeEventIdParam(value: string | null | undefined): number | null {
    const cleanedValue = value?.trim() ?? '';
    if (cleanedValue === '') {
        return null;
    }
    const parsed = Number(cleanedValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

// Convert to uppercase and accept only 3 letter length codes
export function sanitizeCountryCode(value: string | null | undefined): string {
    const countryRegex = /^[A-Z]{3}$/;
    const cleanedValue = value?.trim().toUpperCase() ?? '';
    return countryRegex.test(cleanedValue) ? cleanedValue : noCountrySelectedValue;
}

function sanitizeFloatInRange(
    value: string | null | undefined,
    min: number,
    max: number,
): number | null {
    const cleanedValue = value?.trim() ?? '';
    if (cleanedValue === '') {
        return null;
    }

    const parsedValue = Number(cleanedValue);
    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    if (parsedValue < min || parsedValue > max) {
        return null;
    }

    return parsedValue;
}

export function sanitizeMapZoomParam(value: string | null | undefined): number | null {
    return sanitizeFloatInRange(value, 0, 24);
}

export function sanitizeMapLatitudeParam(value: string | null | undefined): number | null {
    return sanitizeFloatInRange(value, -90, 90);
}

export function sanitizeMapLongitudeParam(value: string | null | undefined): number | null {
    return sanitizeFloatInRange(value, -180, 180);
}

// Sanitize admin place code: alphanumeric only, uppercase, max 64 chars
export function sanitizeAdminCode(value: string | null | undefined): string {
    const maxLength = 64;
    const adminCodeRegex = /^[A-Z0-9]+$/;
    const cleanedValue = value?.trim().toUpperCase() ?? '';
    if (cleanedValue.length > maxLength) {
        return '';
    }
    return adminCodeRegex.test(cleanedValue) ? cleanedValue : '';
}

// Sanitize a single layer ID: alphanumeric, hyphens, and underscores allowed
function sanitizeLayerId(value: string): string {
    const maxLength = 100;
    const layerIdRegex = /^[A-Za-z0-9_-]+$/;
    const cleanedValue = value.trim();
    if (cleanedValue.length === 0 || cleanedValue.length > maxLength) {
        return '';
    }
    return layerIdRegex.test(cleanedValue) ? cleanedValue : '';
}

// Parse comma-separated layer IDs from URL param
// Returns empty array if value is null/undefined/empty
export function parseMapLayersParam(value: string | null | undefined): string[] {
    if (!value || value.trim() === '') {
        return [];
    }
    return value
        .split(',')
        .map(sanitizeLayerId)
        .filter((id) => id.length > 0);
}

// Serialize layer IDs array to comma-separated string for URL param
// Returns empty string if array is empty
export function serializeMapLayersParam(layerIds: string[]): string {
    return layerIds
        .map(sanitizeLayerId)
        .filter((id) => id.length > 0)
        .join(',');
}
