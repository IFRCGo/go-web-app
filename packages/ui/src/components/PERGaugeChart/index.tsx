import {
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import * as d3 from 'd3';

import styles from './styles.module.css';

export interface Props {
    /**
     * Percentage value to display in the gauge (0-100)
     * @default 33
     */
    percentage?: number;

    /**
     * URL of the icon to display in the center
     */
    icon?: string;

    /**
     * Label text to display below the gauge
     * @default 'EPI-ready'
     */
    label?: string;

    /**
     * Font size for the label text
     * @default 16
     */
    fontSize?: number;

    /**
     * Color of the gauge fill
     * @default '#236192'
     */
    gaugeColor?: string;

    /**
     * Background color of the gauge
     * @default '#F2F2F2'
     */
    backgroundColor?: string;

    /**
     * Duration of the transition animation in milliseconds
     * @default 1000
     */
    transitionSpeed?: number;

    /**
     * Callback function when the gauge is clicked
     */
    onClick?: () => void;

    /**
     * Title text to display above the gauge
     * @default 'Chart title'
     */
    title?: string;

    /**
     * Width of the gauge in pixels or CSS units
     * @default 200
     */
    width?: number | string;

    /**
     * Additional CSS class names
     */
    className?: string;
}

function PERGaugeChart({
    percentage = 33,
    icon,
    label = 'EPI-ready',
    fontSize = 16,
    gaugeColor = '#236192',
    backgroundColor = '#F2F2F2',
    transitionSpeed = 1000,
    onClick = () => undefined,
    title = 'Chart title',
    width = 200,
    className,
}: Props) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const previousPercentageRef = useRef<number>(percentage);

    const chartWidth = typeof width === 'number' ? `${width}px` : width;
    const svgWidth = typeof width === 'number' ? width : 200;
    const height = svgWidth / 2;
    const radius = svgWidth / 2;

    useEffect(() => {
        const svg = d3
            .select(svgRef.current)
            .attr('viewBox', `0 0 ${svgWidth} ${height}`)
            .style('width', '100%')
            .style('height', 'auto');

        svg.selectAll('*').remove();

        // Define the background arc
        const backgroundArc = d3
            .arc<unknown>()
            .innerRadius(radius * 0.74)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        // Append the background arc
        svg
            .append('path')
            .attr('d', backgroundArc(null)!)
            .attr('fill', backgroundColor)
            .attr('transform', `translate(${radius}, ${radius})`);

        // Define the arc generator with datum type 'number'
        const arcGenerator = d3
            .arc<d3.BaseType, number>()
            .innerRadius(radius * 0.74)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle((d) => -Math.PI / 2 + d * Math.PI);

        // Append the gauge arc
        svg
            .append('path')
            .datum(percentage / 100)
            .attr('d', arcGenerator)
            .attr('fill', gaugeColor)
            .attr('transform', `translate(${radius}, ${radius})`)
            .attr('class', 'gauge-arc');

        if (icon) {
            svg
                .append('image')
                .attr('href', icon)
                .attr('x', radius - 15)
                .attr('y', radius / 2)
                .attr('width', 30)
                .attr('height', 30)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        }

        // Initialize the previous percentage
        previousPercentageRef.current = percentage;
    }, [backgroundColor, gaugeColor, icon, label, fontSize, height, percentage, radius, chartWidth]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const arcGenerator = d3
            .arc<d3.BaseType, number>()
            .innerRadius(radius * 0.74)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle((d) => -Math.PI / 2 + d * Math.PI);

        const previousPercentage = previousPercentageRef.current / 100;
        const newPercentage = percentage / 100;
        previousPercentageRef.current = percentage;

        svg
            .select('.gauge-arc')
            .datum(newPercentage)
            .transition()
            .duration(transitionSpeed)
            .attrTween('d', (d) => {
                const interpolate = d3.interpolate(previousPercentage, d);
                return function (t: number) {
                    return arcGenerator(interpolate(t))!;
                };
            });
    }, [percentage, radius, transitionSpeed]);

    return (
        <div
            className={_cs(
                styles.container,
                className,
            )}
            style={{ width: chartWidth }}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
        >
            {title && (
                <div className={styles.title}>
                    {title}
                </div>
            )}
            <svg
                ref={svgRef}
                style={{
                    width: '100%',
                    height: 'auto',
                }}
            />
            {label && (
                <div className={styles.label}>
                    {label}
                </div>
            )}
            <div className={styles.percentage}>
                {percentage}
                %
            </div>
        </div>
    );
}

export default PERGaugeChart;
