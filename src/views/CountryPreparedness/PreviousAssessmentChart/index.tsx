import { ElementRef, useRef } from 'react';

import useChartData from '#hooks/useChartData';
import ChartAxisX from '#components/ChartAxisX';
import ChartAxisY from '#components/ChartAxisY';
import { formatDate } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';
import { getDiscretePathDataList } from '#utils/chart';

import styles from './styles.module.css';

type LatestPerResponse = GoApiResponse<'/api/v2/latest-per-overview/'>;
type PreviousRatings = NonNullable<LatestPerResponse['results']>[number]['assessment_ratings'];

interface Props {
    data: PreviousRatings;
}

function PreviousAssessmentCharts(props: Props) {
    // FIXME: we need rating_display for average_rating
    const { data } = props;
    const containerRef = useRef<ElementRef<'div'>>(null);

    const {
        chartBounds,
        chartData,
    } = useChartData(
        data,
        containerRef,
        {
            xValueSelector: (datum) => datum.assessment_number,
            xAxisLabelFormatter: (datum) => `Cycle ${datum.assessment_number} (${formatDate(datum.date_of_assessment, 'yyyy')})`,
            yValueSelector: (datum) => datum.average_rating ?? 0,
            keySelector: (datum) => datum.date_of_assessment,
            maxYValue: 5,
        },
    );

    return (
        <div
            className={styles.previousAssessmentChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                <ChartAxisX
                    chartBounds={chartBounds}
                    chartMargin={chartData.chartMargin}
                    chartInnerOffset={chartData.innerOffset}
                    ticks={chartData.xAxisTicks}
                />
                <ChartAxisY
                    chartBounds={chartBounds}
                    chartMargin={chartData.chartMargin}
                    chartInnerOffset={chartData.innerOffset}
                    ticks={chartData.yAxisTicks}
                />
                {chartData.points && (
                    <path
                        // NOTE: only drawing first path
                        // FIXME: we cannot guarantee that the array will have
                        // at least one element
                        d={getDiscretePathDataList(chartData.points)[0]}
                        fill="none"
                        className={styles.path}
                    />
                )}
                {chartData.points.map(
                    (point) => (
                        <circle
                            className={styles.circle}
                            key={point.key}
                            cx={point.x}
                            cy={point.y}
                        >
                            <title>
                                {/* FIXME: use translation */}
                                {`Assessment: ${point.xValue}, Rating: ${point.yValue ?? '-'}`}
                            </title>
                        </circle>
                    ),
                )}
            </svg>
        </div>
    );
}

export default PreviousAssessmentCharts;
