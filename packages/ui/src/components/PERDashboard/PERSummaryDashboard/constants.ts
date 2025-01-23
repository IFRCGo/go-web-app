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

// PER phases with colors and labels
export const PHASE_COLORS = [
    {
        phase: 'Orientation',
        label: 'Orientation',
        phaseNumber: 1,
        color: '#00B2A2',
    },
    {
        phase: 'Assessment',
        label: 'Assessment',
        phaseNumber: 2,
        color: '#DA283D',
    },
    {
        phase: 'Prioritisation',
        label: 'Prioritisation & analysis',
        phaseNumber: 3,
        color: '#3377EB',
    },
    {
        phase: 'Workplan',
        label: 'Workplan',
        phaseNumber: 4,
        color: '#8648B3',
    },
    {
        phase: 'Action & accountability',
        label: 'Action & accountability',
        phaseNumber: 5,
        color: '#FF8654',
    },
] as const;
