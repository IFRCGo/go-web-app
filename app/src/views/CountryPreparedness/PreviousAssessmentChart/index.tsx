import {
    useCallback,
    useMemo,
} from 'react';
import {
    ChartAxes,
    ChartContainer,
    ChartPoint,
    DateOutput,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatNumber,
    getDiscretePathDataList,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useNumericChartData from '#hooks/useNumericChartData';
import { defaultChartMargin } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type PerStatsResponse = GoApiResponse<'/api/v2/per-stats/'>;
type AssessmentRatings = NonNullable<PerStatsResponse['results']>[number]['assessment_ratings'];

interface Props {
    data: AssessmentRatings;
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
}

function PreviousAssessmentCharts(props: Props) {
    // FIXME: we need rating_display for average_rating
    const strings = useTranslation(i18n);

    const {
        data,
        ratingOptions,
    } = props;
    const ratingTitleMap = listToMap(
        ratingOptions,
        (option) => option.value,
        (option) => `${option.title} ${option.value}`,
    );

    const chartData = useNumericChartData(
        [...data].sort((a, b) => compareNumber(a.assessment_number, b.assessment_number)),
        {
            chartMargin: {
                ...defaultChartMargin,
                top: 30,
            },
            keySelector: (datum) => datum.assessment_number,
            xValueSelector: (datum) => datum.assessment_number,
            yValueSelector: (datum) => datum.average_rating,
            yDomain: { min: 0, max: 5 },
            numYAxisTicks: 6,
            yAxisWidth: 100,
            // FIXME: verify the logic for xDomain
            xDomain: { min: 1, max: data.length },
            numXAxisTicks: data.length,
            yAxisTickLabelSelector: (rating) => ratingTitleMap?.[rating],
            xAxisTickLabelSelector: (cycle) => resolveToString(
                strings.performanceAxisTickLabel,
                { cycle },
            ),
        },
    );

    const dataByAssessmentNumber = useMemo(
        () => listToMap(data, ({ assessment_number }) => assessment_number),
        [data],
    );

    const tooltipSelector = useCallback(
        (key: number | string) => {
            const datum = dataByAssessmentNumber[Number(key)];

            if (isNotDefined(datum)) {
                return null;
            }

            return (
                <Tooltip
                    title={<DateOutput value={datum.date_of_assessment} />}
                    description={(
                        <>
                            <TextOutput
                                label={strings.performanceTooltipCycleLabel}
                                value={datum.assessment_number}
                                valueType="number"
                            />
                            <TextOutput
                                label={strings.performanceTooltipAverageRatingLabel}
                                value={datum.average_rating}
                                valueType="number"
                            />
                        </>
                    )}
                />
            );
        },
        [dataByAssessmentNumber, strings],
    );

    return (
        <ChartContainer
            className={styles.previousAssessmentChart}
            chartData={chartData}
        >
            <ChartAxes
                chartData={chartData}
                tooltipSelector={tooltipSelector}
            />
            {chartData.chartPoints.length > 0 && (
                <path
                    // NOTE: only drawing first path
                    // FIXME: we cannot guarantee that the array will have
                    // at least one element
                    d={getDiscretePathDataList(chartData.chartPoints)[0]}
                    fill="none"
                    className={styles.path}
                />
            )}
            {chartData.chartPoints.map(
                (point) => (
                    <g key={point.key}>
                        <text
                            className={styles.text}
                            textAnchor="middle"
                            dy={-15}
                            x={point.x}
                            y={point.y}
                        >
                            {formatNumber(point.originalData.average_rating)}
                        </text>
                        <ChartPoint
                            className={styles.circle}
                            x={point.x}
                            y={point.y}
                        />
                    </g>
                ),
            )}
        </ChartContainer>
    );
}

export default PreviousAssessmentCharts;
