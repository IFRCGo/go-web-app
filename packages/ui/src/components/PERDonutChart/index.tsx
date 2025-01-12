import { useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { _cs } from '@togglecorp/fujs';
import {
    ArcElement,
    Chart as ChartJS,
    ChartEvent,
    ChartOptions,
    Legend,
    Tooltip,
    TooltipItem,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import PERChartLegend from '../PERChartLegend';

import styles from './styles.module.css';

// Register required ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export interface ChartDataItem {
    label: string;
    count?: number;
    value?: number;
    fillColor?: string;
}

export interface Props {
    className?: string;
    /** Array of data items to display in the chart */
    data: ChartDataItem[];
    /** Height of the chart in pixels */
    height?: number;
    /** Width of the chart in pixels */
    width?: number;
    /** Size of the donut hole as percentage or pixels */
    cutout?: string;
    /** Total circumference of the chart in degrees */
    circumference?: number;
    /** Starting rotation of the chart in degrees */
    rotation?: number;
    /** Click handler for chart segments */
    onClick?: (item: ChartDataItem) => void;
    /** Hover handler for chart segments */
    onHover?: (event: MouseEvent, index: number | null) => void;
    /** Distance to separate hovered segment */
    hoverOffset?: number;
    /** Whether to animate chart changes */
    animation?: boolean;
    /** Whether to show tooltips */
    tooltipEnabled?: boolean;
    /** Custom tooltip format function */
    tooltipFormat?: (label: string, value: number) => string;
    /** Primary text to display in center of donut */
    centerText?: string | number;
    /** Secondary text to display in center of donut */
    centerTextSecondary?: string | number;
    /** Whether to maintain aspect ratio */
    maintainAspectRatio?: boolean;
    /** Whether chart should be responsive */
    responsive?: boolean;
    /** Percentage to darken colors on hover */
    hoverDarkenPercent?: number;
    /** Currently active region */
    activeRegion?: string | null;
    /** Array of colors to use for chart segments */
    colors?: string[];
}

const adjustColor = (color: string, percent: number): string => {
    const cleanHex = color.replace(/^#/, '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const adjustValue = (value: number): number => {
        if (percent < 0) {
            return Math.max(0, Math.min(255, value * (1 + percent / 100)));
        }
        return Math.max(0, Math.min(255, value + ((255 - value) * percent) / 100));
    };

    const newR = Math.round(adjustValue(r));
    const newG = Math.round(adjustValue(g));
    const newB = Math.round(adjustValue(b));

    const toHex = (n: number): string => {
        const hex = n.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

function PERDonutChart(props: Props) {
    const {
        className,
        data,
        height = 300,
        width = 300,
        cutout = '50%',
        circumference = 360,
        rotation = -90,
        onClick,
        onHover,
        hoverOffset = 4,
        animation = true,
        tooltipEnabled = true,
        tooltipFormat = (label, value) => `${value}`,
        centerText,
        centerTextSecondary,
        maintainAspectRatio = false,
        responsive = true,
        hoverDarkenPercent = -5,
        activeRegion = null,
        colors = ['#236192', '#418FDE', '#009CDD', '#C6C6C6'],
    } = props;

    const handleHover = useCallback((
        event: ChartEvent,
        elements: { index: number }[],
    ) => {
        if (onHover) {
            onHover(
                event.native as MouseEvent,
                elements.length > 0 ? elements[0].index : null,
            );
        }
    }, [onHover]);

    const chartData = {
        labels: data.map((item) => item.label),
        datasets: [
            {
                data: data.map((item) => item.count),
                backgroundColor: data.map(
                    (_, index) => colors[index % colors.length],
                ),
                hoverBackgroundColor: data.map(
                    (_, index) => adjustColor(
                        colors[index % colors.length],
                        hoverDarkenPercent,
                    ),
                ),
                borderWidth: 0,
                hoverOffset,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive,
        maintainAspectRatio,
        cutout,
        circumference,
        rotation,
        animation,
        layout: {
            padding: {
                top: 2,
                bottom: 2,
            },
        },
        plugins: {
            legend: {
                display: false,
                position: 'bottom',
                labels: {
                    color: '#FFFFFF',
                    font: {
                        weight: 600,
                    },
                },
            },
            tooltip: {
                enabled: tooltipEnabled,
                callbacks: {
                    label(tooltipItem: TooltipItem<'doughnut'>) {
                        const label = tooltipItem.label || '';
                        const value = tooltipItem.raw as number;
                        return tooltipFormat(label, value);
                    },
                },
                titleColor: '#111827',
                bodyColor: '#111827',
                backgroundColor: '#FFFFFF',
                bodyFont: {
                    family: 'Poppins',
                    weight: 600,
                    size: 13,
                },
                padding: 8,
                caretPadding: 18,
                cornerRadius: 4,
                displayColors: false,
                borderColor: '#F2F2F2',
                borderWidth: 1,
                titleFont: {
                    family: 'Poppins',
                    weight: 'normal',
                    size: 11,
                },
                boxPadding: 7,
            },
            // @ts-expect-error chartjs-plugin-datalabels types are not complete
            datalabels: {
                color: '#FFFFFF',
                font: {
                    weight: 600,
                },
                formatter: (value: number | null | undefined) => {
                    if (value === null || value === undefined || value === 0) {
                        return '';
                    }
                    return value.toString();
                },
            },
        },
        onHover: handleHover,
        onClick: (event: ChartEvent, elements: any[]) => {
            if (onClick && elements.length > 0) {
                const { index } = elements[0];
                onClick(data[index]);
            }
        },
    };

    const legendData = data.map((item, index) => ({
        label: item.label,
        color: colors[index % colors.length],
    }));

    return (
        <div className={_cs(styles.chartWrapper, className)}>
            <div className={styles.chartContainer}>
                <Doughnut
                    data={chartData}
                    options={options}
                    height={height}
                    width={width}
                />
                {(centerText || centerTextSecondary) && (
                    <div className={styles.centerText}>
                        {centerText && (
                            <div className={styles.centerTextPrimary}>
                                {centerText}
                            </div>
                        )}
                        {centerTextSecondary && (
                            <div className={styles.centerTextSecondary}>
                                {centerTextSecondary}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PERDonutChart;
