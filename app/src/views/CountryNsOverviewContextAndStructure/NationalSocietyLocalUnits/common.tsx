export type Validation = 'validated' | 'not_validated';

export const VALIDATED = 'validated' satisfies Validation;
export const NOT_VALIDATED = 'not_validated' satisfies Validation;

export const TYPE_ADMINISTRATIVE = 1;
export const TYPE_HEALTHCARE = 2;
export const TYPE_EMERGENCY_RESPONSE = 3;
export const TYPE_HUMANITARIAN = 4;
export const TYPE_TRAINING = 5;
export const TYPE_OTHER = 6;
