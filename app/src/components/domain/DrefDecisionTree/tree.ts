import {
    DISASTER_TYPE_DROUGHT,
    DREF_TYPE_ASSESSMENT,
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
    ONSET_SLOW,
    ONSET_SUDDEN,
} from '#utils/constants';
import {
    DREF_GUIDELINES_ADVANCE_PAYMENT_URL,
    DREF_GUIDELINES_DROUGHT_URL,
    DREF_GUIDELINES_EAP_ACTIVATION_URL,
    DREF_GUIDELINES_EAP_DEVELOPMENT_URL,
    DREF_GUIDELINES_IMMINENT_URL,
    DREF_GUIDELINES_READINESS_URL,
    DREF_GUIDELINES_RECURRENT_EVENTS_URL,
    DREF_GUIDELINES_RESPONSE_URL,
    EMERGENCY_APPEAL_RESOURCES_URL,
    getNewDrefRouteState,
} from '#utils/domain/dref';

import {
    type DecisionTree,
    type OutcomeAction,
} from './types';

// DREF DECISION TREE - DREF FUNDING OPTIONS
//
// Mirrors DREFDecisionTree_2026.08.24.pdf. Flat node graph: each question's option
// points (`next`) at another node id. Outcomes are shared only where BOTH the seeded
// form state and the guidance target match, which is why the two "Response DREF" and
// the two "Drought DREF" leaves are separate nodes: the slow-onset pair links to the
// allocation-parameters guidance, the anticipatory pair to readiness/drought guidance.
// Re-wiring the tree = editing `next` values here; re-wording it = editing i18n.json.
//
// Content keys (q.* / opt.* / note.* / outcome.* / cta.*) are resolved in index.tsx.
// `validateTree` (see validate.ts + engine.test.ts) guards the invariants on every edit.

const drefApplicationForm = (
    state: ReturnType<typeof getNewDrefRouteState>,
): OutcomeAction => ({
    type: 'navigate',
    route: 'newDrefApplicationForm',
    labelKey: 'cta.drefApplicationForm',
    state,
});

const drefGuidelines = (url: string): OutcomeAction => ({
    type: 'external',
    url,
    labelKey: 'cta.drefGuidelines',
});

