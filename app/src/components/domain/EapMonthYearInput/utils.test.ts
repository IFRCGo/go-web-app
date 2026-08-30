import {
    expect,
    test,
} from 'vitest';

import {
    getCurrentYear,
    getFullDateValue,
    getMonthOptions,
    getYearMonthParts,
    getYearOptions,
} from './utils.ts';

test('Year month parts from a full date', () => {
    expect(getYearMonthParts('2026-05-01')).toEqual({ year: '2026', month: '05' });
    // NOTE: the backend may hold a day other than the first
    expect(getYearMonthParts('2026-05-14')).toEqual({ year: '2026', month: '05' });
});

test('Year month parts rejects malformed values', () => {
    expect(getYearMonthParts(undefined)).toBeUndefined();
    expect(getYearMonthParts(null)).toBeUndefined();
    expect(getYearMonthParts('')).toBeUndefined();
    expect(getYearMonthParts('202-05-01')).toBeUndefined();
    expect(getYearMonthParts('2026-05')).toBeUndefined();
    expect(getYearMonthParts('not-a-date')).toBeUndefined();
});

test('Full date value is normalised to the first of the month', () => {
    expect(getFullDateValue('2026', '05')).toBe('2026-05-01');
});

test('Month options cover every month with padded keys', () => {
    const options = getMonthOptions('en');

    expect(options).toHaveLength(12);
    expect(options.map((option) => option.value)).toEqual([
        '01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12',
    ]);
    expect(options[0]?.label).toBe('January');
    expect(options[11]?.label).toBe('December');
});

test('Month option labels follow the given locale', () => {
    expect(getMonthOptions('fr')[0]?.label).toBe('janvier');
    expect(getMonthOptions('es')[0]?.label).toBe('enero');
});

test('Year options run from the current year into the future', () => {
    const values = getYearOptions(2026, undefined).map((option) => option.value);

    expect(values).toEqual([
        '2026', '2027', '2028', '2029', '2030', '2031',
        '2032', '2033', '2034', '2035', '2036',
    ]);
});

test('Year options keep a stored year outside the window selectable', () => {
    const values = getYearOptions(2026, '2019').map((option) => option.value);

    expect(values[0]).toBe('2019');
    expect(values).toHaveLength(12);
});

test('Year options do not duplicate a stored year inside the window', () => {
    const values = getYearOptions(2026, '2028').map((option) => option.value);

    expect(values.filter((value) => value === '2028')).toHaveLength(1);
    expect(values).toHaveLength(11);
});

test('Current year helper tracks the system clock', () => {
    expect(getCurrentYear()).toBe(new Date().getFullYear());
});
