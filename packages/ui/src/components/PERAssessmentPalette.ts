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

export const PER_ASSESSMENT_TYPE_COLORS = {
    'Self assessment': PER_ASSESSMENT_COLORS.selfAssessment,
    Simulation: PER_ASSESSMENT_COLORS.simulation,
    Operational: PER_ASSESSMENT_COLORS.operational,
    'Post operational': PER_ASSESSMENT_COLORS.postOperational,
} as const;

export const PER_CONSIDERATION_GAUGE_COLOR = PER_ASSESSMENT_COLORS.selfAssessment;
export const PER_INACTIVE_COLOR = '#C6C6C6';
