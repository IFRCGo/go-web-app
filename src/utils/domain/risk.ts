import {
    compareNumber,
    isDefined,
    isFalsyString,
    isNotDefined,
    listToGroupList,
    mapToList,
    mapToMap,
    unique,
} from '@togglecorp/fujs';

import type { paths, components } from '#generated/riskTypes';
import { sumSafe, maxSafe, avgSafe } from '#utils/common';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_VERY_LOW,
    COLOR_HAZARD_CYCLONE,
    COLOR_HAZARD_DROUGHT,
    COLOR_HAZARD_EARTHQUAKE,
    COLOR_HAZARD_FLOOD,
    COLOR_HAZARD_FOOD_INSECURITY,
    COLOR_HAZARD_STORM,
    COLOR_HAZARD_WILDFIRE,
    COLOR_LIGHT_GREY,
} from '#utils/constants';

export type HazardType = components['schemas']['HazardTypeEnum'];

export const hazardTypeToColorMap: Record<HazardType, string> = {
    EQ: COLOR_HAZARD_EARTHQUAKE,
    FL: COLOR_HAZARD_FLOOD,
    TC: COLOR_HAZARD_CYCLONE,
    EP: COLOR_LIGHT_GREY,
    FI: COLOR_HAZARD_FOOD_INSECURITY,
    SS: COLOR_HAZARD_STORM,
    DR: COLOR_HAZARD_DROUGHT,
    TS: COLOR_HAZARD_CYCLONE,
    CD: COLOR_LIGHT_GREY,
    WF: COLOR_HAZARD_WILDFIRE,
};

export function getDataWithTruthyHazardType<
    HAZARD_TYPE extends HazardType | '',
    DATA extends { hazard_type?: HAZARD_TYPE | undefined | null }
>(data: DATA) {
    if (isFalsyString(data.hazard_type)) {
        return undefined;
    }

    return {
        ...data,
        hazard_type: data.hazard_type as HazardType,
    };
}

export interface RiskDataItem {
    january?: number | null,
    february?: number | null,
    march?: number | null,
    april?: number | null,
    may?: number | null,
    june?: number | null,
    july?: number | null,
    august?: number | null,
    september?: number | null,
    october?: number | null,
    november?: number | null,
    december?: number | null,
    annual_average?: number | null,
}

export const monthNumberToNameMap: Record<number, keyof RiskDataItem> = {
    0: 'january',
    1: 'february',
    2: 'march',
    3: 'april',
    4: 'may',
    5: 'june',
    6: 'july',
    7: 'august',
    8: 'september',
    9: 'october',
    10: 'november',
    11: 'december',
    // FIXME: we should not have these different
    // class of data into same list
    12: 'annual_average',
};

export function getValueForSelectedMonths(
    selectedMonths: Record<number, boolean> | undefined,
    riskDataItem: RiskDataItem | undefined,
    aggregationMode: 'sum' | 'max' = 'sum',
) {
    if (!selectedMonths) {
        return riskDataItem?.annual_average ?? undefined;
    }

    const monthKeys = Object.keys(
        monthNumberToNameMap,
    ) as unknown as (keyof typeof monthNumberToNameMap)[];

    const valueList = monthKeys.map(
        (key) => (
            selectedMonths[key]
                ? riskDataItem?.[monthNumberToNameMap[key]]
                : undefined
        ),
    );

    if (aggregationMode === 'max') {
        return maxSafe(valueList);
    }

    return sumSafe(valueList);
}

type GetCountrySeasonal = paths['/api/v1/country-seasonal/']['get'];
type CountrySeasonal = GetCountrySeasonal['responses']['200']['content']['application/json'];
type IpcData = CountrySeasonal[number]['ipc_displacement_data'];
type GwisData = CountrySeasonal[number]['gwis'];
type IpcEstimationType = components['schemas']['EstimationTypeEnum'];

const estimationPriorityMap: Record<IpcEstimationType, number> = {
    current: 0,
    first_projection: 1,
    second_projection: 2,
};

