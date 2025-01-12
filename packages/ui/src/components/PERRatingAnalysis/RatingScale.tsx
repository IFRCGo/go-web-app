import React, {
    useEffect,
    useMemo,
    useRef,
} from 'react';
import * as d3 from 'd3';

import styles from './styles.module.css';

interface Props {
    maxValue: number;
    currentValue: number;
}

function RatingScale(props: Props) {
    const {
        maxValue,
        currentValue,
    } = props;

    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const SCALE_HEIGHT = 50;
    const MIN_TICK_SPACING = 40; // Minimum space between ticks in pixels

    // Memoize categories and colors
    const categories = useMemo(() => [
        "Doesn't exist",
        'Partially exists',
        'Needs improvement',
        'Good performing',
        'High performing',
    ], []);

    const colors = useMemo(() => [
        '#E0E3E7', // Doesn't exist
        '#99A5B3', // Partially exists
        '#7D8B9D', // Needs improvement
        '#4D617A', // Good performing
        '#011E41', // High performing
    ], []);

    useEffect(() => {
        if (!containerRef.current) return;

        // Store ref value in a variable
        const currentContainer = containerRef.current;

        const updateScale = () => {
            if (!svgRef.current || !currentContainer) return;

            // Clear previous content
            d3.select(svgRef.current).selectAll('*').remove();

            const containerWidth = 400; // Fixed width to match the rating bar

            // Calculate optimal number of ticks based on container width
            const optimalTickCount = Math.max(2, Math.floor(containerWidth / MIN_TICK_SPACING));
            const tickCount = Math.min(maxValue, optimalTickCount);

            const svg = d3.select(svgRef.current)
                .attr('width', containerWidth)
                .attr('height', SCALE_HEIGHT)
                .attr('preserveAspectRatio', 'none');

            // Calculate rectangle widths
            const rectWidth = containerWidth / categories.length;

            // Add background rectangles
            svg.selectAll('rect')
                .data(categories)
                .enter()
                .append('rect')
                .attr('x', (_, i) => rectWidth * i)
                .attr('y', 0)
                .attr('width', rectWidth)
                .attr('height', SCALE_HEIGHT)
                .attr('fill', (_, i) => colors[i])
                .attr('opacity', 1);

            // Create scale for x-axis
            const xScale = d3.scaleLinear()
                .domain([0, maxValue])
                .range([0, containerWidth]);

            // Add gridlines with responsive ticks
            const xAxis = d3.axisBottom(xScale)
                .ticks(tickCount)
                .tickSize(-SCALE_HEIGHT)
                .tickFormat((d) => d.toString());

            const axisGroup = svg.append('g')
                .attr('transform', `translate(0, ${SCALE_HEIGHT})`)
                .call(xAxis)
                .call((g) => g.selectAll('.domain').remove());

            // Hide first and last tick lines
            axisGroup.selectAll('.tick:first-of-type line, .tick:last-of-type line')
                .attr('display', 'none');

            // Style the ticks
            axisGroup.selectAll('.tick line')
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '2,2');

            axisGroup.selectAll('.tick text')
                .attr('dy', '1em')
                .attr('font-size', containerWidth < 480 ? '10px' : '12px')
                .attr('fill', '#666666');
        };

        // Initial render
        updateScale();

        // Add resize listener
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(currentContainer);

        // eslint-disable-next-line consistent-return
        return (): void => {
            resizeObserver.unobserve(currentContainer);
        };
    }, [maxValue, currentValue, categories, colors]);

    return (
        <div ref={containerRef} className={styles.ratingScaleWrapper}>
            <div className={styles.categoryLabels}>
                {categories.map((category) => (
                    <div key={category} className={styles.categoryLabel}>
                        {category}
                    </div>
                ))}
            </div>
            <svg ref={svgRef} className={styles.ratingScaleSvg} />
            <div className={styles.ratingScaleEmpty} />
            <div className={styles.ratingScaleEmpty} />
        </div>
    );
}

export default RatingScale;
