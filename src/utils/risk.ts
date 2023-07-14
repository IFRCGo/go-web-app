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
import { sumSafe, maxSafe, avgSafe } from '#utils/common';
import type { paths, components } from '#generated/riskTypes';
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
} from './constants';

type HazardType = components['schemas']['HazardTypeEnum'];

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
    12: 'annual_average',
};

export function getDisplacementForSelectedMonths(
    selectedMonths: Record<number, boolean> | undefined,
    riskDataItem: RiskDataItem | undefined,
    aggregationMode: 'sum' | 'max' = 'sum',
) {
    if (!selectedMonths) {
        return riskDataItem?.annual_average;
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

    const firstYearData = data[0];
    const monthlyValueList = Object.values(gwisRiskDataItem);
    const annual_average = avgSafe(monthlyValueList);

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

export function riskScoreToCategory(score: number | undefined | null, hazardType: HazardType) {
    if (isNotDefined(score) || score < 0) {
        return undefined;
    }

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

    const currentCategory = scoreCategories.reverse().filter(
        (category) => score <= category.score,
    );

    if (currentCategory.length === 0) {
        return undefined;
    }

    return currentCategory[0].category;
}
