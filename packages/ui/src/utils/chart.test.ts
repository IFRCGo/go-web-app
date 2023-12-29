import {
    expect,
    test,
} from 'vitest';

import { getScaleFunction } from './chart';

test('Scale function', () => {
    const scale = getScaleFunction(
        { min: 0, max: 10 },
        { min: 0, max: 100 },
        { start: 0, end: 0 },
    );

    expect(scale(1)).toBeCloseTo(10);
    expect(scale(1.1)).toBeCloseTo(11);
    expect(scale(9.5)).toBeCloseTo(95);
});

test('Scale function inverted', () => {
    const scale = getScaleFunction(
        { min: 0, max: 10 },
        { min: 0, max: 100 },
        { start: 0, end: 0 },
        true,
    );

    expect(scale(1)).toBeCloseTo(90);
    expect(scale(1.1)).toBeCloseTo(89);
    expect(scale(9.5)).toBeCloseTo(5);
});
