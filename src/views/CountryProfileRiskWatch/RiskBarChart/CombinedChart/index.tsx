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
import Tooltip from '#components/Tooltip';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import DateOutput from '#components/DateOutput';
import NumberOutput from '#components/NumberOutput';
import useChartData, { ChartOptions } from '#hooks/useChartData';
import {
    getDataWithTruthyHazardType,
    monthNumberToNameMap,
    getFiRiskDataItem,
    getWfRiskDataItem,
    hazardTypeToColorMap,
    riskScoreToCategory,
    RiskMetricOption,
} from '#utils/domain/risk';
import { type components } from '#generated/riskTypes';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
    defaultChartMargin,
    defaultChartPadding,
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

const today = new Date();

const X_AXIS_HEIGHT = 24;
const Y_AXIS_WIDTH = 56;
const BAR_GAP = 2;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 10,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

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

    const hazardData = useMemo(
        () => {
            const monthKeys = Object.keys(selectedMonths) as unknown as (
                keyof typeof selectedMonths
            )[];

            const hazardKeysFromSelectedRisk = Object.keys(filteredRiskData ?? {}) as HazardType[];
            const currentYear = new Date().getFullYear();

            return (
                monthKeys.map(
                    (monthKey) => {
                        const month = monthNumberToNameMap[monthKey];
                        const value = listToMap(
                            hazardKeysFromSelectedRisk,
                            (hazardKey) => hazardKey,
                            (hazardKey) => (filteredRiskData?.[hazardKey]?.[month] ?? 0),
                        );

                        return {
                            value,
                            month,
                            date: new Date(currentYear, monthKey, 1),
                        };
                    },
                )
            );
        },
        [filteredRiskData],
    );

    const yAxisLabelSelector = useCallback(
        (value: number) => {
            if (selectedRiskMetricDetail.key === 'riskScore') {
                return riskCategoryToLabelMap[value];
            }

            return (
                <NumberOutput
                    value={value}
                    compact
                    maximumFractionDigits={0}
                />
            );
        },
        [riskCategoryToLabelMap, selectedRiskMetricDetail.key],
    );

    const chartOptions = useMemo<ChartOptions<typeof hazardData[number]>>(
        () => ({
            containerRef,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            chartOffset,
            type: 'numeric',
            keySelector: (datum) => datum.month,
            xValueSelector: (datum) => (
                datum.date.getMonth()
            ),
            yValueSelector: (datum) => Math.max(...Object.values(datum.value)),
            xAxisLabelSelector: (month) => new Date(today.getFullYear(), month, 1).toLocaleString(
                navigator.language,
                { month: 'short' },
            ),
            yAxisLabelSelector,
            xDomain: {
                min: 0,
                max: 11,
            },
            yAxisScale: selectedRiskMetricDetail.key === 'riskScore' ? 'linear' : 'cbrt',
            yAxisStartsFromZero: true,
        }),
        [yAxisLabelSelector, selectedRiskMetricDetail.key],
    );

    const {
        dataPoints,
        chartSize,
        xAxisTicks,
        yAxisTicks,
        yScaleFn,
    } = useChartData(
        hazardData,
        chartOptions,
    );

    function getChartHeight(y: number) {
        return isDefined(y)
            ? Math.max(
                chartSize.height
                    - y
                    - defaultChartPadding.bottom
                    - defaultChartMargin.bottom
                    - chartOffset.bottom,
                0,
            ) : 0;
    }

    const xAxisDiff = xAxisTicks.length > 1
        ? xAxisTicks[1].x - xAxisTicks[0].x
        : 0;
    const barGap = Math.min(BAR_GAP, xAxisDiff / 30);

    return (
        <div
            className={styles.combinedChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                <ChartAxes
                    xAxisPoints={xAxisTicks}
                    yAxisPoints={yAxisTicks}
                    chartSize={chartSize}
                    chartMargin={defaultChartMargin}
                    xAxisHeight={X_AXIS_HEIGHT}
                    yAxisWidth={Y_AXIS_WIDTH}
                />
                {dataPoints.map(
                    (datum) => (
                        <Fragment key={datum.key}>
                            {hazardListForDisplay.map(
                                ({ hazard_type: hazard, hazard_type_display }, hazardIndex) => {
                                    const value = datum.originalData.value[hazard];
                                    const y = yScaleFn(value);
                                    const height = getChartHeight(y);

                                    const offsetX = barGap;
                                    const numItems = hazardListForDisplay.length;

                                    const width = Math.max(
                                        // eslint-disable-next-line max-len
                                        (xAxisDiff / numItems) - offsetX * 2 - barGap * (numItems - 1),
                                        0,
                                    );
                                    // eslint-disable-next-line max-len
                                    const x = (datum.x - xAxisDiff / 2) + offsetX + (width + barGap) * hazardIndex;

                                    return (
                                        <rect
                                            key={hazard}
                                            x={x}
                                            y={y}
                                            width={width}
                                            height={height}
                                            fill={hazardTypeToColorMap[hazard]}
                                        >
                                            <Tooltip
                                                title={hazard_type_display}
                                                description={(
                                                    <>
                                                        <DateOutput
                                                            value={datum.originalData.date}
                                                            format="yyyy MMM"
                                                        />
                                                        {selectedRiskMetricDetail.key === 'riskScore' ? (
                                                            <TextOutput
                                                                // FIXME: use strings
                                                                label="Risk score"
                                                                // eslint-disable-next-line max-len
                                                                value={riskCategoryToLabelMap[value]}
                                                                strongValue
                                                            />
                                                        ) : (
                                                            <TextOutput
                                                                // eslint-disable-next-line max-len
                                                                label={selectedRiskMetricDetail.label}
                                                                value={value}
                                                                valueType="number"
                                                                maximumFractionDigits={0}
                                                                strongValue
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </rect>
                                    );
                                },
                            )}
                        </Fragment>
                    ),
                )}
            </svg>
        </div>
    );
}

export default CombinedChart;
