import {
    components,
} from '#generated/types';

export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy';

// Alert

export const DURATION_DEFAULT_ALERT_DISMISS = 4500;

// Map
export const DURATION_MAP_ZOOM = 1000;
export const DEFAULT_MAP_PADDING = 50;

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

type OperationTypeEnum = components['schemas']['OperationTypeEnum'];
export const OPERATION_TYPE_PROGRAMME = 0 satisfies OperationTypeEnum;
export const OPERATION_TYPE_EMERGENCY = 1 satisfies OperationTypeEnum;
export const OPERATION_TYPE_MULTI = -1;

type ProgrammeTypeEnum = components['schemas']['Key1d2Enum'];
export const PROGRAMME_TYPE_MULTILATERAL = 1 satisfies ProgrammeTypeEnum;
export const PROGRAMME_TYPE_DOMESTIC = 2 satisfies ProgrammeTypeEnum;
export const PROGRAMME_TYPE_BILATERAL = 0 satisfies ProgrammeTypeEnum;

type StatusTypeEnum = components['schemas']['Key1d2Enum'];
export const PROJECT_STATUS_COMPLETED = 2 satisfies StatusTypeEnum;
export const PROJECT_STATUS_ONGOING = 1 satisfies StatusTypeEnum;
export const PROJECT_STATUS_PLANNED = 0 satisfies StatusTypeEnum;

// DREF

// FIXME: This is the same as OperationType. Needs to be fixed in the server
type DrefStatus = components['schemas']['OperationTypeEnum'];
export const DREF_STATUS_COMPLETED = 1 satisfies DrefStatus;
export const DREF_STATUS_IN_PROGRESS = 0 satisfies DrefStatus;
type TypeOfDrefEnum = components['schemas']['TypeOfDrefEnum'];
export const DREF_TYPE_IMMINENT = 0 satisfies TypeOfDrefEnum;
export const DREF_TYPE_ASSESSMENT = 1 satisfies TypeOfDrefEnum;

// Subscriptions
type SubscriptionRecordTypeEnum = components['schemas']['RtypeEnum'];
export const SUBSCRIPTION_SURGE_ALERT = 3 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_COUNTRY = 4 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_REGION = 5 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_DISASTER_TYPE = 6 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_PER_DUE_DATE = 7 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_FOLLOWED_EVENTS = 8 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_SURGE_DEPLOYMENT_MESSAGES = 9 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_WEEKLY_DIGEST = 11 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_NEW_EMERGENCIES = 12 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_NEW_OPERATIONS = 13 satisfies SubscriptionRecordTypeEnum;
export const SUBSCRIPTION_GENERAL = 14 satisfies SubscriptionRecordTypeEnum;

// Field Report

export type FieldReportStatusEnum = components['schemas']['StatusBb2Enum'];
export const FIELD_REPORT_STATUS_EARLY_WARNING = 8 satisfies FieldReportStatusEnum;
export const FIELD_REPORT_STATUS_EVENT = 9 satisfies FieldReportStatusEnum;

export type Bulletin = components['schemas']['BulletinEnum'];
export const BULLETIN_PUBLISHED_NO = 0 satisfies Bulletin;
export const BULLETIN_PUBLISHED_PLANNED = 2 satisfies Bulletin;
export const BULLETIN_PUBLISHED_YES = 3 satisfies Bulletin;

type RequestChoices = components['schemas']['Key02bEnum'];
export const REQUEST_CHOICES_NO = 0 satisfies RequestChoices;

export type ContactType = 'Originator' | 'NationalSociety' | 'Federation' | 'Media';
export type OrganizationType = components['schemas']['Key1aeEnum'];
export type ReportType = components['schemas']['FieldReportTypesEnum'];
export type CategoryType = components['schemas']['KeyA87Enum'];

// Common

// FIXME: we need to identify a typesafe way to get this value
export const DISASTER_TYPE_EPIDEMIC = 1;

export type Visibility = components['schemas']['VisibilityD1bEnum'];
export const VISIBILITY_RCRC_MOVEMENT = 1 satisfies Visibility;
export const VISIBILITY_IFRC_SECRETARIAT = 2 satisfies Visibility;
export const VISIBILITY_PUBLIC = 3 satisfies Visibility;
export const VISIBILITY_IFRC_NS = 4 satisfies Visibility;
