import {
    Fragment,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToMap,
    mapToMap,
} from '@togglecorp/fujs';

import ChartAxes from '#components/ChartAxes';
import useSizeTracking from '#hooks/useSizeTracking';
import useTranslation from '#hooks/useTranslation';
import { getScaleFunction } from '#utils/chart';
import {
    getDataWithTruthyHazardType,
    getValueForSelectedMonths,
    monthNumberToNameMap,
    getFiRiskDataItem,
    getWfRiskDataItem,
    hazardTypeToColorMap,
    riskScoreToCategory,
    RiskMetricOption,
} from '#utils/domain/risk';
import { formatNumber } from '#utils/common';
import { type components } from '#generated/riskTypes';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryRiskResponse = RiskApiResponse<'/api/v1/country-seasonal/'>;
type RiskData = CountryRiskResponse[number];
type HazardType = components<'read'>['schemas']['HazardTypeEnum'];

const selectedMonths = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
};

const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { month: 'short' },
);

interface Props {
    riskData: RiskData | undefined;
    selectedRiskMetricDetail: RiskMetricOption;
    selectedHazardType: HazardType | undefined;
    hazardListForDisplay: {
        hazard_type: HazardType;
        hazard_type_display: string;
    }[];
}

function CombinedChart(props: Props) {
    const {
        riskData,
        selectedHazardType,
        selectedRiskMetricDetail,
        hazardListForDisplay,
    } = props;
    const strings = useTranslation(i18n);

    const containerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(containerRef);

    const X_AXIS_HEIGHT = 24;
    const Y_AXIS_WIDTH = selectedRiskMetricDetail.key === 'riskScore' ? 72 : 48;
    const CHART_OFFSET = 10;

    const chartMargin = useMemo(
        () => ({
            left: Y_AXIS_WIDTH + CHART_OFFSET,
            top: CHART_OFFSET * 2,
            right: CHART_OFFSET,
            bottom: X_AXIS_HEIGHT + CHART_OFFSET,
        }),
        [X_AXIS_HEIGHT, Y_AXIS_WIDTH, CHART_OFFSET],
    );

    const riskCategoryToLabelMap: Record<number, string> = useMemo(
        () => ({
            [CATEGORY_RISK_VERY_LOW]: strings.riskBarChartVeryLowLabel,
            [CATEGORY_RISK_LOW]: strings.riskBarChartLowLabel,
            [CATEGORY_RISK_MEDIUM]: strings.riskBarChartMediumLabel,
            [CATEGORY_RISK_HIGH]: strings.riskBarChartHighLabel,
            [CATEGORY_RISK_VERY_HIGH]: strings.riskBarChartVeryHighLabel,
        }),
        [
            strings.riskBarChartVeryLowLabel,
            strings.riskBarChartLowLabel,
            strings.riskBarChartMediumLabel,
            strings.riskBarChartHighLabel,
            strings.riskBarChartVeryHighLabel,
        ],
    );

    const fiRiskDataItem = useMemo(
        () => getFiRiskDataItem(riskData?.ipc_displacement_data),
        [riskData],
    );
    const wfRiskDataItem = useMemo(
        () => getWfRiskDataItem(riskData?.gwis),
        [riskData],
    );

    const selectedRiskData = useMemo(
        () => {
            if (selectedRiskMetricDetail.key === 'displacement') {
                return listToMap(
                    riskData?.idmc
                        ?.map(getDataWithTruthyHazardType)
                        ?.filter(isDefined) ?? [],
                    (data) => data.hazard_type,
                );
            }

            if (selectedRiskMetricDetail.key === 'riskScore') {
                return {
                    ...listToMap(
                        riskData?.inform_seasonal
                            ?.map(getDataWithTruthyHazardType)
                            ?.filter(isDefined)
                            ?.map((riskItem) => ({
                                ...riskItem,
                                ...mapToMap(
                                    monthNumberToNameMap,
                                    (_, monthName) => monthName,
                                    (monthName) => riskScoreToCategory(
                                        riskItem?.[monthName],
                                        riskItem?.hazard_type,
                                    ),
                                ),
                            })) ?? [],
                        (data) => data.hazard_type,
                    ),
                    WF: {
                        ...wfRiskDataItem,
                        ...mapToMap(
                            monthNumberToNameMap,
                            (_, monthName) => monthName,
                            (monthName) => riskScoreToCategory(
                                wfRiskDataItem?.[monthName],
                                'WF',
                            ),
                        ),
                    },
                };
            }

            const rasterDisplacementData = listToMap(
                riskData?.raster_displacement_data
                    ?.map(getDataWithTruthyHazardType)
                    ?.filter(isDefined) ?? [],
                (datum) => datum.hazard_type,
            );

            if (isNotDefined(fiRiskDataItem)) {
                return rasterDisplacementData;
            }

            return {
                ...rasterDisplacementData,
                FI: fiRiskDataItem,
            };
        },
        [riskData, selectedRiskMetricDetail, fiRiskDataItem, wfRiskDataItem],
    );

    const filteredRiskData = useMemo(
        () => {
            if (isNotDefined(selectedHazardType)) {
                return selectedRiskData;
            }

            const riskDataItem = selectedRiskData[selectedHazardType];

            return {
                [selectedHazardType]: riskDataItem,
            };
        },
        [selectedRiskData, selectedHazardType],
    );

    const maxValue = useMemo(
        () => {
            const maxValueList = Object.values(filteredRiskData ?? {}).map(
                (riskDataItem) => (
                    getValueForSelectedMonths(
                        selectedMonths,
                        riskDataItem,
                        'max',
                    ) ?? 0
                ),
            );

            if (maxValueList.length === 0) {
                return 0;
            }

            return Math.max(...maxValueList);
        },
        [filteredRiskData],
    );

    const yScale = useMemo(
        () => getScaleFunction(
            { min: 0, max: maxValue },
            { min: 0, max: chartBounds.height },
            { start: chartMargin.top, end: chartMargin.bottom },
            true,
            selectedRiskMetricDetail.key === 'riskScore' ? 'linear' : 'cbrt',
        ),
        [chartBounds, maxValue, selectedRiskMetricDetail, chartMargin],
    );

    const yAxisPoints = useMemo(
        () => {
            if (maxValue === 0) {
                return [];
            }

            const numYAxisPoints = 6;
            const diff = maxValue / (numYAxisPoints - 1);

            return Array.from(Array(numYAxisPoints).keys()).map(
                (key) => {
                    const value = diff * key;
                    return {
                        key,
                        dataValue: value,
                        value: yScale(value),
                    };
                },
            );
        },
        [maxValue, yScale],
    );

    const chartData = useMemo(
        () => {
            const xScale = getScaleFunction(
                { min: 0, max: 12 },
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const monthKeys = Object.keys(selectedMonths) as unknown as (
                keyof typeof selectedMonths
            )[];

            const hazardKeysFromSelectedRisk = Object.keys(filteredRiskData ?? {}) as HazardType[];
            const currentYear = new Date().getFullYear();

            return (
                monthKeys.map(
                    (monthKey) => {
                        const month = monthNumberToNameMap[monthKey];
                        const x = xScale(monthKey);
                        const value = listToMap(
                            hazardKeysFromSelectedRisk,
                            (hazardKey) => hazardKey,
                            (hazardKey) => (filteredRiskData?.[hazardKey]?.[month] ?? 0),
                        );
                        const y = mapToMap(
                            value,
                            (hazardKey) => hazardKey,
                            (hazardValue) => yScale(hazardValue),
                        );

                        return {
                            x,
                            y,
                            value,
                            month,
                            date: new Date(currentYear, monthKey, 1),
                        };
                    },
                )
            );
        },
        [filteredRiskData, chartBounds, yScale, chartMargin],
    );

    const xAxisTickSelector = useCallback(
        (chartPoint: (typeof chartData)[number]) => ({
            x: chartPoint.x,
            y: chartBounds.height - CHART_OFFSET,
            label: xAxisFormatter(chartPoint.date),
        }),
        [chartBounds],
    );

    const yAxisTickSelector = useCallback(
        (chartPoint: (typeof yAxisPoints)[number]) => ({
            x: Y_AXIS_WIDTH,
            y: chartPoint.value,
            label: selectedRiskMetricDetail?.key === 'riskScore'
                ? riskCategoryToLabelMap[chartPoint.dataValue]
                : formatNumber(
                    chartPoint.dataValue,
                    { compact: true, maximumFractionDigits: 0 },
                ),
        }),
        [Y_AXIS_WIDTH, selectedRiskMetricDetail, riskCategoryToLabelMap],
    );

    // TODO: improve the bar sizes
    const maxBarWidth = ((chartBounds.width - chartMargin.right - chartMargin.left) / 12);
    const barMonthPadding = (maxBarWidth * 0.1) / 2;
    const barGap = 2;
    const numHazards = hazardListForDisplay.length || 1;
    const barWidth = maxBarWidth / numHazards - barMonthPadding - barGap;

    return (
        <div
            className={styles.combinedChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                <ChartAxes
                    xAxisPoints={chartData}
                    yAxisPoints={yAxisPoints}
                    chartBounds={chartBounds}
                    chartMargin={chartMargin}
                    chartOffset={CHART_OFFSET}
                    xAxisTickSelector={xAxisTickSelector}
                    yAxisTickSelector={yAxisTickSelector}
                />
                {chartData.map(
                    (datum) => (
                        <Fragment key={datum.month}>
                            {hazardListForDisplay.map(
                                ({ hazard_type: hazard, hazard_type_display }, i) => (
                                    <rect
                                        key={hazard}
                                        x={datum.x
                                            + (barWidth + barGap) * i
                                            + barMonthPadding}
                                        y={datum.y[hazard] ?? 0}
                                        width={Math.max(barWidth, 0)}
                                        height={(
                                            isDefined(datum.y[hazard])
                                                ? Math.max(
                                                    chartBounds.height
                                                        - (datum.y[hazard] ?? 0)
                                                        - chartMargin.bottom,
                                                    0,
                                                ) : 0
                                        )}
                                        fill={hazardTypeToColorMap[hazard]}
                                    >
                                        {selectedRiskMetricDetail.key === 'riskScore' ? (
                                            <title>
                                                {`${hazard_type_display}: ${riskCategoryToLabelMap[datum.value[hazard]]}`}
                                            </title>
                                        ) : (
                                            <title>
                                                {`${hazard_type_display}: ${formatNumber(datum.value[hazard], { maximumFractionDigits: 0 })}`}
                                            </title>
                                        )}
                                    </rect>
                                ),
                            )}
                        </Fragment>
                    ),
                )}
            </svg>
        </div>
    );
}

export default CombinedChart;
