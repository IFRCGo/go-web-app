import {
    Fragment,
    useCallback,
    useMemo,
} from 'react';
import {
    ChartAxes,
    ChartContainer,
    NumberOutput,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { maxSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
    mapToMap,
} from '@togglecorp/fujs';

import { type components } from '#generated/riskTypes';
import useTemporalChartData from '#hooks/useTemporalChartData';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';
import {
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    getWfRiskDataItem,
    hazardTypeToColorMap,
    monthNumberToNameMap,
    type RiskMetricOption,
    riskScoreToCategory,
} from '#utils/domain/risk';
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

const BAR_GAP = 2;

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

    const riskCategoryToLabelMap: Record<number, string> = useMemo(
        () => ({
            [CATEGORY_RISK_VERY_LOW]: strings.riskBarChartVeryLowLabel,
            [CATEGORY_RISK_LOW]: strings.riskBarChartLowLabel,
            [CATEGORY_RISK_MEDIUM]: strings.riskBarChartMediumLabel,
            [CATEGORY_RISK_HIGH]: strings.riskBarChartHighLabel,
            [CATEGORY_RISK_VERY_HIGH]: strings.riskVeryHighLabel,
        }),
        [
            strings.riskBarChartVeryLowLabel,
            strings.riskBarChartLowLabel,
            strings.riskBarChartMediumLabel,
            strings.riskBarChartHighLabel,
            strings.riskVeryHighLabel,
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

    const yAxisTickLabelSelector = useCallback(
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

    const chartData = useTemporalChartData(
        hazardData,
        {
            keySelector: (datum) => datum.date.getTime(),
            xValueSelector: (datum) => datum.date,
            yValueSelector: (datum) => maxSafe(Object.values(datum.value)),
            yAxisTickLabelSelector,
            yearlyChart: true,
            yValueStartsFromZero: true,
            yAxisWidth: selectedRiskMetricDetail.key === 'riskScore' ? 80 : undefined,
            yScale: selectedRiskMetricDetail.key === 'riskScore' ? 'linear' : 'cbrt',
            yDomain: selectedRiskMetricDetail.key === 'riskScore' ? { min: 0, max: 5 } : undefined,
            numYAxisTicks: 6,
        },
    );

    function getChartHeight(y: number) {
        return isDefined(y)
            ? Math.max(
                chartData.dataAreaSize.height - y + chartData.dataAreaOffset.top,
                0,
            ) : 0;
    }

    const xAxisDiff = chartData.dataAreaSize.width / chartData.numXAxisTicks;
    const barGap = Math.min(BAR_GAP, xAxisDiff / 30);

    return (
        <ChartContainer
            className={styles.combinedChart}
            chartData={chartData}
        >
            <ChartAxes
                chartData={chartData}
            />
            {chartData.chartPoints.map(
                (datum) => (
                    <Fragment key={datum.key}>
                        {hazardListForDisplay.map(
                            ({ hazard_type: hazard, hazard_type_display }, hazardIndex) => {
                                const value = datum.originalData.value[hazard];
                                const y = chartData.yScaleFn(value);
                                const height = getChartHeight(y);

                                const offsetX = barGap;
                                const numItems = hazardListForDisplay.length;

                                const width = Math.max(

                                    (xAxisDiff / numItems) - offsetX * 2,
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
                                                    {datum.originalData.date.toLocaleDateString('default', { month: 'long' })}
                                                    {selectedRiskMetricDetail.key === 'riskScore' ? (
                                                        <TextOutput
                                                            label={strings.riskScoreLabel}
                                                            value={riskCategoryToLabelMap[value]}
                                                            strongValue
                                                        />
                                                    ) : (
                                                        <TextOutput
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
        </ChartContainer>
    );
}

export default CombinedChart;
