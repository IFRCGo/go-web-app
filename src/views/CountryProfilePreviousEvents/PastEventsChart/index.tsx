import { type ElementRef, useRef, useMemo } from 'react';
import {
    encodeDate,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import ChartAxes from '#components/ChartAxes';
import useChartData from '#hooks/useChartData';
import { useRequest } from '#utils/restRequest';
import ChartPoint from '#components/TimeSeriesChart/ChartPoint';
import Tooltip from '#components/Tooltip';
import TextOutput from '#components/TextOutput';
import DateOutput from '#components/DateOutput';
import Container from '#components/Container';
import { defaultChartMargin, defaultChartPadding } from '#utils/constants';

import styles from './styles.module.css';

const today = new Date();

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 0,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

interface Props {
    countryId: string | undefined;
}

function PastEventsChart(props: Props) {
    const {
        countryId,
    } = props;

    const containerRef = useRef<ElementRef<'div'>>(null);

    const startDate = useMemo(
        () => {
            const startOfThisYear = new Date(today.getFullYear(), 0, 1);
            startOfThisYear.setHours(0, 0, 0, 0);
            const tenYearsAgo = new Date(startOfThisYear.getFullYear() - 10, 0, 1);
            tenYearsAgo.setHours(0, 0, 0, 0);

            return encodeDate(tenYearsAgo);
        },
        [],
    );

    const {
        // pending: historicalDisastersPending,
        response: historicalDisastersResponse,
    } = useRequest({
        skip: isNotDefined(countryId) || isNotDefined(startDate),
        url: '/api/v2/country/{id}/historical-disaster/',
        pathVariables: { id: countryId },
        query: { start_date: startDate },
    });

    const {
        dataPoints,
        xAxisTicks,
        yAxisTicks,
        chartSize,
    } = useChartData(
        historicalDisastersResponse?.filter(
            (event) => isDefined(event.targeted_population),
        ),
        {
            containerRef,
            chartOffset,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            keySelector: (datum, i) => `${datum.date}-${i}`,
            xValueSelector: (datum) => {
                const date = new Date(datum.date);
                return date.getTime();
            },
            type: 'temporal',
            xAxisLabelSelector: (timestamp) => (
                new Date(timestamp).toLocaleString(
                    navigator.language,
                    { year: 'numeric', month: 'short' },
                )
            ),
            yValueSelector: (datum) => datum.targeted_population,
        },
    );

    return (
        <Container
            // FIXME: use translations
            heading="Past events"
            className={styles.pastEventsChart}
            withHeaderBorder
        >
            <div
                className={styles.chartContainer}
                ref={containerRef}
            >
                <svg className={styles.svg}>
                    {dataPoints.map(
                        (dataPoint) => (
                            <ChartPoint
                                className={styles.dataPoint}
                                x={dataPoint.x}
                                y={dataPoint.y}
                                key={dataPoint.key}
                                hoverable
                            >
                                <Tooltip
                                    title={dataPoint.originalData.disaster_name}
                                    description={(
                                        <>
                                            <DateOutput
                                                value={dataPoint.originalData.date}
                                                format="yyyy MMM"
                                            />
                                            <TextOutput
                                                label="Targeted population"
                                                value={dataPoint.originalData.targeted_population}
                                                valueType="number"
                                            />
                                        </>
                                    )}
                                />
                            </ChartPoint>
                        ),
                    )}
                    <ChartAxes
                        xAxisPoints={xAxisTicks}
                        yAxisPoints={yAxisTicks}
                        chartSize={chartSize}
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
