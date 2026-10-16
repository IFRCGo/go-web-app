import {
    expect,
    test,
} from 'vitest';

import { getOrderingWithFallback } from './common.ts';

test('Append fallback ordering for fields not already ordered', () => {
    const fallback = ['-start_date', '-id'];

    expect(getOrderingWithFallback('-start_date', fallback)).toBe('-start_date,-id');
    expect(getOrderingWithFallback('start_date', fallback)).toBe('start_date,-id');
    expect(getOrderingWithFallback('amount_requested', fallback)).toBe('amount_requested,-start_date,-id');
    expect(getOrderingWithFallback('-amount_funded,id', fallback)).toBe('-amount_funded,id,-start_date');
    expect(getOrderingWithFallback(undefined, fallback)).toBe('-start_date,-id');
});
