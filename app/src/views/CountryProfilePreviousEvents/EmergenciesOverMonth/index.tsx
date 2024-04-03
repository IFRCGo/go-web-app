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
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    startDate: string | undefined;
    endDate: string | undefined;
    countryId: string | undefined;
}

function EmergenciesOverMonth(props: Props) {
    const {
        startDate,
        endDate,
        countryId,
    } = props;

    const strings = useTranslation(i18n);

    const containerRef = useRef<ElementRef<'div'>>(null);

    const {
        // pending: disasterMonthlyCountPending,
        response: disasterMonthlyCountResponse,
    } = useRequest({
        skip: isNotDefined(countryId)
            || isNotDefined(startDate)
            || isNotDefined(endDate),
        url: '/api/v2/country/{id}/disaster-monthly-count/',
        pathVariables: { id: countryId },
        query: {
            start_date: startDate,
            end_date: endDate,
        },
    });

    const chartData = useTemporalChartData(
        disasterMonthlyCountResponse,
        {
            containerRef,
            keySelector: (datum, i) => `${datum.date}-${i}`,
            xValueSelector: (datum) => datum.date,
            yValueSelector: (datum) => datum.targeted_population,
            yearlyChart: true,
            yValueStartsFromZero: true,
        },
    );

    return (
        <div
            className={styles.emergenciesOverMonth}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                {chartData.chartPoints.map(
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
                                            label={strings.emergenciesOverMonthTargetedPopulation}
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
                    chartData={chartData}
                />
            </svg>
        </div>
    );
}

export default EmergenciesOverMonth;
