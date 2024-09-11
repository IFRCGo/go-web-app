import {
    ChartAxes,
    ChartContainer,
} from '@ifrc-go/ui';
import { DEFAULT_INVALID_TEXT } from '@ifrc-go/ui/utils';
import { listToMap } from '@togglecorp/fujs';

import useNumericChartData from '#hooks/useNumericChartData';
import { defaultChartMargin } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type PerFormAreaResponse = GoApiResponse<'/api/v2/per-formarea/'>;

interface Props {
    data: {
        id: number;
        areaNum: number | undefined;
        // FIXME: check why title can be undefined?
        title: string | null | undefined;
        value: number;
    }[] | undefined;
    colors: string[];
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
    formAreaOptions: PerFormAreaResponse['results'] | undefined;
}

function RatingByAreaChart(props: Props) {
    const {
        data,
        ratingOptions,
        formAreaOptions,
        colors,
    } = props;

    const ratingTitleMap = listToMap(
        ratingOptions,
        (option) => option.value,
        (option) => option.title,
    );

    const formAreaMap = listToMap(
        formAreaOptions,
        (option) => option.area_num ?? DEFAULT_INVALID_TEXT,
        (option) => option.title,
    );

    const chartData = useNumericChartData(
        data,
        {
            chartMargin: {
                ...defaultChartMargin,
                top: 10,
            },
            keySelector: (datum) => datum.id,
            xValueSelector: (datum) => datum.areaNum,
            yValueSelector: (datum) => datum.value,
            yAxisTickLabelSelector: (rating) => ratingTitleMap?.[rating],
            xAxisTickLabelSelector: (areaNum) => formAreaMap?.[areaNum],
            yDomain: { min: 0, max: 5 },
            numYAxisTicks: 6,
            xDomain: { min: 1, max: 5 },
            numXAxisTicks: 5,
            yAxisWidth: 100,
            xAxisHeight: 36,
        },
    );

    const barWidth = 10;

    return (
        <ChartContainer
            className={styles.ratingByAreaChart}
            chartData={chartData}
        >
            <ChartAxes
                chartData={chartData}
            />
            {chartData.chartPoints.map(
                (point, index) => (
                    <g key={point.key}>
                        {point.originalData.value !== 0 && (
                            <text
                                className={styles.text}
                                textAnchor="middle"
                                dy={-10}
                                dx={barWidth / 2}
                                x={point.x - barWidth / 2}
                                y={point.y}
                            >
                                {Number(point.originalData.value.toFixed(2))
                                    ?? DEFAULT_INVALID_TEXT}
                            </text>
                        )}
                        <rect
                            fill={colors[index % colors.length]}
                            x={point.x - barWidth / 2}
                            y={point.y}
                            ry={barWidth / 2}
                            width={barWidth}
                            height={
                                Math.max(
                                    chartData.dataAreaSize.height
                                    - point.y
                                    + chartData.dataAreaOffset.top,
                                    0,
                                )
                            }
                        />
                    </g>
                ),
            )}
        </ChartContainer>
    );
}

export default RatingByAreaChart;