const drefDecisionTree: DecisionTree = {
    root: 'eventOccurred',
    nodes: {
        // ----- Q1: entry -----
        eventOccurred: {
            kind: 'question',
            questionKey: 'q.eventOccurred',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'natureOfDisaster' },
                { value: 'no', labelKey: 'opt.no', next: 'hasEap' },
            ],
        },

        // =================== Branch A - the event has already occurred ===================
        natureOfDisaster: {
            kind: 'question',
            questionKey: 'q.nature',
            options: [
                { value: 'sudden', labelKey: 'opt.nature.sudden', next: 'sizeOfOperation' },
                { value: 'slow', labelKey: 'opt.nature.slow', next: 'droughtFocusResponse' },
            ],
        },

        // --- sudden onset ---
        sizeOfOperation: {
            kind: 'question',
            questionKey: 'q.size',
            options: [
                { value: 'large', labelKey: 'opt.size.large', next: 'o_emergencyAppeal' },
                { value: 'small', labelKey: 'opt.size.small', next: 'enoughInfo' },
            ],
        },
        enoughInfo: {
            kind: 'question',
            questionKey: 'q.enoughInfo',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'o_responseDrefSudden' },
                { value: 'no', labelKey: 'opt.no', next: 'o_assessmentDref' },
            ],
        },

        // --- slow onset ---
        droughtFocusResponse: {
            kind: 'question',
            questionKey: 'q.droughtFocusResponse',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'o_droughtDrefSlow' },
                { value: 'no', labelKey: 'opt.no', next: 'o_responseDrefSlow' },
            ],
        },

        // =================== Branch B - the event has not occurred ===================
        hasEap: {
            kind: 'question',
            questionKey: 'q.hasEap',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'eapTriggerReached' },
                { value: 'no', labelKey: 'opt.no', next: 'alertIssued' },
            ],
        },

        // --- an EAP is in place ---
        eapTriggerReached: {
            kind: 'question',
            questionKey: 'q.eapTrigger',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'o_eapActivation' },
                { value: 'no', labelKey: 'opt.no', next: 'riskSimilarToThreshold' },
            ],
        },
        riskSimilarToThreshold: {
            kind: 'question',
            questionKey: 'q.riskThreshold',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'geoCoverageSame' },
                { value: 'no', labelKey: 'opt.no', next: 'o_imminentDref' },
            ],
        },
        geoCoverageSame: {
            kind: 'question',
            questionKey: 'q.geoCoverage',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'o_exceptionalApproval' },
                { value: 'no', labelKey: 'opt.no', next: 'o_imminentDref' },
            ],
        },

        // --- no EAP in place ---
        alertIssued: {
            kind: 'question',
            questionKey: 'q.alertIssued',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'alertRelatedToTypes' },
                { value: 'no', labelKey: 'opt.no', next: 'o_developEap' },
            ],
        },
        alertRelatedToTypes: {
            kind: 'question',
            questionKey: 'q.alertRelated',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'droughtFocusAnticipatory' },
                { value: 'no', labelKey: 'opt.no', next: 'o_imminentDref' },
            ],
        },
        droughtFocusAnticipatory: {
            kind: 'question',
            questionKey: 'q.droughtFocusAnticipatory',
            options: [
                { value: 'yes', labelKey: 'opt.yes', next: 'o_droughtDrefAnticipatory' },
                { value: 'no', labelKey: 'opt.no', next: 'o_responseDrefReadiness' },
            ],
        },

        // =================== Outcomes ===================
        o_emergencyAppeal: {
            kind: 'outcome',
            outcomeKey: 'outcome.emergencyAppeal',
            notes: [{
                textKey: 'note.emergencyAppealUnavailable',
                link: {
                    url: EMERGENCY_APPEAL_RESOURCES_URL,
                    labelKey: 'note.link.followingResources',
                },
            }],
            actions: [],
        },
        o_responseDrefSudden: {
            kind: 'outcome',
            outcomeKey: 'outcome.responseDref',
            notes: [
                {
                    textKey: 'note.advancePayment',
                    link: {
                        url: DREF_GUIDELINES_ADVANCE_PAYMENT_URL,
                        labelKey: 'note.link.learnMore',
                    },
                },
                {
                    textKey: 'note.recurrentEvents',
                    link: {
                        url: DREF_GUIDELINES_RECURRENT_EVENTS_URL,
                        labelKey: 'note.link.learnMore',
                    },
                },
            ],
            actions: [
                drefApplicationForm(getNewDrefRouteState(DREF_TYPE_RESPONSE, ONSET_SUDDEN)),
                drefGuidelines(DREF_GUIDELINES_RESPONSE_URL),
            ],
        },
        o_assessmentDref: {
            kind: 'outcome',
            outcomeKey: 'outcome.assessmentDref',
            notes: [{ textKey: 'note.conductAssessment' }],
            // The design gives this leaf the form only, no guidelines link.
            actions: [
                drefApplicationForm(getNewDrefRouteState(DREF_TYPE_ASSESSMENT, ONSET_SUDDEN)),
            ],
        },
        o_droughtDrefSlow: {
            kind: 'outcome',
            outcomeKey: 'outcome.droughtDref',
            notes: [
                { textKey: 'note.insufficientEvidence' },
                {
                    textKey: 'note.recurrentEvents',
                    link: {
                        url: DREF_GUIDELINES_RECURRENT_EVENTS_URL,
                        labelKey: 'note.link.learnMore',
                    },
                },
            ],
            actions: [
                drefApplicationForm(
                    getNewDrefRouteState(DREF_TYPE_RESPONSE, ONSET_SLOW, DISASTER_TYPE_DROUGHT),
                ),
                drefGuidelines(DREF_GUIDELINES_DROUGHT_URL),
            ],
        },
        o_responseDrefSlow: {
            kind: 'outcome',
            outcomeKey: 'outcome.responseDref',
            notes: [{
                textKey: 'note.recurrentEvents',
                link: {
                    url: DREF_GUIDELINES_RECURRENT_EVENTS_URL,
                    labelKey: 'note.link.learnMore',
                },
            }],
            actions: [
                drefApplicationForm(getNewDrefRouteState(DREF_TYPE_RESPONSE, ONSET_SLOW)),
                drefGuidelines(DREF_GUIDELINES_RESPONSE_URL),
            ],
        },
        o_eapActivation: {
            kind: 'outcome',
            outcomeKey: 'outcome.eapActivation',
            notes: [{ textKey: 'note.eapActivationByEmail' }],
            actions: [drefGuidelines(DREF_GUIDELINES_EAP_ACTIVATION_URL)],
        },
        o_exceptionalApproval: {
            kind: 'outcome',
            outcomeKey: 'outcome.exceptionalApproval',
            notes: [
                { textKey: 'note.eapActivationByEmail' },
                { textKey: 'note.justifyExceptionalApproval' },
            ],
            actions: [drefGuidelines(DREF_GUIDELINES_EAP_ACTIVATION_URL)],
        },
        o_imminentDref: {
            kind: 'outcome',
            outcomeKey: 'outcome.imminentDref',
            actions: [
                // The form forces sudden onset for imminent DREFs.
                drefApplicationForm(getNewDrefRouteState(DREF_TYPE_IMMINENT, ONSET_SUDDEN)),
                drefGuidelines(DREF_GUIDELINES_IMMINENT_URL),
            ],
        },
        o_droughtDrefAnticipatory: {
            kind: 'outcome',
            outcomeKey: 'outcome.droughtDref',
            notes: [{ textKey: 'note.insufficientEvidence' }],
            actions: [
                drefApplicationForm(
                    getNewDrefRouteState(DREF_TYPE_RESPONSE, ONSET_SLOW, DISASTER_TYPE_DROUGHT),
                ),
                drefGuidelines(DREF_GUIDELINES_DROUGHT_URL),
            ],
        },
        o_responseDrefReadiness: {
            kind: 'outcome',
            outcomeKey: 'outcome.responseDref',
            actions: [
                drefApplicationForm(getNewDrefRouteState(DREF_TYPE_RESPONSE, ONSET_SLOW)),
                drefGuidelines(DREF_GUIDELINES_READINESS_URL),
            ],
        },
        o_developEap: {
            kind: 'outcome',
            outcomeKey: 'outcome.developEap',
            actions: [
                {
                    type: 'navigate',
                    route: 'newEapDevelopmentRegistration',
                    labelKey: 'cta.eapDevelopmentRegistration',
                },
                drefGuidelines(DREF_GUIDELINES_EAP_DEVELOPMENT_URL),
            ],
        },
    },
};

export default drefDecisionTree;
