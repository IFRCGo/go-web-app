import {
    type ElementRef,
    useRef,
} from 'react';
import {
    ChartAxes,
    ChartPoint,
    DateOutput,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useChartData from '#hooks/useChartData';
import {
    defaultChartMargin,
    defaultChartPadding,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import styles from './styles.module.css';

const currentYear = new Date().getFullYear();
const firstDayOfYear = new Date(currentYear, 0, 1);
const lastDayOfYear = new Date(currentYear, 11, 31);

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 0,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

interface Props {
    startDate: string | undefined;
    countryId: string | undefined;
}

function EmergenciesOverMonth(props: Props) {
    const {
        startDate,
        countryId,
    } = props;

    const containerRef = useRef<ElementRef<'div'>>(null);

    const {
        // pending: disasterMonthlyCountPending,
        response: disasterMonthlyCountResponse,
    } = useRequest({
        skip: isNotDefined(countryId) || isNotDefined(startDate),
        url: '/api/v2/country/{id}/disaster-monthly-count/',
        pathVariables: { id: countryId },
        query: { start_date: startDate },
    });

    const {
        dataPoints,
        xAxisTicks,
        yAxisTicks,
        chartSize,
    } = useChartData(
        disasterMonthlyCountResponse?.filter(
            (countItem) => isDefined(countItem.targeted_population),
        ),
        {
            containerRef,
            chartOffset,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            keySelector: (datum, i) => `${datum.date}-${i}`,
            xValueSelector: (datum) => {
                const date = new Date(datum.date);
                date.setFullYear(currentYear);
                return date.getTime();
            },
            type: 'temporal',
            xAxisLabelSelector: (timestamp) => (
                new Date(timestamp).toLocaleString(
                    navigator.language,
                    { month: 'short' },
                )
            ),
            yValueSelector: (datum) => datum.targeted_population,
            xDomain: {
                min: firstDayOfYear.getTime(),
                max: lastDayOfYear.getTime(),
            },
            yAxisStartsFromZero: true,
        },
    );

    return (
        <div
            className={styles.emergenciesOverMonth}
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
                                        <DateOutput value={dataPoint.originalData.date} />
                                        <TextOutput
                                            // FIXME: use translation
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
    );
}

export default EmergenciesOverMonth;
