import {
    ElementRef,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    ChartAxes,
    ChartPoint,
    Container,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPathData } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useChartData from '#hooks/useChartData';
import {
    defaultChartMargin,
    defaultChartPadding,
} from '#utils/constants';
import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

const chartPadding = defaultChartPadding;
const chartMargin = defaultChartMargin;
const X_AXIS_HEIGHT = 50;
const Y_AXIS_WIDTH = 90;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 10,
    right: 30,
    bottom: X_AXIS_HEIGHT,
};

interface Props {
    selectedYear: number;
    setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
    databankResponse: GoApiResponse<'/api/v2/country/{id}/databank/'> | undefined;
}

function NationalSocietyIncomeOverTime(props: Props) {
    const {
        databankResponse,
        selectedYear,
        setSelectedYear,
    } = props;

    const strings = useTranslation(i18n);
    const containerRef = useRef<ElementRef<'div'>>(null);

    const annualIncome = databankResponse?.fdrs_annual_income?.map(
        (income) => {
            const {
                date,
                value,
                ...other
            } = income;

            if (isNotDefined(date) || isNotDefined(value)) {
                return undefined;
            }

            const dateObj = new Date(date);

            if (Number.isNaN(dateObj.getTime())) {
                return undefined;
            }

            return {
                ...other,
                date: dateObj,
                value,
            };
        },
    ).filter(isDefined);

    const incomeByYear = listToMap(
        annualIncome,
        ({ date }) => date.getFullYear(),
    );

    const temporalDomain = useMemo(
        () => {
            if (isNotDefined(annualIncome) || annualIncome.length === 0) {
                const now = new Date();

                return {
                    min: now.getFullYear() - 1,
                    max: now.getFullYear() + 1,
                };
            }

            const minYear = annualIncome[0].date.getFullYear();
            const maxYear = annualIncome[annualIncome.length - 1].date.getFullYear();

            const diff = maxYear - minYear;
            const minDiff = 2;

            const access = minDiff > diff ? minDiff - diff : 0;

            return {
                min: minYear - Math.floor(access / 2),
                max: maxYear + Math.ceil(access / 2),
            };
        },
        [annualIncome],
    );

    const {
        dataPoints,
        chartSize,
        xAxisTicks,
        yAxisTicks,
    } = useChartData(
        annualIncome,
        {
            containerRef,
            chartPadding,
            chartMargin,
            chartOffset,
            type: 'numeric',
            keySelector: (datum) => datum.date.getFullYear(),
            xValueSelector: (datum) => datum.date.getFullYear(),
            xAxisLabelSelector: (year) => year,
            yValueSelector: (datum) => datum.value,
            yAxisStartsFromZero: true,
            xDomain: temporalDomain,
            yAxisScale: 'cbrt',
            numXAxisTicks: Math.max(
                3,
                (temporalDomain.max - temporalDomain.min) + 1,
            ),
        },
    );

    const tooltipSelector = useCallback(
        (year: number | string) => (
            <Tooltip
                title={year}
                description={(
                    <TextOutput
                        label={strings.nsIncomeOverTimeTooltipTotalLabel}
                        value={incomeByYear?.[Number(year)].value}
                        suffix=" CHF"
                        valueType="number"
                        strongValue
                    />
                )}
            />
        ),
        [incomeByYear, strings.nsIncomeOverTimeTooltipTotalLabel],
    );

    const handlePointClick = useCallback(
        (year: number | string) => {
            if (isDefined(year) && typeof year === 'number') {
                setSelectedYear(year);
            }
        },
        [setSelectedYear],
    );

    return (
        <Container
            className={styles.nationalSocietyIncomeOverTime}
            heading={strings.nsIncomeOverTimeHeading}
            withHeaderBorder
        >
            <div
                className={styles.chartContainer}
                ref={containerRef}
            >
                <svg className={styles.svg}>
                    <g className={styles.yearlyIncome}>
                        <path
                            className={styles.line}
                            d={getPathData(dataPoints)}
                        />
                        {dataPoints.map((dataPoint) => (
                            <ChartPoint
                                active={selectedYear === dataPoint.key}
                                key={dataPoint.key}
                                x={dataPoint.x}
                                y={dataPoint.y}
                            />
                        ))}
                    </g>
                    <ChartAxes
                        yAxisLabel={strings.nsIncomeOverTimeChartAxisLabel}
                        xAxisHeight={X_AXIS_HEIGHT}
                        yAxisWidth={Y_AXIS_WIDTH}
                        xAxisPoints={xAxisTicks}
                        yAxisPoints={yAxisTicks}
                        chartMargin={chartMargin}
                        chartSize={chartSize}
                        tooltipSelector={tooltipSelector}
                        onClick={handlePointClick}
                    />
                </svg>
            </div>
        </Container>
    );
}

export default NationalSocietyIncomeOverTime;
