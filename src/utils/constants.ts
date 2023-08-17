import {
    components,
} from '#generated/types';

type OperationTypeEnum = components['schemas']['OperationTypeEnum'];
type StatusTypeEnum = components['schemas']['Key1d2Enum'];
type ProgrammeTypeEnum = components['schemas']['Key1d2Enum'];

export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy';

// Alert

export const DURATION_DEFAULT_ALERT_DISMISS = 4500;

// Table

export const WIDTH_DEFAULT_TABLE_COLUMN = 108;

// Auth

export const KEY_USER_STORAGE = 'user';

// Search page

export const KEY_URL_SEARCH = 'keyword';
export const SEARCH_TEXT_LENGTH_MIN = 3;

// Risk

export const COLOR_HAZARD_CYCLONE = '#a4bede';
export const COLOR_HAZARD_DROUGHT = '#b68fba';
export const COLOR_HAZARD_FOOD_INSECURITY = '#b7c992';
export const COLOR_HAZARD_FLOOD = '#5a80b0';
export const COLOR_HAZARD_EARTHQUAKE = '#eca48c';
export const COLOR_HAZARD_STORM = '#97b8c2';
export const COLOR_HAZARD_WILDFIRE = '#ff5014';

// FIXME: should these constants satisfy an existing enum?
export const CATEGORY_RISK_VERY_LOW = 1;
export const CATEGORY_RISK_LOW = 2;
export const CATEGORY_RISK_MEDIUM = 3;
export const CATEGORY_RISK_HIGH = 4;
export const CATEGORY_RISK_VERY_HIGH = 5;

// Colors

export const COLOR_WHITE = '#ffffff';
export const COLOR_TEXT = '#313131';
export const COLOR_LIGHT_GREY = '#e0e0e0';
export const COLOR_DARK_GREY = '#a5a5a5';
export const COLOR_BLACK = '#000000';
export const COLOR_LIGHT_YELLOW = '#ffd470';
export const COLOR_YELLOW = '#ff9e00';
export const COLOR_BLUE = '#4c5d9b';
export const COLOR_LIGHT_BLUE = '#c7d3e0';
export const COLOR_ORANGE = '#ff8000';
export const COLOR_RED = '#f5333f';
export const COLOR_DARK_RED = '#730413';
export const COLOR_PRIMARY_BLUE = '#011e41';
export const COLOR_PRIMARY_RED = '#f5333f';

// Three W

export const OPERATION_TYPE_PROGRAMME = 0 satisfies OperationTypeEnum;
export const OPERATION_TYPE_EMERGENCY = 1 satisfies OperationTypeEnum;
// FIXME: Remove this multi thing
export const OPERATION_TYPE_MULTI = -1;

export const PROGRAMME_TYPE_MULTILATERAL = 1 satisfies ProgrammeTypeEnum;
export const PROGRAMME_TYPE_DOMESTIC = 2 satisfies ProgrammeTypeEnum;

export const PROJECT_STATUS_COMPLETED = 2 satisfies StatusTypeEnum;
export const PROJECT_STATUS_ONGOING = 1 satisfies StatusTypeEnum;
export const PROJECT_STATUS_PLANNED = 0 satisfies StatusTypeEnum;
