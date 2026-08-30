import { type components } from '#generated/types';

type SummaryStatusEnum = components<'read'>['schemas']['OpsLearningSummaryStatusEnum'];

export const SUMMARY_STATUS_PENDING = 1 satisfies SummaryStatusEnum;
export const SUMMARY_STATUS_STARTED = 2 satisfies SummaryStatusEnum;
export const SUMMARY_STATUS_SUCCESS = 3 satisfies SummaryStatusEnum;
export const SUMMARY_NO_EXTRACT_AVAILABLE = 4 satisfies SummaryStatusEnum;
export const SUMMARY_STATUS_FAILED = 5 satisfies SummaryStatusEnum;
