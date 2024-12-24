import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ChartAxes,
    ChartContainer,
    ChartPoint,
    Container,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getBounds,
    getPathData,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useNumericChartData from '#hooks/useNumericChartData';
import { DEFAULT_Y_AXIS_WIDTH_WITH_LABEL } from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import { type GoApiResponse } from '#utils/restRequest';

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
    const { countryResponse } = useOutletContext<CountryOutletContext>();

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
                        value={incomeByYear?.[Number(year)]?.value}
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
            footerActions={isDefined(countryResponse?.fdrs)
                && isDefined(countryResponse.society_name) && (
                <TextOutput
                    label={strings.sourceLabel}
                    value={(
                        <Link
                            variant="tertiary"
                            href={`https://data.ifrc.org/fdrs/national-society/${countryResponse.fdrs}`}
                            external
                            withUnderline
                        >
                            {resolveToString(
                                strings.sourceFDRSLabel,
                                { nationalSociety: countryResponse.society_name },
                            )}
                        </Link>
                    )}
                />
            )}
        >
            <ChartContainer
                className={styles.chartContainer}
                chartData={chartData}
            >
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
            </ChartContainer>
        </Container>
    );
}

export default NationalSocietyIncomeOverTime;
