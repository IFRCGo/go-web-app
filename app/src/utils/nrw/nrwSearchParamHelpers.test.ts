import {
    describe,
    expect,
    test,
} from 'vitest';

import { noCountrySelectedValue } from './nrwConstants';
import {
    parseMapLayersParam,
    sanitizeAdminCode,
    sanitizeCountryCode,
    sanitizeMapLatitudeParam,
    sanitizeMapLongitudeParam,
    sanitizeMapZoomParam,
    serializeMapLayersParam,
} from './nrwSearchParamHelpers';

describe('nrwSearchParamHelpers', () => {
    describe('sanitizeCountryCode', () => {
        test('should accept valid 3-letter uppercase country codes', () => {
            expect(sanitizeCountryCode('KEN')).toBe('KEN');
            expect(sanitizeCountryCode('MWI')).toBe('MWI');
            expect(sanitizeCountryCode('ZWE')).toBe('ZWE');
        });

        test('should convert lowercase to uppercase', () => {
            expect(sanitizeCountryCode('ken')).toBe('KEN');
            expect(sanitizeCountryCode('mwi')).toBe('MWI');
        });

        test('should trim whitespace before validating', () => {
            expect(sanitizeCountryCode('  KEN  ')).toBe('KEN');
            expect(sanitizeCountryCode('\tMWI\n')).toBe('MWI');
        });

        test('should return noCountrySelectedValue for invalid codes', () => {
            expect(sanitizeCountryCode('US')).toBe(noCountrySelectedValue);
            expect(sanitizeCountryCode('KENA')).toBe(noCountrySelectedValue);
            expect(sanitizeCountryCode('1AB')).toBe(noCountrySelectedValue);
            expect(sanitizeCountryCode('ab#')).toBe(noCountrySelectedValue);
        });

        test('should return noCountrySelectedValue for null/undefined', () => {
            expect(sanitizeCountryCode(null)).toBe(noCountrySelectedValue);
            expect(sanitizeCountryCode(undefined)).toBe(noCountrySelectedValue);
        });

        test('should return noCountrySelectedValue for empty strings', () => {
            expect(sanitizeCountryCode('')).toBe(noCountrySelectedValue);
            expect(sanitizeCountryCode('   ')).toBe(noCountrySelectedValue);
        });
    });

    describe('sanitizeMapLatitudeParam', () => {
        test('should accept valid latitude values', () => {
            expect(sanitizeMapLatitudeParam('0')).toBe(0);
            expect(sanitizeMapLatitudeParam('45.5')).toBe(45.5);
            expect(sanitizeMapLatitudeParam('-45.5')).toBe(-45.5);
            expect(sanitizeMapLatitudeParam('90')).toBe(90);
            expect(sanitizeMapLatitudeParam('-90')).toBe(-90);
        });

        test('should reject latitudes outside valid range', () => {
            expect(sanitizeMapLatitudeParam('91')).toBeNull();
            expect(sanitizeMapLatitudeParam('-91')).toBeNull();
            expect(sanitizeMapLatitudeParam('180')).toBeNull();
            expect(sanitizeMapLatitudeParam('-180')).toBeNull();
        });

        test('should trim whitespace before validating', () => {
            expect(sanitizeMapLatitudeParam('  45.5  ')).toBe(45.5);
            expect(sanitizeMapLatitudeParam('\t-30\n')).toBe(-30);
        });

        test('should return null for non-numeric values', () => {
            expect(sanitizeMapLatitudeParam('abc')).toBeNull();
            expect(sanitizeMapLatitudeParam('45.5.5')).toBeNull();
            expect(sanitizeMapLatitudeParam('45abc')).toBeNull();
        });

        test('should return null for null/undefined', () => {
            expect(sanitizeMapLatitudeParam(null)).toBeNull();
            expect(sanitizeMapLatitudeParam(undefined)).toBeNull();
        });

        test('should return null for empty strings', () => {
            expect(sanitizeMapLatitudeParam('')).toBeNull();
            expect(sanitizeMapLatitudeParam('   ')).toBeNull();
        });

        test('should return null for infinity values', () => {
            expect(sanitizeMapLatitudeParam('Infinity')).toBeNull();
            expect(sanitizeMapLatitudeParam('-Infinity')).toBeNull();
        });
    });

    describe('sanitizeMapLongitudeParam', () => {
        test('should accept valid longitude values', () => {
            expect(sanitizeMapLongitudeParam('0')).toBe(0);
            expect(sanitizeMapLongitudeParam('120.5')).toBe(120.5);
            expect(sanitizeMapLongitudeParam('-120.5')).toBe(-120.5);
            expect(sanitizeMapLongitudeParam('180')).toBe(180);
            expect(sanitizeMapLongitudeParam('-180')).toBe(-180);
        });

        test('should reject longitudes outside valid range', () => {
            expect(sanitizeMapLongitudeParam('181')).toBeNull();
            expect(sanitizeMapLongitudeParam('-181')).toBeNull();
            expect(sanitizeMapLongitudeParam('360')).toBeNull();
        });

        test('should trim whitespace before validating', () => {
            expect(sanitizeMapLongitudeParam('  45.5  ')).toBe(45.5);
            expect(sanitizeMapLongitudeParam('\t-100\n')).toBe(-100);
        });

        test('should return null for non-numeric values', () => {
            expect(sanitizeMapLongitudeParam('abc')).toBeNull();
            expect(sanitizeMapLongitudeParam('45.5.5')).toBeNull();
        });

        test('should return null for null/undefined/empty', () => {
            expect(sanitizeMapLongitudeParam(null)).toBeNull();
            expect(sanitizeMapLongitudeParam(undefined)).toBeNull();
            expect(sanitizeMapLongitudeParam('')).toBeNull();
        });
    });

    describe('sanitizeMapZoomParam', () => {
        test('should accept valid zoom levels (0-24)', () => {
            expect(sanitizeMapZoomParam('0')).toBe(0);
            expect(sanitizeMapZoomParam('12')).toBe(12);
            expect(sanitizeMapZoomParam('24')).toBe(24);
        });

        test('should accept decimal zoom levels', () => {
            expect(sanitizeMapZoomParam('12.5')).toBe(12.5);
            expect(sanitizeMapZoomParam('5.25')).toBe(5.25);
        });

        test('should reject zoom levels outside 0-24 range', () => {
            expect(sanitizeMapZoomParam('-1')).toBeNull();
            expect(sanitizeMapZoomParam('25')).toBeNull();
            expect(sanitizeMapZoomParam('100')).toBeNull();
        });

        test('should trim whitespace before validating', () => {
            expect(sanitizeMapZoomParam('  12  ')).toBe(12);
        });

        test('should return null for invalid values', () => {
            expect(sanitizeMapZoomParam('abc')).toBeNull();
            expect(sanitizeMapZoomParam(null)).toBeNull();
            expect(sanitizeMapZoomParam('')).toBeNull();
        });
    });

    describe('sanitizeAdminCode', () => {
        test('should accept valid admin codes (alphanumeric, max 64 chars)', () => {
            expect(sanitizeAdminCode('ADMIN01')).toBe('ADMIN01');
            expect(sanitizeAdminCode('A1B2C3')).toBe('A1B2C3');
            expect(sanitizeAdminCode('12345')).toBe('12345');
        });

        test('should convert lowercase to uppercase', () => {
            expect(sanitizeAdminCode('admin01')).toBe('ADMIN01');
            expect(sanitizeAdminCode('aBc123')).toBe('ABC123');
        });

        test('should trim whitespace before validating', () => {
            expect(sanitizeAdminCode('  ADMIN01  ')).toBe('ADMIN01');
            expect(sanitizeAdminCode('\tA1\n')).toBe('A1');
        });

        test('should reject codes with invalid characters', () => {
            expect(sanitizeAdminCode('ADMIN-01')).toBe('');
            expect(sanitizeAdminCode('ADMIN_01')).toBe('');
            expect(sanitizeAdminCode('ADMIN#01')).toBe('');
            expect(sanitizeAdminCode('ADMIN 01')).toBe('');
        });

        test('should reject codes exceeding 64 characters', () => {
            const longCode = 'A'.repeat(65);
            expect(sanitizeAdminCode(longCode)).toBe('');
            const maxLengthCode = 'A'.repeat(64);
            expect(sanitizeAdminCode(maxLengthCode)).toBe(maxLengthCode);
        });

        test('should return empty string for null/undefined/empty', () => {
            expect(sanitizeAdminCode(null)).toBe('');
            expect(sanitizeAdminCode(undefined)).toBe('');
            expect(sanitizeAdminCode('')).toBe('');
            expect(sanitizeAdminCode('   ')).toBe('');
        });
    });

    describe('parseMapLayersParam', () => {
        test('should parse single layer ID', () => {
            expect(parseMapLayersParam('layer-1')).toEqual(['layer-1']);
            expect(parseMapLayersParam('layer_2')).toEqual(['layer_2']);
        });

        test('should parse comma-separated layer IDs', () => {
            expect(parseMapLayersParam('layer-1,layer-2,layer-3'))
                .toEqual(['layer-1', 'layer-2', 'layer-3']);
        });

        test('should sanitize individual layer IDs', () => {
            expect(parseMapLayersParam('valid-id,invalid#id,another-id'))
                .toEqual(['valid-id', 'another-id']);
        });

        test('should trim whitespace around layer IDs', () => {
            expect(parseMapLayersParam('layer-1 , layer-2 , layer-3'))
                .toEqual(['layer-1', 'layer-2', 'layer-3']);
        });

        test('should filter out empty strings after sanitization', () => {
            expect(parseMapLayersParam('layer-1,,layer-2'))
                .toEqual(['layer-1', 'layer-2']);
            expect(parseMapLayersParam('layer-1,###,layer-2'))
                .toEqual(['layer-1', 'layer-2']);
        });

        test('should return empty array for null/undefined/empty', () => {
            expect(parseMapLayersParam(null)).toEqual([]);
            expect(parseMapLayersParam(undefined)).toEqual([]);
            expect(parseMapLayersParam('')).toEqual([]);
            expect(parseMapLayersParam('   ')).toEqual([]);
        });

        test('should handle layer IDs with hyphens and underscores', () => {
            expect(parseMapLayersParam('layer-1_v2,layer_2-v1'))
                .toEqual(['layer-1_v2', 'layer_2-v1']);
        });

        test('should reject layer IDs exceeding 100 characters', () => {
            const longId = 'a'.repeat(101);
            const shortId = 'a'.repeat(100);
            expect(parseMapLayersParam(shortId)).toEqual([shortId]);
            expect(parseMapLayersParam(longId)).toEqual([]);
        });
    });

    describe('serializeMapLayersParam', () => {
        test('should serialize single layer ID', () => {
            expect(serializeMapLayersParam(['layer-1'])).toBe('layer-1');
        });

        test('should serialize multiple layer IDs as comma-separated string', () => {
            expect(serializeMapLayersParam(['layer-1', 'layer-2', 'layer-3']))
                .toBe('layer-1,layer-2,layer-3');
        });

        test('should sanitize layer IDs during serialization', () => {
            expect(serializeMapLayersParam(['layer-1', 'invalid#id', 'layer-2']))
                .toBe('layer-1,layer-2');
        });

        test('should return empty string for empty array', () => {
            expect(serializeMapLayersParam([])).toBe('');
        });

        test('should filter out invalid IDs before joining', () => {
            expect(serializeMapLayersParam(['###', 'layer-1', '']))
                .toBe('layer-1');
        });
    });
});
