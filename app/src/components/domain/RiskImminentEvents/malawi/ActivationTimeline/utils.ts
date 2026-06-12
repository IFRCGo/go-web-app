export type ActivationStepState = 'completed' | 'active' | 'pending';

export interface ActivationStep {
    key: string;
    label: string;
    state: ActivationStepState;
}

// Derive step states from an ordered list of completed flags: the first
// incomplete step becomes 'active' (the next expected milestone); later
// incomplete steps stay 'pending'. Completed steps after an incomplete one
// keep their completed state (milestones are not strictly sequential).
export function buildActivationSteps(
    items: { key: string; label: string; completed: boolean }[],
): ActivationStep[] {
    const firstIncomplete = items.findIndex((item) => !item.completed);
    return items.map((item, i) => {
        let state: ActivationStepState;
        if (item.completed) {
            state = 'completed';
        } else if (i === firstIncomplete) {
            state = 'active';
        } else {
            state = 'pending';
        }
        return {
            key: item.key,
            label: item.label,
            state,
        };
    });
}
