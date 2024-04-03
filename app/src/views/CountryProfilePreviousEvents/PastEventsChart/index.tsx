import {
    type ElementRef,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ChartAxes,
    ChartPoint,
    Container,
    DateOutput,
    SelectInput,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    stringLabelSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    encodeDate,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import { DEFAULT_Y_AXIS_WIDTH_WITH_LABEL } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type TimePeriodKey = 'last-five-years' | 'last-ten-years' | 'last-twenty-years';
type EventMetricKey = 'targeted_population' | 'amount_funded' | 'amount_requested';

function timePeriodKeySelector({ key }: { key: TimePeriodKey }) {
    return key;
}

function eventMetricKeySelector({ key }: { key: EventMetricKey }) {
    return key;
}

interface Props {
    className?: string;
    countryId: string | undefined;
}

function PastEventsChart(props: Props) {
    const {
        className,
        countryId,
    } = props;

    const strings = useTranslation(i18n);
    const containerRef = useRef<ElementRef<'div'>>(null);
    const [selectedTimePeriodKey, setSelectedTimePeriodKey] = useState<TimePeriodKey>('last-five-years');
    const [selectedEventMetricKey, setSelectedEventMetricKey] = useState<EventMetricKey>('targeted_population');

    const timePeriodOptions = useMemo<{
        key: TimePeriodKey;
        label: string;
        startDate: Date;
        endDate: Date;
    }[]>(
        () => {
            const now = new Date();

            return [
                {
                    key: 'last-five-years',
                    label: strings.filterLastFiveYearsLabel,
                    startDate: new Date(now.getFullYear() - 5, 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                },
                {
                    key: 'last-ten-years',
                    label: strings.filterLastTenYearsLabel,
                    startDate: new Date(now.getFullYear() - 10, 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                },
            ];
        },
        [strings],
    );

    const timePeriodMap = useMemo(
        () => listToMap(timePeriodOptions, ({ key }) => key),
        [timePeriodOptions],
    );

    const eventMetricOptions = useMemo<{
        key: EventMetricKey,
        label: string;
    }[]>(
        () => [
            {
                key: 'targeted_population',
                label: strings.pastEventsTargetedPopulation,
            },
            {
                key: 'amount_funded',
                label: strings.pastEventsAmountFunded,
            },
            {
                key: 'amount_requested',
                label: strings.pastEventsAmountRequested,
            },
        ],
        [strings],
    );

    const eventMetricMap = useMemo(
        () => listToMap(eventMetricOptions, ({ key }) => key),
        [eventMetricOptions],
    );

    const selectedTimePeriod = isDefined(selectedTimePeriodKey)
        ? timePeriodMap[selectedTimePeriodKey]
        : undefined;

    const {
        // pending: historicalDisastersPending,
        response: historicalDisastersResponse,
    } = useRequest({
        skip: isNotDefined(countryId) || isNotDefined(selectedTimePeriod),
        url: '/api/v2/country/{id}/historical-disaster/',
        pathVariables: { id: countryId },
        query: isDefined(selectedTimePeriod) ? {
            start_date: encodeDate(selectedTimePeriod.startDate),
            end_date: encodeDate(selectedTimePeriod.endDate),
        } : undefined,
    });

    const chartData = useTemporalChartData(
        historicalDisastersResponse,
        {
            containerRef,
            keySelector: (datum, i) => `${datum.date}-${i}`,
            xValueSelector: (datum) => datum.date,
            yValueSelector: (datum) => datum[selectedEventMetricKey],
            yAxisWidth: DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
            temporalResolution: 'year',
            yValueStartsFromZero: true,
        },
    );

    const selectedEventMetric = isDefined(selectedEventMetricKey)
        ? eventMetricMap[selectedEventMetricKey]
        : undefined;

    return (
        <Container
            heading={strings.pastEventsChartEvents}
            className={_cs(styles.pastEventsChart, className)}
            withHeaderBorder
            withGridViewInFilter
            filters={(
                <>
                    <SelectInput
                        name="eventMetric"
                        options={eventMetricOptions}
                        value={selectedEventMetricKey}
                        onChange={setSelectedEventMetricKey}
                        keySelector={eventMetricKeySelector}
                        labelSelector={stringLabelSelector}
                        nonClearable
                    />
                    <SelectInput
                        name="timePeriod"
                        options={timePeriodOptions}
                        value={selectedTimePeriodKey}
                        onChange={setSelectedTimePeriodKey}
                        keySelector={timePeriodKeySelector}
                        labelSelector={stringLabelSelector}
                        nonClearable
                    />
                </>
            )}
        >
            <div
                className={styles.chartContainer}
                ref={containerRef}
            >
                <svg className={styles.svg}>
                    <ChartAxes
                        chartData={chartData}
                        yAxisLabel={selectedEventMetric?.label}
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
