// Rating colors for different PER statuses
export const RATING_COLORS = {
    "Doesn't exist": '#F5333F',
    'Partially exists': '#FB8C00',
    'Needs improvement': '#FFC107',
    'Good performing': '#8BC34A',
    'High performing': '#7CB342',
    primary: '#F5333F',
    coordination: '#7CB342',
    operational: '#3F51B5',
    support: '#E53935',
    policy: '#8E24AA',
    analysis: '#FB8C00',
} as const;

// Assessment type colors
export const ASSESSMENT_COLORS = {
    selfAssessment: '#236192',
    simulation: '#418FDE',
    operational: '#009CDD',
    postOperational: '#C6C6C6',
} as const;

// Assessment type options with labels and colors
export const ASSESSMENT_TYPE_OPTIONS = [
    {
        label: 'Self assessment',
        color: ASSESSMENT_COLORS.selfAssessment,
    },
    {
        label: 'Simulation',
        color: ASSESSMENT_COLORS.simulation,
    },
    {
        label: 'Operational',
        color: ASSESSMENT_COLORS.operational,
    },
    {
        label: 'Post operational',
        color: ASSESSMENT_COLORS.postOperational,
    },
] as const;
