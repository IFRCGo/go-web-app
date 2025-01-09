import {
    useEffect,
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
import { getContrastColor } from '../../utils/common';

import styles from './styles.module.css';

export interface StackedBarDataItem {
    year?: number | string | null;
    values?: { [key: string]: number };
    label?: string;
}

export interface Props {
    /**
     * Array of data items for the chart
     */
    data: StackedBarDataItem[];

    /**
     * Height of the chart in pixels
     * @default 300
     */
    height?: number;

    /**
     * Minimum width of the chart in pixels
     * @default 300
     */
    minWidth?: number;

    /**
     * Callback when a bar is clicked
     */
    onClick?: (item: StackedBarDataItem) => void;

    /**
     * Callback when hovering over a bar
     */
    onHover?: (item: StackedBarDataItem) => void;

    /**
     * Enable tooltips
     * @default true
     */
    tooltipEnabled?: boolean;

    /**
     * Additional CSS class name
     */
    className?: string;

    /**
     * Categories for the stacked bars
     */
    categories?: { label: string; fillColor: string; hoverFillColor?: string }[];

    /**
     * Show data labels on bars
     * @default false
     */
    showDataLabels?: boolean;

    /**
     * Currently active region
     */
    activeRegion?: string | null;

    /**
     * Minimum value for Y axis
     */
    yAxisMin?: number;

    /**
     * Maximum value for Y axis
     */
    yAxisMax?: number;
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
    height = 300,
    minWidth = 300,
    onClick,
    onHover,
    tooltipEnabled = true,
    className = '',
    categories,
    showDataLabels = false,
    activeRegion = null,
    yAxisMin,
    yAxisMax,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(minWidth);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(Math.max(entry.contentRect.width, minWidth));
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [minWidth]);

    const reversedCategories = [...categories].reverse();

    const chartData = {
        labels: data.map((item) => item.year?.toString() ?? ''),
        datasets: reversedCategories.map((category) => ({
            label: category.label,
            data: data.map((item) => item.values?.[category.label] ?? 0),
            backgroundColor: category.fillColor,
            hoverBackgroundColor: category.hoverFillColor ?? category.fillColor,
            stack: 'stack1',
            borderWidth: 0,
            barPercentage: 0.9,
            categoryPercentage: 0.9,
        })),
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
            padding: {
                top: 22,
                right: 20,
                left: 3,
                bottom: 20,
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
                itemSort: (a, b) =>
                    // Reverse the order of tooltip items
                    b.datasetIndex - a.datasetIndex,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label ?? '';
                        const value = context.parsed.y;
                        return ` ${label}  ${value}`;
                    },
                    labelTextColor: () => '#111827',
                    labelColor: (context) => ({
                        borderColor: 'transparent',
                        backgroundColor: context.dataset.backgroundColor as string,
                    }),
                },
                titleColor: '#111827',
                bodyColor: '#111827',
                backgroundColor: '#FFFFFF',
                bodyFont: {
                    family: 'Poppins',
                    weight: 'normal',
                    size: 13,
                },
                padding: 8,
                caretPadding: 18,
                cornerRadius: 4,
                displayColors: true,
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: false,
                borderColor: '#F2F2F2',
                borderWidth: 1,
                titleFont: {
                    family: 'Poppins',
                    weight: 'normal',
                    size: 11,
                },
                boxPadding: 3,
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
                        size: 12,
                    },
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
                afterFit: (axis: any) => {
                    axis.width = 50;  // Fixed width in pixels
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    padding: 10,
                    stepSize: 1,
                    callback: function(value: any) {
                        if (Math.floor(value) !== value) {
                            return '';
                        }
                        return value;
                    }
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
                onHover(elements[0].index);
            } else {
                onHover(null);
            }
        } : undefined,
    };

    return (
        <div
            ref={containerRef}
            className={_cs(styles.responsiveContainer, className)}
        >
            <div className={styles.chartWrapper}>
                <Bar
                    data={chartData}
                    options={options}
                    height={height}
                    width={containerWidth}
                />
            </div>
        </div>
    );
}

export default PERStackedBarChart;
