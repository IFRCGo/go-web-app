import {
    useMemo,
    useRef,
    useState,
} from 'react';
import { Bar } from 'react-chartjs-2';
import { _cs } from '@togglecorp/fujs';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import useTranslation from '#hooks/useTranslation';

import { getContrastColor } from '../../utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface StackedBarDataItem {
    year: number | string | null;
    values: { [key: string]: number };
    label: string;
}

export interface Props {

    data: StackedBarDataItem[];

    height?: number;

    minWidth?: number;

    onClick?: (item: StackedBarDataItem) => void;

    onHover?: (item: StackedBarDataItem | null) => void;

    tooltipEnabled?: boolean;

    className?: string;

    categories: {
        label: string;
        fillColor: string;
        hoverFillColor?: string;
    }[];
    showDataLabels?: boolean;
    yAxisMin?: number;
    yAxisMax?: number;
    activeYear?: string;
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
);

function PERStackedBarChart({
    data,
    height = 200,
    minWidth = 300,
    onClick,
    onHover,
    tooltipEnabled = true,
    className = '',
    categories,
    showDataLabels = false,
    yAxisMin,
    yAxisMax,
    activeYear,
}: Props) {
    const strings = useTranslation(i18n);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth] = useState<number>(minWidth);

    // const reversedCategories = [...categories].reverse();

    const chartData = {
        labels: data.map((item) => item.label),
        datasets: categories.map((category) => ({
            label: category.label,
            data: data.map((item) => item.values[category.label] ?? 0),
            backgroundColor: data.map((item) => (
                item.year?.toString() === activeYear
                    ? category.hoverFillColor ?? category.fillColor
                    : category.fillColor
            )),
            hoverBackgroundColor: category.hoverFillColor ?? category.fillColor,
            stack: 'stack1',
        })),
    };

    const options: ChartOptions<'bar'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 18,
                right: 20,
                left: 3,
                bottom: 8,
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: tooltipEnabled,
                itemSort: (a, b) => b.datasetIndex - a.datasetIndex,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label ?? '';
                        const value = context.parsed.y;
                        return strings?.stackedBarTooltipFormat
                            ?.replace('{category}', label)
                            ?.replace('{value}', value.toString())
                            ?? ` ${label}  ${value}`;
                    },
                    labelTextColor: () => '#111827',
                    labelColor: (context) => ({
                        borderColor: 'transparent',
                        backgroundColor: categories[context.datasetIndex].fillColor,
                    }),
                },
                titleColor: '#111827',
                bodyColor: '#111827',
                backgroundColor: '#FFFFFF',
                bodyFont: {
                    family: 'Poppins',
                    weight: 'normal',
                    size: 12,
                },
                padding: 11,
                caretPadding: 20,
                cornerRadius: 4,
                displayColors: true,
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: false,
                borderColor: '#F2F2F2',
                borderWidth: 1,
                titleFont: {
                    family: 'Poppins',
                    weight: 600,
                    size: 12,
                },
                boxPadding: 7,
                external: (context) => {
                    const tooltipEl = context.chart.canvas.parentNode?.querySelector<HTMLDivElement>('div');
                    if (tooltipEl) {
                        tooltipEl.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.25), 0 1px 3px 0 rgb(0 0 0 / 0.51)';
                    }
                },
            },
            datalabels: {
                display: showDataLabels,
                color: (context) => {
                    const backgroundColor = context.dataset.backgroundColor as string;
                    return getContrastColor(backgroundColor);
                },
                font: {
                    size: 11,
                },
                formatter: (value) => value || '',
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Poppins',
                        size: 12,
                    },
                },
                title: {
                    display: true,
                    text: strings?.stackedBarXAxisLabel ?? '',
                },
            },
            y: {
                stacked: true,
                grid: {
                    display: true,
                    color: '#EEEEEE',
                },
                beginAtZero: true,
                min: yAxisMin,
                max: yAxisMax,
                position: 'left',
                afterFit: (axis: LinearScale) => {
                    // eslint-disable-next-line no-param-reassign
                    axis.width = 50;
                },
                ticks: {
                    font: {
                        family: 'Poppins',
                    },
                    padding: 10,
                    maxTicksLimit: 6,
                    callback(tickValue) {
                        const numericValue = Number(tickValue);
                        if (Math.floor(numericValue) !== numericValue) {
                            return '';
                        }
                        return numericValue;
                    },
                },
                title: {
                    display: true,
                    text: strings?.stackedBarYAxisLabel ?? '',
                },
            },
        },
        onClick: onClick ? (_, elements) => {
            if (elements.length > 0) {
                const dataIndex = elements[0].index;
                onClick(data[dataIndex]);
            }
        } : undefined,
        onHover: onHover ? (_, elements) => {
            if (elements.length > 0) {
                onHover(data[elements[0].index]);
            } else {
                onHover(null);
            }
        } : undefined,
    }), [tooltipEnabled,
        showDataLabels, yAxisMin, yAxisMax, onClick, onHover, data, strings, categories]);

    const containerStyle = useMemo(() => ({
        height: `${height}px`,
    }), [height]);

    return (
        <div
            ref={containerRef}
            className={_cs(styles.responsiveContainer, className)}
            style={containerStyle}
            aria-label={strings?.stackedBarContainerLabel ?? 'Stacked bar chart'}
        >
            <div
                className={styles.chartWrapper}
                aria-label={strings?.stackedBarChartLabel ?? 'Stacked bar chart showing data over time'}
            >
                <Bar
                    data={chartData}
                    options={options}
                    width={containerWidth}
                />
            </div>
        </div>
    );
}

export default PERStackedBarChart;
