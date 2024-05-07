export type Validation = 'validated' | 'not_validated';

export const VALIDATED = 'validated' satisfies Validation;
export const NOT_VALIDATED = 'not_validated' satisfies Validation;

export const TYPE_ADMINISTRATIVE = 1;
export const TYPE_HEALTHCARE = 2;
export const TYPE_EMERGENCY_RESPONSE = 3;
export const TYPE_HUMANITARIAN = 4;
export const TYPE_TRAINING = 5;
export const TYPE_OTHER = 6;

export const TYPE_HEALTH_AMBULANCE = 1;
export const TYPE_HEALTH_BLOOD_CENTER = 2;
export const TYPE_HEALTH_HOSPITAL = 3;
export const TYPE_HEALTH_PHARMACY = 4;
export const TYPE_HEALTH_PHC_CENTER = 5;
export const TYPE_HEALTH_RESIDENTIAL = 6;
export const TYPE_HEALTH_TRAINING = 7;
export const TYPE_HEALTH_SPECIAL_SERVICES = 8;
export const TYPE_HEALTH_OTHERS = 9;
