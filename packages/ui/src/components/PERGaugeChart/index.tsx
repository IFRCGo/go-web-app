import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import * as d3 from 'd3';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
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
     * @default 750
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
     * Additional CSS class names
     */
    className?: string;
}

function PERGaugeChart({
    percentage = 33,
    icon,
    label = 'EPI-ready',
    gaugeColor = '#236192',
    backgroundColor = '#F2F2F2',
    transitionSpeed = 1000,
    onClick = () => undefined,
    title = 'Chart title',
    className,
}: Props) {
    const strings = useTranslation(i18n);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(200);
    const prevPercentage = useRef(percentage);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            // Subtract padding from the width
            const padding = 32; // --go-ui-spacing-md (16px) * 2
            setContainerWidth(Math.max(width - padding, 0));
        });

        resizeObserver.observe(container);

        // eslint-disable-next-line consistent-return
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const radius = containerWidth / 2;
    const height = containerWidth / 2;

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Create a group for the gauge
        const g = svg
            .append('g')
            .attr('transform', `translate(${radius}, ${radius})`);

        // Define the background arc
        const backgroundArc = d3
            .arc<unknown>()
            .innerRadius(radius * 0.74)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        // Append the background arc
        g.append('path')
            .attr('d', backgroundArc(null)!)
            .attr('fill', backgroundColor)
            .attr('class', 'gauge-background');

        // Define the gauge arc
        const gaugeArc = d3
            .arc<number>()
            .innerRadius(radius * 0.74)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle((d) => -Math.PI / 2 + d * Math.PI);

        // Append the gauge arc
        g.append('path')
            .datum(prevPercentage.current / 100)
            .attr('d', (d) => gaugeArc(d)!)
            .attr('fill', gaugeColor)
            .attr('class', 'gauge-arc');

        if (icon) {
            g.append('image')
                .attr('href', icon)
                .attr('x', -15)
                .attr('y', -radius / 2)
                .attr('width', 30)
                .attr('height', 30)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('class', 'icon-image');
        }
    }, [radius, backgroundColor, gaugeColor, icon, containerWidth]);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }

        const svg = d3.select(svgRef.current);
        const gaugeArc = d3
            .arc<number>()
            .innerRadius(radius * 0.74)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle((d) => -Math.PI / 2 + d * Math.PI);

        const arcPath = svg.select('.gauge-arc');
        const oldValue = prevPercentage.current / 100;
        const newValue = percentage / 100;

        arcPath
            .transition()
            .duration(transitionSpeed)
            .tween('progress', () => {
                const interpolate = d3.interpolate(oldValue, newValue);
                return (t: number) => {
                    const value = interpolate(t);
                    arcPath
                        .datum(value)
                        .attr('d', gaugeArc);
                };
            });

        prevPercentage.current = percentage;
    }, [percentage, radius, transitionSpeed]);

    return (
        <div
            ref={containerRef}
            className={_cs(styles.container, className)}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
            aria-label={strings?.gaugeContainerLabel?.replace('{percentage}', percentage.toString())?.replace('{label}', label) ?? `Gauge chart showing ${percentage}% for ${label}`}
        >
            {title && (
                <div className={styles.title}>
                    {title}
                </div>
            )}
            <div className={styles.svgContainer}>
                <svg
                    ref={svgRef}
                    width={containerWidth}
                    height={height}
                    viewBox={`0 0 ${containerWidth} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                    aria-label={strings?.gaugeValueLabel?.replace('{percentage}', percentage.toString()) ?? `Gauge value: ${percentage}%`}
                />
            </div>
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
