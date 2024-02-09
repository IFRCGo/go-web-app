import {
    type ElementRef,
    useRef,
} from 'react';
import {
    ChartAxes,
    ChartPoint,
    Container,
    DateOutput,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import {
    defaultChartMargin,
    defaultChartPadding,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import styles from './styles.module.css';

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 0,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

interface Props {
    className?: string;
    countryId: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
}

function PastEventsChart(props: Props) {
    const {
        className,
        countryId,
        startDate,
        endDate,
    } = props;

    const containerRef = useRef<ElementRef<'div'>>(null);

    const {
        // pending: historicalDisastersPending,
        response: historicalDisastersResponse,
    } = useRequest({
        skip: isNotDefined(countryId)
            || isNotDefined(startDate)
            || isNotDefined(endDate),
        url: '/api/v2/country/{id}/historical-disaster/',
        pathVariables: { id: countryId },
        query: {
            start_date: startDate,
            end_date: endDate,
        },
    });

    const chartData = useTemporalChartData(
        historicalDisastersResponse,
        {
            containerRef,
            chartOffset,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            keySelector: (datum, i) => `${datum.date}-${i}`,
            xValueSelector: (datum) => datum.date,
            yValueSelector: (datum) => datum.targeted_population,
            yearlyChart: true,
        },
    );

    return (
        <Container
            // FIXME: use translations
            heading="Past events"
            className={_cs(styles.pastEventsChart, className)}
            withHeaderBorder
        >
            <div
                className={styles.chartContainer}
                ref={containerRef}
            >
                <svg className={styles.svg}>
                    {chartData.chartPoints.map(
                        (chartPoint) => (
                            <ChartPoint
                                className={styles.dataPoint}
                                x={chartPoint.x}
                                y={chartPoint.y}
                                key={chartPoint.key}
                                hoverable
                            >
                                <Tooltip
                                    title={chartPoint.originalData.disaster_name}
                                    description={(
                                        <>
                                            <DateOutput
                                                value={chartPoint.originalData.date}
                                                format="yyyy MMM"
                                            />
                                            <TextOutput
                                                // FIXME: use translations
                                                label="Targeted population"
                                                value={chartPoint.originalData.targeted_population}
                                                valueType="number"
                                            />
                                        </>
                                    )}
                                />
                            </ChartPoint>
                        ),
                    )}
                    <ChartAxes
                        xAxisPoints={chartData.xAxisTicks}
                        yAxisPoints={chartData.yAxisTicks}
                        chartSize={chartData.chartSize}
                        chartMargin={defaultChartMargin}
                        xAxisHeight={X_AXIS_HEIGHT}
                        yAxisWidth={Y_AXIS_WIDTH}
                    />
                </svg>
            </div>
        </Container>
    );
}

export default PastEventsChart;
