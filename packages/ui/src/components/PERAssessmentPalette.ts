/**
 * Shared assessment palette for every PER visual.
 *
 * Keep this mapping aligned with the PER consultant reference. Components use
 * the semantic keys below instead of maintaining their own colour order.
 */
export const PER_ASSESSMENT_COLORS = {
    selfAssessment: '#A4BEDE',
    simulation: '#009CDD',
    operational: '#418FDE',
    postOperational: '#236192',
} as const;

// NOTE: These keys identify an assessment type. They are never shown to the user,
// the labels come from `usePERAssessmentTypeLabels` so that they are translated.
export const PER_ASSESSMENT_TYPE_KEYS = [
    'SelfAssessment',
    'Simulation',
    'Operational',
    'PostOperational',
] as const;

export type PERAssessmentTypeKey = typeof PER_ASSESSMENT_TYPE_KEYS[number];

export const PER_ASSESSMENT_TYPE_COLORS: Record<PERAssessmentTypeKey, string> = {
    SelfAssessment: PER_ASSESSMENT_COLORS.selfAssessment,
    Simulation: PER_ASSESSMENT_COLORS.simulation,
    Operational: PER_ASSESSMENT_COLORS.operational,
    PostOperational: PER_ASSESSMENT_COLORS.postOperational,
};

export const PER_CONSIDERATION_GAUGE_COLOR = PER_ASSESSMENT_COLORS.selfAssessment;
export const PER_INACTIVE_COLOR = '#C6C6C6';
