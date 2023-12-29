import {
    expect,
    test,
} from 'vitest';

import {
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';

import { riskScoreToCategory } from './risk.ts';

test('Risk score to category', () => {
    expect(
        riskScoreToCategory(
            0,
            'FL',
        ),
    ).toEqual(CATEGORY_RISK_VERY_LOW);
    expect(
        riskScoreToCategory(
            3,
            'FL',
        ),
    ).toEqual(CATEGORY_RISK_LOW);
});
