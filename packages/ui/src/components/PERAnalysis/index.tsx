import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Bar,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface PERCycleData {
  cycle: string;
  cycleNumber: number;
  completed: number;
  inProgress: number;
  rating: number;
  totalNS: number;
  ratingChange: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PERCycleData;
  }>;
}

const COLORS = {
    primary: '#F5333F',
    primaryLight: '#FFD7D9',
    accent: '#2264D1',
    accentLight: '#EBF1FB',
    text: '#212121',
    textLight: '#666666',
    border: '#E5E7EB',
} as const;

interface Props {
  data: {
    total_cycles: number;
    cycles: PERCycleData[];
  };
  summary: {
    averageRating: number;
    assessmentsWithComponentResponses?: number;
  };
  onCycleClick?: (cycle: number) => void;
  activeCycle?: number;
}

function CustomTooltip({ active, payload }: TooltipProps) {
    const strings = useTranslation(i18n);
    if (!active || !payload || !payload.length) return null;

    const cycleData = payload[0].payload;
    const ratingChange = cycleData?.ratingChange ?? 0;
    const isPositiveRating = ratingChange > 0;

    return (
        <div
            className={styles.tooltip}
            aria-label={strings?.analysisTooltipLabel?.replace('{cycle}', cycleData?.cycle ?? '') ?? `Cycle details for ${cycleData?.cycle}`}
        >
            <p className={styles.tooltipTitle}>{cycleData?.cycle || ''}</p>
            <div className={styles.tooltipContent}>
                <div className={styles.tooltipMetric}>
                    <div className={styles.tooltipItem}>
                        <div
                            className={styles.legendMarker}
                            style={{ backgroundColor: COLORS.primary }}
                        />
                        <span>
                            {strings?.analysisLegendCompletedLabel?.replace('{count}', (cycleData?.completed ?? 0).toString()) ?? `Completed: ${cycleData?.completed ?? 0} NSs`}
                        </span>
                    </div>
                </div>

                {(cycleData?.inProgress ?? 0) > 0 && (
                    <div className={styles.tooltipItem}>
                        <div
                            className={styles.legendMarker}
                            style={{ backgroundColor: COLORS.primaryLight }}
                        />
                        <span>
                            {strings?.analysisLegendProgressLabel?.replace('{count}', (cycleData?.inProgress ?? 0).toString()) ?? `Yet to Progress: ${cycleData?.inProgress ?? 0} NSs`}
                        </span>
                    </div>
                )}

                <div className={`${styles.tooltipMetric} ${styles.tooltipDivider}`}>
                    <div className={styles.tooltipItem}>
                        <div
                            className={styles.legendLine}
                            style={{ backgroundColor: COLORS.accent }}
                        />
                        <span>
                            {`${strings?.analysisPerRatingLabel}: ${cycleData?.rating?.toFixed(1) ?? '0.0'}`}
                        </span>
                    </div>
                    {ratingChange !== 0 && (
                        <div
                            className={
                                `${styles.tooltipChange} ${
                                    isPositiveRating
                                        ? styles.tooltipChangePositive
                                        : styles.tooltipChangeNegative
                                }`
                            }
                            aria-label={strings?.analysisRatingChangeLabel?.replace('{value}', ratingChange.toFixed(1)) ?? `Rating change of ${ratingChange.toFixed(1)} points`}
                        >
                            {isPositiveRating ? '↗' : '↘'}
                            <span>
                                {isPositiveRating ? '+' : ''}
                                {ratingChange.toFixed(1)}
                                {' '}
                                {strings?.analysisRatingChangeLabel?.replace('{value}', '') ?? 'points'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomLegend() {
    const strings = useTranslation(i18n);
    return (
        <div className={styles.legend}>
            <div className={styles.legendItem}>
                <div
                    className={styles.legendMarker}
                    style={{ backgroundColor: COLORS.primary }}
                />
                <span>{strings?.analysisLegendCompletedLabel ?? 'Completed cycles'}</span>
            </div>
            <div className={styles.legendItem}>
                <div
                    className={styles.legendMarker}
                    style={{ backgroundColor: COLORS.primaryLight }}
                />
                <span>{strings?.analysisLegendProgressLabel ?? 'Yet to progress'}</span>
            </div>
            <div className={styles.legendItem}>
                <div
                    className={styles.legendLine}
                    style={{ backgroundColor: COLORS.accent }}
                />
                <span>{strings?.analysisLegendAverageLabel ?? 'Average PER rating'}</span>
            </div>
        </div>
    );
}

function PERAnalysis({
    data: chartData,
    summary,
    onCycleClick,
    activeCycle,
}: Props) {
    const strings = useTranslation(i18n);
    const handleCycleCardClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        cycleNumber: number,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        if (onCycleClick) {
            onCycleClick(cycleNumber);
        }
    };

    return (
        <div
            className={styles.container}
            aria-label={strings?.analysisContainerLabel ?? 'PER analysis chart and summary'}
        >
            <div className={styles.card}>
                <div className={styles.cardContent}>
                    <div className={styles.header}>
                        <div className={styles.headerMetric}>
                            <h2 className={styles.title}>
                                {strings?.analysisAssessmentCountLabel ?? 'Number of PER assessments / process cycle iterations'}
                                <span className={styles.totalNumber}>
                                    {' '}
                                    {chartData.total_cycles}
                                </span>
                            </h2>
                            {summary.assessmentsWithComponentResponses !== undefined && (
                                <span className={styles.subtitle}>
                                    {strings?.analysisComponentResponseCountLabel ?? 'Assessments with component responses'}
                                    {' '}
                                    <strong className={styles.componentResponseNumber}>
                                        {summary.assessmentsWithComponentResponses}
                                    </strong>
                                </span>
                            )}
                        </div>
                        <div className={styles.headerMetric}>
                            <h2 className={styles.title}>
                                {strings?.analysisLegendAverageLabel ?? 'Average PER Rating'}
                                <span className={styles.totalNumber}>
                                    {' '}
                                    {summary.averageRating.toFixed(1)}
                                </span>
                            </h2>
                            <span className={styles.subtitle}>
                                {strings?.analysisAverageRatingLabel ?? 'According to the latest assessment in each NS'}
                            </span>
                        </div>
                    </div>

                    <div
                        className={styles.chartContainer}
                        aria-label={strings?.analysisChartLabel}
                    >
                        <ResponsiveContainer>
                            <ComposedChart
                                data={chartData.cycles}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 10,
                                    bottom: 0,
                                }}
                                barSize={100}
                            >
                                <XAxis
                                    dataKey="cycle"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                    height={50}
                                    fontSize={12}
                                />
                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                    fontSize={12}
                                    label={{
                                        value: strings?.analysisAxisNsCountLabel ?? '# OF NS',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: 0,
                                        dy: -52,
                                        style: { fontSize: '12px', fill: COLORS.textLight },
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 5]}
                                    tickCount={6}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={10}
                                    fontSize={12}
                                    label={{
                                        value: strings?.analysisAxisRatingLabel ?? 'AVERAGE PER RATING',
                                        angle: 90,
                                        dy: 22,
                                        position: 'insideRight',
                                        offset: 0,
                                        style: { fontSize: '12px', fill: COLORS.textLight },
                                    }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={false}
                                    wrapperStyle={{
                                        filter: 'none',
                                        WebkitFilter: 'none',
                                        boxShadow: 'none',
                                        outline: 'none',
                                    }}
                                    contentStyle={{
                                        filter: 'none',
                                        WebkitFilter: 'none',
                                        boxShadow: 'none',
                                    }}
                                />
                                <Legend content={<CustomLegend />} />
                                <Bar
                                    yAxisId="left"
                                    dataKey="inProgress"
                                    stackId="a"
                                    fill={COLORS.primaryLight}
                                    radius={[0, 0, 0, 0]}
                                    onClick={
                                        (event) => handleCycleCardClick(
                                            event,
                                            event.payload.cycleNumber,
                                        )
                                    }
                                    className={styles.bar}
                                    cursor="pointer"
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="completed"
                                    stackId="a"
                                    fill={COLORS.primary}
                                    radius={[4, 4, 0, 0]}
                                    onClick={
                                        (event) => handleCycleCardClick(
                                            event,
                                            event.payload.cycleNumber,
                                        )
                                    }
                                    className={styles.bar}
                                    cursor="pointer"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="rating"
                                    stroke={COLORS.accent}
                                    strokeWidth={2}
                                    dot={{
                                        r: 4,
                                        fill: COLORS.accentLight,
                                        stroke: COLORS.accent,
                                        strokeWidth: 2,
                                    }}
                                    activeDot={{ r: 6 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className={styles.summaryGrid}>
                {chartData.cycles.map((cycleData, index) => (
                    <button
                        type="button"
                        key={`cycle-${cycleData.cycleNumber}`}
                        onClick={(e) => handleCycleCardClick(e, cycleData.cycleNumber)}
                        className={_cs(
                            styles.summaryCard,
                            activeCycle === cycleData.cycleNumber && styles.active,
                        )}
                        aria-label={strings?.analysisCycleCardLabel?.replace('{cycle}', cycleData.cycle) ?? `PER cycle ${cycleData.cycle} details`}
                    >
                        <div className={styles.metricsRow}>
                            <div className={styles.metricGroup}>
                                <span className={styles.metricLabel}>{cycleData?.cycle || ''}</span>
                                <div className={styles.metricValue}>
                                    <span className={styles.nsCount}>
                                        {(cycleData?.completed ?? 0) + (cycleData?.inProgress ?? 0)}
                                    </span>
                                    <span className={styles.nsUnit}>
                                        {strings?.analysisNsUnitLabel ?? 'NSs'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.metricGroup}>
                                <span className={styles.metricLabel}>
                                    {strings?.analysisPerRatingLabel ?? 'PER Rating'}
                                </span>
                                <div className={styles.ratingGroup}>
                                    <span className={styles.ratingValue}>
                                        {cycleData?.rating?.toFixed(1) ?? '0.0'}
                                    </span>
                                    {(cycleData?.ratingChange ?? 0) > 0 && index > 0 && (
                                        <span
                                            className={styles.ratingChange}
                                            aria-label={strings?.analysisRatingChangeLabel?.replace('{value}', cycleData.ratingChange.toFixed(1)) ?? `Rating change of ${cycleData.ratingChange.toFixed(1)} points`}
                                        >
                                            ↗ +
                                            {cycleData?.ratingChange?.toFixed(1)}
                                        </span>
                                    )}
                                    {(cycleData?.ratingChange ?? 0) < 0 && index > 0 && (
                                        <span
                                            className={styles.ratingChange}
                                            aria-label={strings?.analysisRatingChangeLabel?.replace('{value}', cycleData.ratingChange.toFixed(1)) ?? `Rating change of ${cycleData.ratingChange.toFixed(1)} points`}
                                        >
                                            ↘
                                            {cycleData?.ratingChange?.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default PERAnalysis;
export type { Props };