export function getPrioritizedIpcData(data: IpcData) {
    // For IPC, we can have multiple estimations or observed value
    // for same year and month.
    // So we need to prioritize entries that is from latest
    // observation or predection
    // So the priority order is
    // Observed > Estimated
    // Latest analysis date

    // We sort the data by year, month first and then priority
    // so that it's easier to extract the unique values
    // NOTE: unique will keep first entry as unique and discard
    // duplicate, so we need to sort by highest priority first
    const sortedData = data?.map(
        (item) => {
            if (isFalsyString(item.estimation_type) || item.estimation_type === '') {
                return undefined;
            }

            if (isFalsyString(item.analysis_date) || isNotDefined(item.total_displacement)) {
                return undefined;
            }

            return {
                ...item,
                estimation_type: item.estimation_type,
                analysis_date: item.analysis_date,
                estimation_priority: estimationPriorityMap[item.estimation_type],
                analysisTimestamp: new Date(item.analysis_date).getTime(),
                total_displacement: item.total_displacement,
            };
        },
    ).filter(isDefined).sort((a, b) => (
        compareNumber(a.year, b.year)
        || compareNumber(a.month, b.month)
        || compareNumber(a.estimation_priority, b.estimation_priority)
        || compareNumber(a.analysisTimestamp, b.analysisTimestamp, -1)
    )) ?? [];

    const uniqueData = unique(
        sortedData,
        (ipcDataItem) => `${ipcDataItem.year}-${ipcDataItem.month}`,
    );

    return uniqueData;
}

export function getAverageIpcData(uniqueData: IpcData) {
    const monthGroupedIpcData = listToGroupList(
        uniqueData,
        (datum) => datum.month,
        (datum) => datum.total_displacement,
    );

    const ipcRiskDataItem = mapToMap(
        monthGroupedIpcData,
        (key) => monthNumberToNameMap[Number(key) - 1],
        (item) => avgSafe(item),
    );

    const monthlyValueList = Object.values(ipcRiskDataItem ?? {});
    const annual_average = avgSafe(monthlyValueList);

    return {
        ...ipcRiskDataItem,
        annual_average,
    };
}

export function getFiRiskDataItem(data: IpcData | undefined) {
    if (isNotDefined(data) || data.length === 0) {
        return undefined;
    }

    const uniqueData = getPrioritizedIpcData(data);
    const ipcRiskDataItem = getAverageIpcData(uniqueData);

    // To get additional information (i.e. hazard type display, country details
    // which is common to all entry
    const firstData = data[0];

    return {
        hazard_type: 'FI' as const,
        hazard_type_display: firstData?.hazard_type_display,
        country_details: firstData?.country_details,
        ...ipcRiskDataItem,
    };
}

export function getWfRiskDataItem(data: GwisData | undefined) {
    if (isNotDefined(data) || data.length === 0) {
        return undefined;
    }

    const uniqueData = unique(
        data,
        (gwisDataItem) => `${gwisDataItem.year}-${gwisDataItem.month}`,
    );

    const monthGroupedGwisData = listToGroupList(
        uniqueData,
        (datum) => datum.month,
        (datum) => datum.dsr_avg,
    );

    const gwisRiskDataItem = mapToMap(
        monthGroupedGwisData,
        (monthKey) => monthNumberToNameMap[Number(monthKey) - 1],
        (item) => avgSafe(item),
    );

    const monthlyValueList = Object.values(gwisRiskDataItem);
    const annual_average = avgSafe(monthlyValueList);

    // To get additional information (i.e. hazard type display, country details
    // which is common to all entry
    const firstYearData = data[0];
    return {
        hazard_type: 'WF' as const,
        hazard_type_display: firstYearData?.hazard_type_display,
        country_details: firstYearData?.country_details,
        ...gwisRiskDataItem,
        annual_average,
    };
}

export function hasSomeDefinedValue(riskDataItem: RiskDataItem) {
    return mapToList(
        monthNumberToNameMap,
        // FIXME: we should avoid !== 0 condition
        (value) => isDefined(riskDataItem[value]) && riskDataItem[value] !== 0,
    ).some(Boolean);
}

type RiskCategory = 1 | 2 | 3 | 4 | 5;

