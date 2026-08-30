import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import {
    getDrefAppealDocumentUrls,
    getEmergencyDrefStrategy,
    getEmergencyOperationType,
    isDrefSummaryInProgress,
    STAGE_DREF_APPEAL_ONLY,
    STAGE_DREF_APPLICATION,
    STAGE_EMERGENCY_APPEAL,
    STAGE_FIELD_REPORT,
    STAGE_FINAL_REPORT,
    STAGE_OPERATIONAL_UPDATE,
} from './emergency.ts';

type EmergencyDetail = GoApiResponse<'/api/v2/emergency/{id}/'>;

// the real payload is too wide to build literally; only these fields are read
function emergency(stage: number, dref: unknown): EmergencyDetail {
    return { stage, dref } as unknown as EmergencyDetail;
}

function intervention(id: number) {
    return { id };
}

function proposedAction(id: number) {
    return { id };
}

describe('isDrefSummaryInProgress', () => {
    test('is false when there is no emergency or no dref', () => {
        expect(isDrefSummaryInProgress(undefined)).toBe(false);
        expect(isDrefSummaryInProgress(emergency(STAGE_DREF_APPLICATION, null))).toBe(false);
    });

    test('is false when the summary is null', () => {
        expect(
            isDrefSummaryInProgress(emergency(STAGE_DREF_APPLICATION, { summary: null })),
        ).toBe(false);
    });

    test('is true only while pending or processing', () => {
        const withStatus = (status: number) => isDrefSummaryInProgress(
            emergency(STAGE_DREF_APPLICATION, { summary: { status } }),
        );

        expect(withStatus(100)).toBe(true);
        expect(withStatus(200)).toBe(true);
        expect(withStatus(300)).toBe(false);
        expect(withStatus(400)).toBe(false);
    });
});

describe('getEmergencyDrefStrategy', () => {
    test('imminent application shows its own early actions and has not converted', () => {
        const result = getEmergencyDrefStrategy(emergency(STAGE_DREF_APPLICATION, {
            type_of_dref: DREF_TYPE_IMMINENT,
            proposed_action: [proposedAction(1)],
            planned_interventions: [],
        }));

        expect(result?.revisionKind).toBe('application');
        expect(result?.beganAsImminent).toBe(true);
        expect(result?.hasApprovedOpsUpdate).toBe(false);
        expect(result?.earlyActions).toHaveLength(1);
        expect(result?.plannedInterventions).toHaveLength(0);
    });

    // the base dref stays IMMINENT forever, so the ops update must still win
    test('imminent with an approved ops update reads the ops update', () => {
        const result = getEmergencyDrefStrategy(emergency(STAGE_OPERATIONAL_UPDATE, {
            type_of_dref: DREF_TYPE_IMMINENT,
            proposed_action: [proposedAction(1)],
            planned_interventions: [],
            operational_update_details: {
                planned_interventions: [intervention(10), intervention(11)],
            },
        }));

        expect(result?.revisionKind).toBe('operational-update');
        expect(result?.beganAsImminent).toBe(true);
        expect(result?.hasApprovedOpsUpdate).toBe(true);
        expect(result?.plannedInterventions).toHaveLength(2);
    });

    test('final report created from an ops update counts as converted', () => {
        const result = getEmergencyDrefStrategy(emergency(STAGE_FINAL_REPORT, {
            type_of_dref: DREF_TYPE_IMMINENT,
            proposed_action: [proposedAction(1)],
            operational_update_details: { planned_interventions: [intervention(10)] },
            final_report_details: {
                planned_interventions: [intervention(20)],
                proposed_action: [proposedAction(1)],
            },
        }));

        expect(result?.revisionKind).toBe('final-report');
        expect(result?.hasApprovedOpsUpdate).toBe(true);
        expect(result?.plannedInterventions).toEqual([intervention(20)]);
    });

    test('final report straight from an imminent application has not converted', () => {
        const result = getEmergencyDrefStrategy(emergency(STAGE_FINAL_REPORT, {
            type_of_dref: DREF_TYPE_IMMINENT,
            proposed_action: [proposedAction(1)],
            final_report_details: {
                planned_interventions: [],
                proposed_action: [proposedAction(1), proposedAction(2)],
            },
        }));

        expect(result?.revisionKind).toBe('final-report');
        expect(result?.hasApprovedOpsUpdate).toBe(false);
        expect(result?.earlyActions).toHaveLength(2);
    });

    test('response dref never began as imminent', () => {
        const result = getEmergencyDrefStrategy(emergency(STAGE_DREF_APPLICATION, {
            type_of_dref: DREF_TYPE_RESPONSE,
            proposed_action: [],
            planned_interventions: [intervention(1)],
        }));

        expect(result?.beganAsImminent).toBe(false);
        expect(result?.earlyActions).toHaveLength(0);
        expect(result?.plannedInterventions).toHaveLength(1);
    });

    test('is undefined when the emergency has no dref', () => {
        expect(getEmergencyDrefStrategy(undefined)).toBeUndefined();
        expect(getEmergencyDrefStrategy(emergency(STAGE_DREF_APPLICATION, null))).toBeUndefined();
    });
});

