import {
    ElementRef,
    useRef,
} from 'react';
import { ChartAxes } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    getDiscretePathDataList,
    resolveToString,
} from '@ifrc-go/ui/utils';

import useChartData from '#hooks/useChartData';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type LatestPerResponse = GoApiResponse<'/api/v2/latest-per-overview/'>;
type PreviousRatings = NonNullable<LatestPerResponse['results']>[number]['assessment_ratings'];

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 20;
const DEFAULT_CHART_MARGIN = 40;

const chartMargin = {
    left: DEFAULT_CHART_MARGIN,
    top: DEFAULT_CHART_MARGIN,
    right: DEFAULT_CHART_MARGIN,
    bottom: DEFAULT_CHART_MARGIN,
};

const chartPadding = {
    left: 20,
    top: 10,
    right: 20,
    bottom: 10,
};

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 0,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

interface Props {
    data: PreviousRatings;
}

function PreviousAssessmentCharts(props: Props) {
    // FIXME: we need rating_display for average_rating
    const strings = useTranslation(i18n);
    const { data } = props;
    const containerRef = useRef<ElementRef<'div'>>(null);

    const {
        dataPoints,
        xAxisTicks,
        yAxisTicks,
        chartSize,
    } = useChartData(
        data,
        {
            containerRef,
            chartOffset,
            chartMargin,
            chartPadding,
            keySelector: (datum) => datum.assessment_number,
            xValueSelector: (datum) => datum.assessment_number,
            type: 'categorical',
            xAxisLabelSelector: (datum) => resolveToString(
                strings.cycleLabel,
                {
                    assessmentNumber: datum.assessment_number,
                    assessmentDate: formatDate(datum.date_of_assessment, 'yyyy') ?? '',
                },
            ),
            yValueSelector: (datum) => datum.average_rating ?? 0,
        },
    );

    return (
        <div
            className={styles.previousAssessmentChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                <ChartAxes
                    xAxisPoints={xAxisTicks}
                    yAxisPoints={yAxisTicks}
                    chartSize={chartSize}
                    chartMargin={chartMargin}
                    xAxisHeight={X_AXIS_HEIGHT}
                    yAxisWidth={Y_AXIS_WIDTH}
                />
                {dataPoints && (
                    <path
                        // NOTE: only drawing first path
                        // FIXME: we cannot guarantee that the array will have
                        // at least one element
                        d={getDiscretePathDataList(dataPoints)[0]}
                        fill="none"
                        className={styles.path}
                    />
                )}
                {dataPoints.map(
                    (point) => (
                        <g key={point.key}>
                            <text
                                className={styles.text}
                                textAnchor="middle"
                                dy={-15}
                                x={point.x}
                                y={point.y}
                            >
                                {Number(point.originalData.average_rating?.toFixed(2)) ?? '-'}
                            </text>
                            <circle
                                className={styles.circle}
                                cx={point.x}
                                cy={point.y}
                            >
                                <title>
                                    {resolveToString(
                                        strings.assessmentLabel,
                                        {
                                            xValue: point.originalData.assessment_number,
                                            yValue: point.originalData.average_rating ?? '-',
                                        },
                                    )}
                                </title>
                            </circle>
                        </g>
                    ),
                )}
            </svg>
        </div>
    );
}

export default PreviousAssessmentCharts;
