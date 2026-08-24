import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    DISASTER_TYPE_DROUGHT,
    DREF_TYPE_ASSESSMENT,
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
    ONSET_SLOW,
    ONSET_SUDDEN,
} from '#utils/constants';

import {
    answer,
    resolve,
} from './engine';
import drefDecisionTree from './tree';
import { type AnswerPath } from './types';
import {
    getTreeErrors,
    validateTree,
} from './validate';

// Apply a sequence of option values from the root.
function walk(values: string[]): AnswerPath {
    return values.reduce<AnswerPath>(
        (path, value) => answer(drefDecisionTree, path, value),
        [],
    );
}

describe('decision tree structure', () => {
    test('has no structural errors', () => {
        expect(getTreeErrors(drefDecisionTree)).toEqual([]);
    });

    test('every branch reaches an outcome', () => {
        const gaps = validateTree(drefDecisionTree)
            .filter((issue) => issue.message.includes('gap'));
        expect(gaps).toEqual([]);
    });

    test('no node is unreachable', () => {
        const unreachable = validateTree(drefDecisionTree)
            .filter((issue) => issue.message.includes('unreachable'));
        expect(unreachable).toEqual([]);
    });
});

describe('traversal -> outcomes', () => {
    test('occurred, sudden, large -> Emergency Appeal', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'large']));
        expect(outcome?.outcomeKey).toBe('outcome.emergencyAppeal');
    });

    test('occurred, sudden, small, enough info -> Response DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'small', 'yes']));
        expect(outcome?.outcomeKey).toBe('outcome.responseDref');
    });

    test('occurred, sudden, small, not enough info -> Assessment DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'small', 'no']));
        expect(outcome?.outcomeKey).toBe('outcome.assessmentDref');
    });

    test('occurred, slow, drought -> Drought DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'slow', 'yes']));
        expect(outcome?.outcomeKey).toBe('outcome.droughtDref');
    });

    test('not occurred, EAP in place, trigger reached -> EAP Activation', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'yes', 'yes']));
        expect(outcome?.outcomeKey).toBe('outcome.eapActivation');
    });

    test('not occurred, EAP in place, risk and coverage match -> exceptional approval', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'yes', 'no', 'yes', 'yes']));
        expect(outcome?.outcomeKey).toBe('outcome.exceptionalApproval');
    });

    test('not occurred, EAP in place, risk below threshold -> Imminent DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'yes', 'no', 'no']));
        expect(outcome?.outcomeKey).toBe('outcome.imminentDref');
    });

    test('not occurred, EAP in place, coverage differs -> Imminent DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'yes', 'no', 'yes', 'no']));
        expect(outcome?.outcomeKey).toBe('outcome.imminentDref');
    });

    test('not occurred, no EAP, no alert -> develop an EAP', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'no', 'no']));
        expect(outcome?.outcomeKey).toBe('outcome.developEap');
    });

    test('not occurred, no EAP, alert not readiness-related -> Imminent DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'no', 'yes', 'no']));
        expect(outcome?.outcomeKey).toBe('outcome.imminentDref');
    });

    test('not occurred, no EAP, readiness alert, drought -> Drought DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'no', 'yes', 'yes', 'yes']));
        expect(outcome?.outcomeKey).toBe('outcome.droughtDref');
    });

    test('not occurred, no EAP, readiness alert, not drought -> Response DREF', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'no', 'yes', 'yes', 'no']));
        expect(outcome?.outcomeKey).toBe('outcome.responseDref');
    });
});

describe('outcome form seeding', () => {
    test('sudden Response DREF seeds response type and sudden onset', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'small', 'yes']));
        expect(outcome?.actions[0]).toMatchObject({
            type: 'navigate',
            route: 'newDrefApplicationForm',
            state: { type_of_dref: DREF_TYPE_RESPONSE, type_of_onset: ONSET_SUDDEN },
        });
    });

    test('Assessment DREF seeds the assessment type', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'small', 'no']));
        expect(outcome?.actions[0]).toMatchObject({
            state: { type_of_dref: DREF_TYPE_ASSESSMENT, type_of_onset: ONSET_SUDDEN },
        });
    });

    test('Drought DREF seeds the drought disaster type and slow onset', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'slow', 'yes']));
        expect(outcome?.actions[0]).toMatchObject({
            state: {
                type_of_dref: DREF_TYPE_RESPONSE,
                type_of_onset: ONSET_SLOW,
                disaster_type: DISASTER_TYPE_DROUGHT,
            },
        });
    });

    test('Imminent DREF seeds the imminent type', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'no', 'yes', 'no']));
        expect(outcome?.actions[0]).toMatchObject({
            state: { type_of_dref: DREF_TYPE_IMMINENT },
        });
    });

    test('develop-an-EAP routes to the EAP registration form', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['no', 'no', 'no']));
        expect(outcome?.actions[0]).toMatchObject({
            type: 'navigate',
            route: 'newEapDevelopmentRegistration',
        });
    });
});

describe('outcome guidance', () => {
    test('the two Response DREF leaves point at different guidance', () => {
        const slow = resolve(drefDecisionTree, walk(['yes', 'slow', 'no'])).outcome;
        const readiness = resolve(drefDecisionTree, walk(['no', 'no', 'yes', 'yes', 'no'])).outcome;

        const slowGuidance = slow?.actions.find((action) => action.type === 'external');
        const readinessGuidance = readiness?.actions.find((action) => action.type === 'external');

        expect(slowGuidance).toBeDefined();
        expect(readinessGuidance).toBeDefined();
        expect(slowGuidance).not.toEqual(readinessGuidance);
    });

    test('Emergency Appeal is advisory only and carries a resources link', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'large']));
        expect(outcome?.actions).toEqual([]);
        expect(outcome?.notes?.[0]?.link?.url).toBeTruthy();
    });

    test('the sudden Response DREF carries advance-payment and recurrent-event guidance', () => {
        const { outcome } = resolve(drefDecisionTree, walk(['yes', 'sudden', 'small', 'yes']));
        expect(outcome?.notes?.map((note) => note.textKey)).toEqual([
            'note.advancePayment',
            'note.recurrentEvents',
        ]);
        outcome?.notes?.forEach((note) => {
            expect(note.link?.url).toBeTruthy();
        });
    });
});
