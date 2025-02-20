export type Validation = 'Validated' | 'Not Validated';
type RequestType = 'authenticated' | 'public';

export const VALIDATED = 'Validated' satisfies Validation;
export const NOT_VALIDATED = 'Not Validated' satisfies Validation;
export const AUTHENTICATED = 'authenticated' satisfies RequestType;
export const PUBLIC = 'public' satisfies RequestType;
