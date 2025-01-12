import React, {
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import * as d3 from 'd3';

import styles from './styles.module.css';

interface RatingBarProps {
  value: number;
  maxValue: number;
  color: string;
  padding?: number;
  backgroundColor?: string;
}

interface RatingStatusBadgeProps {
  status: string;
}

interface RatingChangeProps {
  value: number;
  direction: 'up' | 'down';
}

const STATUS_COLORS = {
    "Doesn't exist": '#E0E3E7',
    'Partially exists': '#99A5B3',
    'Needs improvement': '#7D8B9D',
    'Good performing': '#4D617A',
    'High performing': '#011E41',
} as const;

function RatingBar({
    value,
    maxValue,
    color,
    padding = 2,
    backgroundColor = '#f5f5f5',
}: RatingBarProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const BAR_HEIGHT = 20;

    useEffect(() => {
        if (!containerRef.current) return;

        const currentContainer = containerRef.current;

        const updateChart = () => {
            if (!svgRef.current || !currentContainer) return;

            const containerWidth = currentContainer.clientWidth;

            const svg = d3.select(svgRef.current)
                .attr('width', containerWidth)
                .attr('height', BAR_HEIGHT)
                .attr('preserveAspectRatio', 'none');

            const xScale = d3.scaleLinear()
                .domain([0, maxValue])
                .range([0, containerWidth]);

            // Background
            svg.selectAll('.background')
                .data([1])
                .join('rect')
                .attr('class', 'background')
                .attr('x', 0)
                .attr('y', padding)
                .attr('width', containerWidth)
                .attr('height', BAR_HEIGHT - (padding * 2))
                .attr('rx', 8)
                .attr('ry', 8)
                .attr('fill', backgroundColor);

            // Bar
            svg.selectAll('.bar')
                .data([value])
                .join('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .attr('y', padding)
                .attr('height', BAR_HEIGHT - (padding * 2))
                .attr('rx', 8)
                .attr('ry', 8)
                .attr('fill', color)
                .transition()
                .duration(500)
                .attr('width', xScale(value));

            // Gridlines
            const gridlines = svg.selectAll('.gridlines')
                .data([1])
                .join('g')
                .attr('class', 'gridlines')
                .attr('transform', `translate(0, ${BAR_HEIGHT - padding})`);

            const xAxis = d3.axisBottom(xScale)
                .ticks(5)
                .tickSize(-BAR_HEIGHT + (padding * 2))
                .tickFormat('')
                .tickPadding(10);

            gridlines.call(xAxis);

            gridlines.selectAll('line')
                .attr('stroke', '#ccc')
                .attr('stroke-dasharray', '2,2');

            gridlines.selectAll('.tick:first-of-type line, .tick:last-of-type line')
                .attr('display', 'none');

            gridlines.select('.domain').remove();
        };

        updateChart();

        const resizeObserver = new ResizeObserver(updateChart);
        resizeObserver.observe(currentContainer);

        return () => {
            resizeObserver.unobserve(currentContainer);
        };
    }, [value, maxValue, color, padding, backgroundColor]);

    return (
        <div ref={containerRef} className={styles.ratingBarContainer}>
            <svg ref={svgRef} />
        </div>
    );
}

function RatingStatusBadge({ status }: RatingStatusBadgeProps) {
    return (
        <span
            className={styles.ratingStatus}
            style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
        >
            {status}
        </span>
    );
}

function RatingChange({ value, direction }: RatingChangeProps) {
    return (
        <span className={_cs(styles.ratingChange, direction === 'up' ? styles.positive : styles.negative)}>
            {direction === 'up' ? '↗' : '↘'}
            {direction === 'up' ? '+' : ''}
            {value.toFixed(1)}
        </span>
    );
}

export {
    RatingBar,
    type RatingBarProps,
    RatingChange,
    type RatingChangeProps,
    RatingStatusBadge,
    type RatingStatusBadgeProps,
};

export default RatingBar;
