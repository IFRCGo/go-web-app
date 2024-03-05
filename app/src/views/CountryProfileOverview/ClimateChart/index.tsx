import {
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    ChartAxes,
    Container,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    maxSafe,
    minSafe,
} from '@ifrc-go/ui/utils';
import {
    bound,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

const NUM_Y_AXIS_TICKS = 5;

interface Props {
    data: GoApiResponse<'/api/v2/country/{id}/databank/'>['key_climate'] | undefined;
}

function ClimateChart(props: Props) {
    const {
        data,
    } = props;

    const strings = useTranslation(i18n);

    const temperatureContainerRef = useRef<HTMLDivElement>(null);
    const precipitationContainerRef = useRef<HTMLDivElement>(null);

    const temperatureBounds = useMemo(
        () => {
            if (isNotDefined(data) || data.length === 0) {
                return undefined;
            }

            const minRaw = minSafe(data.map(({ min_temp }) => min_temp));
            const maxRaw = maxSafe(data.map(({ max_temp }) => max_temp));

            if (isNotDefined(minRaw) || isNotDefined(maxRaw)) {
                return undefined;
            }

            const min = Math.floor(minRaw);
            const max = Math.ceil(maxRaw);

            return { min, max };
        },
        [data],
    );

    const precipitationBounds = useMemo(
        () => {
            if (isNotDefined(data) || data.length === 0) {
                return undefined;
            }

            const maxRaw = maxSafe(data.map(({ precipitation }) => precipitation));

            if (isNotDefined(maxRaw)) {
                return undefined;
            }

            const max = Math.ceil(maxRaw);

            return { min: 0, max };
        },
        [data],
    );

    const temperatureChartData = useTemporalChartData(
        data,
        {
            containerRef: temperatureContainerRef,
            yearlyChart: true,
            keySelector: ({ id }) => id,
            xValueSelector: ({ year, month }) => new Date(year, month - 1, 1),
            yValueSelector: ({ min_temp }) => min_temp,
            yDomain: temperatureBounds,
            numYAxisTicks: NUM_Y_AXIS_TICKS,
        },
    );

    const precipitationChartData = useTemporalChartData(
        data,
        {
            containerRef: precipitationContainerRef,
            yearlyChart: true,
            keySelector: ({ id }) => id,
            xValueSelector: ({ year, month }) => new Date(year, month - 1, 1),
            yValueSelector: ({ precipitation }) => precipitation,
            yDomain: precipitationBounds,
        },
    );

    const dataByMonth = useMemo(
        () => listToMap(data, ({ month }) => month - 1),
        [data],
    );

    const temperatureTooltipSelector = useCallback(
        (key: string | number) => {
            const month = Number(key);
            if (Number.isNaN(month)) {
                return null;
            }

            const currentData = dataByMonth?.[month];

            if (isNotDefined(currentData)) {
                return null;
            }

            return (
                <Tooltip
                    title={currentData.month_display}
                    description={(
                        <>
                            <TextOutput
                                label={strings.climateChartMax}
                                value={currentData.max_temp}
                                valueType="number"
                            />
                            <TextOutput
                                label={strings.climateChangeAverage}
                                value={currentData.avg_temp}
                                valueType="number"
                            />
                            <TextOutput
                                label={strings.climateChangeMin}
                                value={currentData.min_temp}
                                valueType="number"
                            />
                        </>
                    )}
                />
            );
        },
        [
            dataByMonth,
            strings.climateChartMax,
            strings.climateChangeAverage,
            strings.climateChangeMin,
        ],
    );

    const precipitationTooltipSelector = useCallback(
        (key: string | number) => {
            const month = Number(key);
            if (Number.isNaN(month)) {
                return null;
            }

            const currentData = dataByMonth?.[month];

            if (isNotDefined(currentData)) {
                return null;
            }

            return (
                <Tooltip
                    title={currentData.month_display}
                    description={(
                        <TextOutput
                            label={strings.climateChangePrecipitation}
                            value={currentData.precipitation}
                            valueType="number"
                        />
                    )}
                />
            );
        },
        [dataByMonth, strings.climateChangePrecipitation],
    );

    const barWidth = bound(
        (temperatureChartData.dataAreaSize.width - 24) / 12,
        4,
        24,
    );

    return (
        <Container
            className={styles.climateChart}
            heading={strings.climateChangeChart}
            contentViewType="vertical"
            withHeaderBorder
        >
            <Container
                heading={strings.climateChartTemperature}
                headingLevel={5}
            >
                <div
                    ref={temperatureContainerRef}
                    className={styles.temperatureChartContainer}
                >
                    <svg className={styles.svg}>
                        <ChartAxes
                            chartData={temperatureChartData}
                            tooltipSelector={temperatureTooltipSelector}
                        />
                        <g className={styles.temperature}>
                            {temperatureChartData.chartPoints.map((chartPoint) => {
                                const minY = chartPoint.y;
                                const maxY = temperatureChartData.yScaleFn(
                                    chartPoint.originalData.max_temp,
                                );

                                return (
                                    <rect
                                        key={chartPoint.key}
                                        className={styles.rect}
                                        x={chartPoint.x - barWidth / 2}
                                        y={maxY}
                                        width={barWidth}
                                        height={Math.abs(minY - maxY)}
                                    />
                                );
                            })}
                        </g>
                    </svg>
                </div>
            </Container>
            <Container
                heading={strings.climateChangePrecipitation}
                headingLevel={5}
            >
                <div
                    ref={precipitationContainerRef}
                    className={styles.precipitationChartContainer}
                >
                    <svg className={styles.svg}>
                        <ChartAxes
                            chartData={precipitationChartData}
                            tooltipSelector={precipitationTooltipSelector}
                        />
                        <g className={styles.precipitation}>
                            {precipitationChartData.chartPoints.map((chartPoint) => (
                                <rect
                                    key={chartPoint.key}
                                    className={styles.rect}
                                    x={chartPoint.x - barWidth / 2}
                                    y={chartPoint.y}
                                    width={barWidth}
                                    height={(
                                        Math.max(
                                            precipitationChartData.dataAreaSize.height
                                            - chartPoint.y
                                            + precipitationChartData.dataAreaOffset.top,
                                            0,
                                        )
                                    )}
                                />
                            ))}
                        </g>
                    </svg>
                </div>
            </Container>
        </Container>
    );
}

export default ClimateChart;
