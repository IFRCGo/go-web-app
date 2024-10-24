import { type components } from '#generated/types';

export const defaultChartMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

export const defaultChartPadding = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
};

// Map
export const DURATION_MAP_ZOOM = 1000;
export const DEFAULT_MAP_PADDING = 50;

// Storage

export const KEY_USER_STORAGE = 'user';
export const KEY_LANGUAGE_STORAGE = 'language';

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

// FIXME: should these constants satisfy an existing enum?
export const FORECAST_SEVERITY_UNKNOWN = 0;
export const FORECAST_SEVERITY_INFO = 1;
export const FORECAST_SEVERITY_WARNING = 2;
export const FORECAST_SEVERITY_DANGER = 3;

// Colors

export const COLOR_WHITE = '#ffffff';
export const COLOR_TEXT = '#313131';
export const COLOR_TEXT_ON_DARK = COLOR_WHITE;
export const COLOR_LIGHT_GREY = '#e0e0e0';
export const COLOR_DARK_GREY = '#a5a5a5';
export const COLOR_BLACK = '#000000';
export const COLOR_LIGHT_YELLOW = '#ffd470';
export const COLOR_YELLOW = '#ff9e00';
export const COLOR_BLUE = '#4c5d9b';
export const COLOR_LIGHT_BLUE = '#c7d3e0';
export const COLOR_ORANGE = '#ff8000';
export const COLOR_RED = '#f5333f';
export const COLOR_GREEN = '#8BB656';
export const COLOR_DARK_RED = '#730413';
export const COLOR_PRIMARY_BLUE = '#011e41';
export const COLOR_PRIMARY_RED = '#f5333f';

export const COLOR_ACTIVE_REGION = '#7d8b9d';

// Import template

export const FONT_FAMILY_HEADER = 'Montserrat';

// Three W

type OperationTypeEnum = components<'read'>['schemas']['DeploymentsProjectOperationTypeEnumKey'];
export const OPERATION_TYPE_PROGRAMME = 0 satisfies OperationTypeEnum;
export const OPERATION_TYPE_EMERGENCY = 1 satisfies OperationTypeEnum;
export const OPERATION_TYPE_MULTI = -1;

type ProgrammeTypeEnum = components<'read'>['schemas']['DeploymentsProjectProgrammeTypeEnumKey'];
export const PROGRAMME_TYPE_MULTILATERAL = 1 satisfies ProgrammeTypeEnum;
export const PROGRAMME_TYPE_DOMESTIC = 2 satisfies ProgrammeTypeEnum;
export const PROGRAMME_TYPE_BILATERAL = 0 satisfies ProgrammeTypeEnum;

type StatusTypeEnum = components<'read'>['schemas']['DeploymentsProjectStatusEnumKey'];
export const PROJECT_STATUS_COMPLETED = 2 satisfies StatusTypeEnum;
export const PROJECT_STATUS_ONGOING = 1 satisfies StatusTypeEnum;
export const PROJECT_STATUS_PLANNED = 0 satisfies StatusTypeEnum;

// DREF

// FIXME: fix typing in server (medium priority)
// This should not be the same as OperationType.
export type DrefStatus = components<'read'>['schemas']['DrefDrefStatusEnumKey'];
export const DREF_STATUS_COMPLETED = 1 satisfies DrefStatus;
export const DREF_STATUS_IN_PROGRESS = 0 satisfies DrefStatus;

export type TypeOfDrefEnum = components<'read'>['schemas']['DrefDrefDrefTypeEnumKey'];
export const DREF_TYPE_IMMINENT = 0 satisfies TypeOfDrefEnum;
export const DREF_TYPE_ASSESSMENT = 1 satisfies TypeOfDrefEnum;
export const DREF_TYPE_RESPONSE = 2 satisfies TypeOfDrefEnum;
export const DREF_TYPE_LOAN = 3 satisfies TypeOfDrefEnum;

type TypeOfOnsetEnum = components<'read'>['schemas']['TypeValidatedEnum'];
export const ONSET_SLOW = 1 satisfies TypeOfOnsetEnum;

// Subscriptions
type SubscriptionRecordTypeEnum = components<'read'>['schemas']['RtypeEnum'];
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

export type FieldReportStatusEnum = components<'read'>['schemas']['ApiFieldReportStatusEnumKey'];
export const FIELD_REPORT_STATUS_EARLY_WARNING = 8 satisfies FieldReportStatusEnum;
export const FIELD_REPORT_STATUS_EVENT = 9 satisfies FieldReportStatusEnum;