export function riskScoreToCategory(
    score: number | undefined | null,
    hazardType: HazardType,
) {
    if (isNotDefined(score) || score <= 0) {
        return undefined;
    }

    // Wildfire categorization loosely based on
    // https://link.springer.com/article/10.1007/s11069-021-05054-4/tables/2
    //
    // Inform risk categorization based on
    // https://drmkc.jrc.ec.europa.eu/inform-index/INFORM-Risk/Results-and-data/moduleId/1782/id/453/controller/Admin/action/Results#inline-nav-2
    const scoreCategories = hazardType === 'WF' ? [
        { score: 1000, category: CATEGORY_RISK_VERY_HIGH },
        { score: 17, category: CATEGORY_RISK_HIGH },
        { score: 9, category: CATEGORY_RISK_MEDIUM },
        { score: 5, category: CATEGORY_RISK_LOW },
        { score: 2, category: CATEGORY_RISK_VERY_LOW },
    ] : [
        { score: 10, category: CATEGORY_RISK_VERY_HIGH },
        { score: 6.5, category: CATEGORY_RISK_HIGH },
        { score: 5, category: CATEGORY_RISK_MEDIUM },
        { score: 3.5, category: CATEGORY_RISK_LOW },
        { score: 2, category: CATEGORY_RISK_VERY_LOW },
    ];

    // Find category by comparing score to set of categories
    // We start from the smallest first so we reverse the list
    const currentCategory = scoreCategories.reverse().find(
        (category) => score <= category.score,
    );

    if (isNotDefined(currentCategory)) {
        return undefined;
    }

    return currentCategory.category as RiskCategory;
}

// TODO: implement full validation
export function isValidFeature(
    maybeFeature: unknown,
): maybeFeature is GeoJSON.Feature {
    if (isNotDefined(maybeFeature)) {
        return false;
    }

    if (typeof maybeFeature !== 'object') {
        return false;
    }

    const safeObj = maybeFeature as GeoJSON.Feature;
    if (safeObj.type !== 'Feature') {
        return false;
    }

    return true;
}

export function isValidFeatureCollection(
    maybeFeatureCollection: unknown,
): maybeFeatureCollection is GeoJSON.FeatureCollection {
    if (isNotDefined(maybeFeatureCollection)) {
        return false;
    }

    if (typeof maybeFeatureCollection !== 'object') {
        return false;
    }

    const safeObj = maybeFeatureCollection as GeoJSON.FeatureCollection;
    if (safeObj.type !== 'FeatureCollection') {
        return false;
    }

    if (!Array.isArray(safeObj.features)) {
        return false;
    }

    // TODO: validate each feature?

    return true;
}

// TODO: implement full validation
export function isValidPointFeature(
    maybePointFeature: unknown,
): maybePointFeature is GeoJSON.Feature<GeoJSON.Point> {
    if (!isValidFeature(maybePointFeature)) {
        return false;
    }

    const safeObj = maybePointFeature as GeoJSON.Feature<GeoJSON.Point>;
    if (safeObj.geometry && safeObj.geometry.type !== 'Point') {
        return false;
    }

    return true;
}

export interface HazardTypeOption {
    hazard_type: HazardType;
    hazard_type_display: string;
}

export type RiskMetric = 'exposure' | 'displacement' | 'riskScore';
export type RiskMetricOption = {
    key: RiskMetric,
    label: string;
    applicableHazards: HazardType[];
}

export function riskMetricKeySelector(option: RiskMetricOption) {
    return option.key;
}

export function hazardTypeKeySelector(option: HazardTypeOption) {
    return option.hazard_type;
}
export function hazardTypeLabelSelector(option: HazardTypeOption) {
    return option.hazard_type_display;
}

export const defaultApplicableHazards: Record<HazardType, boolean> = {
    EQ: false,
    FL: false,
    TC: false,
    EP: false,
    FI: false,
    SS: false,
    DR: false,
    TS: false,
    CD: false,
    WF: false,
};

export const applicableHazardsByRiskMetric: Record<RiskMetric, HazardType[]> = {
    exposure: ['TC', 'FL', 'FI'],
    displacement: ['TC', 'FL', 'SS'],
    riskScore: ['DR', 'TC', 'FL', 'WF'],
};
