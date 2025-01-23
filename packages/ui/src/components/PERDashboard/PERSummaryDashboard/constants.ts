// Assessment type colors
export const ASSESSMENT_COLORS = {
    selfAssessment: '#236192',
    simulation: '#418FDE',
    operational: '#009CDD',
    postOperational: '#C6C6C6',
} as const;

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
        color: '#00B398',
    },
    {
        phase: 'Prioritization',
        label: 'Prioritization',
        phaseNumber: 3,
        color: '#00B398',
    },
    {
        phase: 'Work Planning',
        label: 'Work Planning',
        phaseNumber: 4,
        color: '#00B398',
    },
    {
        phase: 'Action & Review',
        label: 'Action & Review',
        phaseNumber: 5,
        color: '#00B398',
    },
] as const;