export type Bulletin = components<'read'>['schemas']['ApiFieldReportBulletinEnumKey'];
export const BULLETIN_PUBLISHED_NO = 0 satisfies Bulletin;
export const BULLETIN_PUBLISHED_PLANNED = 2 satisfies Bulletin;
export const BULLETIN_PUBLISHED_YES = 3 satisfies Bulletin;

// FIXME: this should be fixed in the server
type RequestChoices = components<'read'>['schemas']['ApiFieldReportBulletinEnumKey'];
export const REQUEST_CHOICES_NO = 0 satisfies RequestChoices;

export type ContactType = 'Originator' | 'NationalSociety' | 'Federation' | 'Media';
export type OrganizationType = components<'read'>['schemas']['ApiActionOrgEnumKey'];
export type ReportType = components<'read'>['schemas']['ApiActionTypeEnumKey'];
export type CategoryType = components<'read'>['schemas']['ApiActionCategoryEnumKey'];

// Common

// FIXME: we need to identify a typesafe way to get this value
export const DISASTER_TYPE_EPIDEMIC = 1;

export type Visibility = components<'read'>['schemas']['ApiVisibilityChoicesEnumKey'];
export const VISIBILITY_RCRC_MOVEMENT = 1 satisfies Visibility;
export const VISIBILITY_IFRC_SECRETARIAT = 2 satisfies Visibility;
export const VISIBILITY_PUBLIC = 3 satisfies Visibility;
export const VISIBILITY_IFRC_NS = 4 satisfies Visibility;

export type DisasterCategory = components<'read'>['schemas']['ApiAlertLevelEnumKey'];
export const DISASTER_CATEGORY_YELLOW = 0 satisfies DisasterCategory;
export const DISASTER_CATEGORY_ORANGE = 1 satisfies DisasterCategory;
export const DISASTER_CATEGORY_RED = 2 satisfies DisasterCategory;

export const COUNTRY_AMERICAS_REGION = 282;
export const COUNTRY_ASIA_REGION = 283;
export const COUNTRY_AFRICA_REGION = 285;
export const COUNTRY_EUROPE_REGION = 286;
export const COUNTRY_MENA_REGION = 287;

export type Region = components<'read'>['schemas']['ApiRegionNameEnumKey'];
export const REGION_AFRICA = 0 satisfies Region;
export const REGION_AMERICAS = 1 satisfies Region;
export const REGION_ASIA = 2 satisfies Region;
export const REGION_EUROPE = 3 satisfies Region;
export const REGION_MENA = 4 satisfies Region;

type CountryRecordTypeEnum = components<'read'>['schemas']['ApiCountryTypeEnumKey'];
export const COUNTRY_RECORD_TYPE_COUNTRY = 1 satisfies CountryRecordTypeEnum;
export const COUNTRY_RECORD_TYPE_CLUSTER = 2 satisfies CountryRecordTypeEnum;
export const COUNTRY_RECORD_TYPE_REGION = 3 satisfies CountryRecordTypeEnum;
export const COUNTRY_RECORD_TYPE_COUNTRY_OFFICE = 4 satisfies CountryRecordTypeEnum;
export const COUNTRY_RECORD_TYPE_REPRESENTATIVE_OFFICE = 5 satisfies CountryRecordTypeEnum;

type SurgeAlertTypeEnum = components<'read'>['schemas']['NotificationsSurgeAlertStatusEnumKey'];
export const SURGE_ALERT_STATUS_OPEN = 0 satisfies SurgeAlertTypeEnum;
export const SURGE_ALERT_STATUS_STOOD_DOWN = 1 satisfies SurgeAlertTypeEnum;
export const SURGE_ALERT_STATUS_CLOSED = 2 satisfies SurgeAlertTypeEnum;

export const NUM_X_AXIS_TICKS_MIN = 3;
export const NUM_X_AXIS_TICKS_MAX = 12;

export const DEFAULT_X_AXIS_HEIGHT = 26;
export const DEFAULT_Y_AXIS_WIDTH = 46;
export const DEFAULT_Y_AXIS_WIDTH_WITH_LABEL = 66;

export type SupportedByOrganizationType = components<'read'>['schemas']['PerSupportedByOrganizationTypeEnumKey'];
export const UN_ORGANIZATION = 0;
export const PRIVATE_SECTOR = 1;
export const GOVERNMENT = 2;
export const NATIONAL_SOCIETY = 3;

export const MAX_PAGE_LIMIT = 9999;