describe('getEmergencyOperationType', () => {
    test('is undefined without an emergency or a resolved stage', () => {
        expect(getEmergencyOperationType(undefined)).toBeUndefined();
        expect(getEmergencyOperationType(emergency(STAGE_FIELD_REPORT, null))).toBeUndefined();
    });

    test('reads the appeal stages', () => {
        expect(
            getEmergencyOperationType(emergency(STAGE_EMERGENCY_APPEAL, null)),
        ).toBe('emergency-appeal');
        expect(
            getEmergencyOperationType(emergency(STAGE_DREF_APPEAL_ONLY, null)),
        ).toBe('response-dref');
    });

    test('an imminent dref stays imminent until an ops update is approved', () => {
        expect(
            getEmergencyOperationType(emergency(STAGE_DREF_APPLICATION, {
                type_of_dref: DREF_TYPE_IMMINENT,
            })),
        ).toBe('imminent-dref');

        expect(
            getEmergencyOperationType(emergency(STAGE_OPERATIONAL_UPDATE, {
                type_of_dref: DREF_TYPE_IMMINENT,
                operational_update_details: { planned_interventions: [] },
            })),
        ).toBe('response-dref');
    });

    // the dref row is null at appeal stages and can be null at dref stages too
    test('falls back to a response dref at dref stages without dref data', () => {
        expect(
            getEmergencyOperationType(emergency(STAGE_FINAL_REPORT, null)),
        ).toBe('response-dref');
    });

    test('never reports a document stage for a response dref', () => {
        expect(
            getEmergencyOperationType(emergency(STAGE_DREF_APPLICATION, {
                type_of_dref: DREF_TYPE_RESPONSE,
            })),
        ).toBe('response-dref');
    });
});

describe('getDrefAppealDocumentUrls', () => {
    // only the fields the matching reads
    function document(type: string, createdAt: string, url: string) {
        return { type, created_at: createdAt, document: url } as never;
    }

    test('is empty without documents', () => {
        const result = getDrefAppealDocumentUrls(undefined);

        expect(result.application).toBeUndefined();
        expect(result.finalReport).toBeUndefined();
        expect(result.operationalUpdates).toEqual([]);
    });

    test('ignores documents of unrelated types', () => {
        const result = getDrefAppealDocumentUrls([
            document('Emergency Appeal', '2026-01-01', 'ea.pdf'),
            document('Situation Report', '2026-01-02', 'sitrep.pdf'),
        ]);

        expect(result.application).toBeUndefined();
        expect(result.finalReport).toBeUndefined();
        expect(result.operationalUpdates).toEqual([]);
    });

    test('matches both ERP naming generations', () => {
        expect(
            getDrefAppealDocumentUrls([
                document('DREF Operation', '2026-01-01', 'old.pdf'),
            ]).application,
        ).toBe('old.pdf');

        expect(
            getDrefAppealDocumentUrls([
                document('DREF/EAP Activation', '2026-01-01', 'new.pdf'),
            ]).application,
        ).toBe('new.pdf');
    });

    // the nth update document is read as Operational Update #n
    test('orders operational updates by creation date', () => {
        const result = getDrefAppealDocumentUrls([
            document('DREF Operation Update', '2026-03-01', 'ou2.pdf'),
            document('DREF/EAP Update', '2026-02-01', 'ou1.pdf'),
            document('DREF Operation Update', '2026-04-01', 'ou3.pdf'),
        ]);

        expect(result.operationalUpdates).toEqual(['ou1.pdf', 'ou2.pdf', 'ou3.pdf']);
    });

    test('prefers the last final report over a preliminary one', () => {
        const result = getDrefAppealDocumentUrls([
            document('Preliminary DREF Operation Final Report', '2026-05-01', 'prelim.pdf'),
            document('DREF Operation Final Report', '2026-06-01', 'final.pdf'),
        ]);

        expect(result.finalReport).toBe('final.pdf');
    });

    test('falls back to document_url when there is no stored file', () => {
        const result = getDrefAppealDocumentUrls([
            { type: 'DREF Operation', created_at: '2026-01-01', document_url: 'erp.pdf' } as never,
        ]);

        expect(result.application).toBe('erp.pdf');
    });
});
