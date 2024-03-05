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
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import { DEFAULT_Y_AXIS_WIDTH_WITH_LABEL } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const strings = useTranslation(i18n);
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
            keySelector: (datum, i) => `${datum.date}-${i}`,
            xValueSelector: (datum) => datum.date,
            yValueSelector: (datum) => datum.targeted_population,
            yearlyChart: true,
            yAxisWidth: DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
        },
    );

    return (
        <Container
            heading={strings.pastEventsChartEvents}
            className={_cs(styles.pastEventsChart, className)}
            withHeaderBorder
        >
            <div
                className={styles.chartContainer}
                ref={containerRef}
            >
                <svg className={styles.svg}>
                    <ChartAxes
                        chartData={chartData}
                        yAxisLabel={strings.pastEventsPeopleExposed}
                    />
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
                                                label={strings.pastEventsTargetedPopulation}
                                                value={chartPoint.originalData.targeted_population}
                                                valueType="number"
                                            />
                                            <TextOutput
                                                label={strings.pastEventsAmountRequested}
                                                value={chartPoint.originalData.amount_requested}
                                                valueType="number"
                                            />
                                            <TextOutput
                                                label={strings.pastEventsAmountFunded}
                                                value={getPercentage(
                                                    chartPoint.originalData.amount_funded,
                                                    chartPoint.originalData.amount_requested,
                                                )}
                                                valueType="number"
                                                suffix="%"
                                            />
                                        </>
                                    )}
                                />
                            </ChartPoint>
                        ),
                    )}
                </svg>
            </div>
        </Container>
    );
}

export default PastEventsChart;
