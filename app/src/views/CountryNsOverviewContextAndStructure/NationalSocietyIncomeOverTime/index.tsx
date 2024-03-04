import {
    ElementRef,
    useCallback,
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
import {
    getBounds,
    getPathData,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useNumericChartData from '#hooks/useNumericChartData';
import { DEFAULT_Y_AXIS_WIDTH_WITH_LABEL } from '#utils/constants';
import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const yearList = isDefined(incomeByYear)
        ? Object.keys(incomeByYear).map((year) => Number(year))
        : [];

    const xBounds = getBounds(yearList);

    const chartData = useNumericChartData(
        annualIncome,
        {
            containerRef,
            keySelector: (datum) => datum.date.getFullYear(),
            xValueSelector: (datum) => datum.date.getFullYear(),
            yValueSelector: (datum) => datum.value,
            xAxisTickLabelSelector: (year) => year,
            xDomain: xBounds,
            numXAxisTicks: xBounds.max - xBounds.min + 1,
            yValueStartsFromZero: true,
            yAxisWidth: DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
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
                            d={getPathData(chartData.chartPoints)}
                        />
                        {chartData.chartPoints.map((dataPoint) => (
                            <ChartPoint
                                active={selectedYear === dataPoint.key}
                                key={dataPoint.key}
                                x={dataPoint.x}
                                y={dataPoint.y}
                            />
                        ))}
                    </g>
                    <ChartAxes
                        chartData={chartData}
                        yAxisLabel={strings.nsIncomeOverTimeChartAxisLabel}
                        tooltipSelector={tooltipSelector}
                        onClick={handlePointClick}
                    />
                </svg>
            </div>
        </Container>
    );
}

export default NationalSocietyIncomeOverTime;
