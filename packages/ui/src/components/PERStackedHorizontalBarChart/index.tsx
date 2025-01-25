import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
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
import type {
    DataItem,
    Props,
} from './types';

import styles from './styles.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
);

// Define datasets with label and fillColor
const datasetsConfig = [
    {
        label: 'Self-assessment',
        fillColor: '#236192',
        key: 'SelfAssessment',
    },
    {
        label: 'Simulation',
        fillColor: '#418FDE',
        key: 'Simulation',
    },
    {
        label: 'Operational',
        fillColor: '#009CDD',
        key: 'Operational',
    },
    {
        label: 'Post-operational',
        fillColor: '#C6C6C6',
        key: 'PostOperational',
    },
];

function PERStackedHorizontalBarChart({
    data,
    transitionSpeed = 800,
    maxValue = null,
    tooltipFormat = (label: string, value: number) => `${label}  ${value}`,
    tooltipEnabled = true,
}: Props) {
    const chartRef = useRef(null);

    const labels = data.map((item: DataItem) => item.name);

    // Map datasetsConfig to Chart.js datasets
    const datasets = datasetsConfig.map((dataset) => ({
        label: dataset.label,
        data: data.map((item: DataItem) => item[dataset.key] || 0),
        backgroundColor: dataset.fillColor,
        barPercentage: 0.65,
        categoryPercentage: 0.65,
    }));

    const chartData = {
        labels,
        datasets,
    };

    const options: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 0,
                right: 8,
                top: 8,
                bottom: 8,
            },
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
                        const value = context.parsed.x;
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
                anchor: 'center',
                color: (context) => {
                    const { datasetIndex } = context;
                    const { backgroundColor } = datasets[datasetIndex];
                    return getContrastColor(backgroundColor);
                },
                font: {
                    size: 10,
                    family: 'Poppins',
                    lineHeight: 2.5,
                },
                formatter: (value, context) => {
                    const { chart } = context;
                    const totalWidth = chart.width;

                    const { dataIndex } = context;

                    if (dataIndex < 0 || dataIndex >= data.length) {
                        return '';
                    }

                    const record = data[dataIndex];

                    if (
                        !record
                        || typeof record.SelfAssessment !== 'number'
                        || typeof record.Simulation !== 'number'
                        || typeof record.PostOperational !== 'number'
                        || typeof record.Operational !== 'number'
                    ) {
                        return '';
                    }

                    const totalValue = record.SelfAssessment
                        + record.Simulation
                        + record.PostOperational
                        + record.Operational;

                    const segmentPercentage = value / (maxValue || totalValue);
                    const segmentWidth = segmentPercentage * totalWidth;

                    return segmentWidth >= 30 ? value : '';
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                beginAtZero: true,
                display: false,
                grid: {
                    display: false,
                },
                max: maxValue || undefined,
            },
            y: {
                stacked: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#000',
                    padding: 20,
                    font: {
                        size: 11,
                        family: 'Poppins',
                        weight: '500',
                    },
                },
            },
        },
        animation: {
            duration: transitionSpeed,
        },
    };

    return (
        <div className={styles.container}>
            <Bar ref={chartRef} data={chartData} options={options} />
        </div>
    );
}

export default PERStackedHorizontalBarChart;
