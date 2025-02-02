import 'mapbox-gl/dist/mapbox-gl.css';

import React from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import * as d3 from 'd3';
import mapboxgl from 'mapbox-gl';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface AssessmentRecord {
    id: number;
    assessment_number: number;
    type_of_assessment: string;
    country_id: number;
    country_name: string;
    country_iso3: string;
    assessment_date: string;
    created_at: string;
    updated_at: string;
    lat: number;
    lon: number;
    longitude: number;
    latitude: number;
    phase_display: string;
    color: string;
    date_of_assessment: string;
}

export interface Props {
    accessToken?: string;
    data?: AssessmentRecord[];
    valueField?: keyof AssessmentRecord;
    mapboxStyle?: string;
    center?: [number, number];
    zoom?: number;
    minRadius?: number;
    maxRadius?: number;
    tooltipTrigger?: 'click' | 'hover';
    enableClickToFilter?: boolean;
    onClick?: (item: AssessmentRecord) => void;
    onMapLoad?: () => void;
    showLabels?: boolean;
}

function PERMap({
    accessToken = '',
    data = [],
    valueField = 'assessment_number',
    mapboxStyle = 'mapbox://styles/mapbox/light-v11',
    center = [0, 18],
    zoom = 1,
    minRadius = 5,
    maxRadius = 25,
    tooltipTrigger = 'click',
    enableClickToFilter = false,
    onClick,
    onMapLoad,
    showLabels = false,
}: Props) {
    const strings = useTranslation(i18n);
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const map = React.useRef<mapboxgl.Map | null>(null);
    const tooltipRef = React.useRef<mapboxgl.Popup | null>(null);
    const bubbleContainer = React.useRef<{
        main: d3.Selection<SVGGElement, unknown, null, undefined>;
        hover: d3.Selection<SVGGElement, unknown, null, undefined>;
    } | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const handleFilter = (event: CustomEvent<AssessmentRecord>) => {
            if (onClick) {
                onClick(event.detail);
            }
        };

        window.addEventListener('mapFilter', handleFilter as EventListener);
        return () => {
            window.removeEventListener('mapFilter', handleFilter as EventListener);
        };
    }, [onClick]);

    const calculateRadius = (value: number, minValue: number, maxValue: number) => {
        const adjustedMaxValue = minValue === maxValue ? maxValue + 1 : maxValue;
        return d3.scaleLinear()
            .domain([minValue, adjustedMaxValue])
            .range([minRadius, maxRadius])
            .nice()(value);
    };

    const calculateStrokeWidth = (value: number, minValue: number, maxValue: number) => {
        const adjustedMaxValue = minValue === maxValue ? maxValue + 1 : maxValue;
        return d3.scaleLinear()
            .domain([minValue, adjustedMaxValue])
            .range([6, 9])
            .nice()(value);
    };

    const showTooltip = (d: AssessmentRecord) => {
        if (!map.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }

        // Remove any existing tooltips
        const existingTooltips = document.querySelectorAll('.mapboxgl-popup');
        existingTooltips.forEach((tooltip) => tooltip.remove());

        const tooltip = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: tooltipTrigger === 'hover',
            offset: 15,
            className: styles.customTooltip,
        });

        tooltip.setLngLat([d.longitude, d.latitude])
            .setHTML(`
                <div class="${styles.tooltip}">
                    <div class="${styles.tooltipTitle}">
                        ${d.country_name || strings.perMapUnknownCountryLabel}
                        <button 
                            class="${styles.closeButton}" 
                            onclick="this.closest('.mapboxgl-popup').remove()"
                            aria-label="${strings.perMapTooltipCloseLabel}"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                                <path fill-rule="evenodd" d="m13.057 11.996 4.716-4.716a.75.75 0 1 0-1.06-1.06l-4.717 4.716L7.28 6.22a.75.75 0 1 0-1.06 1.06l4.716 4.716-4.716 4.716a.75.75 0 1 0 1.06 1.06l4.716-4.715 4.716 4.716a.748.748 0 0 0 1.061 0 .75.75 0 0 0 0-1.061l-4.716-4.716Z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="${styles.tooltipGrid}">
                        <div class="${styles.tooltipLabel}">${strings.perMapCurrentPhaseLabel}</div>
                        <div class="${styles.tooltipPhase}" style="background-color: ${d.color}">${d.phase_display}</div>

                        <div class="${styles.tooltipLabel}">${strings.perMapCycleYearLabel}</div>
                        <div class="${styles.tooltipValue}">${new Date(d.date_of_assessment).getFullYear()}</div>

                        <div class="${styles.tooltipLabel}">${strings.perMapCycleIterationLabel}</div>
                        <div class="${styles.tooltipValue}">${d[valueField as keyof AssessmentRecord] || 0}</div>
                    </div>
                    ${enableClickToFilter ? `
                        <div class="${styles.tooltipFooter}">
                            <button
                                class="${styles.filterButton}"
                                onclick="window.dispatchEvent(new CustomEvent('mapFilter', { detail: ${JSON.stringify(d)} }))"
                                aria-label="${strings.perMapFilterButtonLabel}"
                            >
                                ${strings.perMapFilterLabel}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `)
            .addTo(map.current);

        tooltipRef.current = tooltip;
    };

    const hideTooltip = () => {
        if (tooltipRef.current) {
            tooltipRef.current.remove();
            tooltipRef.current = null;
        }
    };

    const initializeD3Overlay = () => {
        if (!map.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }
        const container = map.current.getCanvasContainer();

        if (bubbleContainer.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }

        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('position', 'absolute')
            .style('pointer-events', 'none');

        bubbleContainer.current = {
            main: svg.append('g'),
            hover: svg.append('g'),
        };
    };

    const updatePositions = () => {
        if (!map.current || !bubbleContainer.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }

        const values = data.map((d: AssessmentRecord) => {
            if (typeof d[valueField] === 'number') {
                return d[valueField];
            }
            return Number(d[valueField]) || 0;
        });
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Explicitly type the selection
        const circles = bubbleContainer.current.main
            .selectAll<SVGCircleElement, AssessmentRecord>('circle')
            .data(data, (d) => d.id);

        // Remove old circles
        circles.exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .attr('r', 0)
            .remove();

        // Add new circles
        const circlesEnter = circles.enter()
            .append('circle')
            .attr('r', 0)
            .style('opacity', 0)
            .style('fill-opacity', 0.9)
            .style('stroke-opacity', 0.33)
            .style('cursor', 'pointer')
            .style('pointer-events', 'all')
            .style('stroke-width', (d: AssessmentRecord) => calculateStrokeWidth(d[valueField] || 0, minValue, maxValue));

        // Update all circles with proper typing
        circles
            .merge(circlesEnter)
            .style('fill', (d: AssessmentRecord) => d.color || '#007CE0')
            .style('stroke', (d: AssessmentRecord) => d.color || '#007CE0')
            .attr('cx', (d: AssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.x;
            })
            .attr('cy', (d: AssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.y;
            })
            .transition()
            .duration(500)
            .style('opacity', 1)
            .attr('r', (d: AssessmentRecord) => calculateRadius(d[valueField] || 0, minValue, maxValue))
            .style('stroke-width', (d: AssessmentRecord) => calculateStrokeWidth(d[valueField] || 0, minValue, maxValue));

        // Add hover circles
        const hoverCircles = bubbleContainer.current.hover
            .selectAll('circle')
            .data(data, (d: AssessmentRecord) => d.id);

        hoverCircles.exit().remove();

        const hoverCirclesEnter = hoverCircles.enter()
            .append('circle')
            .style('fill', 'none')
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .attr('r', 0);

        const mergedHoverCircles = hoverCircles.merge(hoverCirclesEnter as d3.Selection<
            SVGCircleElement,
            AssessmentRecord,
            SVGGElement,
            unknown
        >);

        mergedHoverCircles
            .attr('cx', (d: AssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.x;
            })
            .attr('cy', (d: AssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.y;
            })
            .attr('r', (d: AssessmentRecord) => calculateRadius(d[valueField] || 0, minValue, maxValue) + 2);

        // Handle click/hover events
        const handleTooltipTrigger = function handleTooltipTrigger(
            this: SVGCircleElement,
            event: MouseEvent,
            d: AssessmentRecord,
        ) {
            showTooltip(d);
            const hoverCircle = bubbleContainer.current?.hover
                .selectAll('circle')
                .filter((hd: AssessmentRecord) => hd.id === d.id);

            hoverCircle
                .transition()
                .duration(200)
                .style('opacity', 1);

            d3.select(this)
                .transition()
                .duration(200)
                .style('fill-opacity', 1)
                .style('stroke-opacity', 1);
        };

        circles
            .merge(circlesEnter)
            .on(
                tooltipTrigger,
                handleTooltipTrigger,
            )
            .on('mouseleave', function handleMouseLeave(this: SVGCircleElement, event: MouseEvent, d: AssessmentRecord) {
                if (tooltipTrigger === 'hover') {
                    hideTooltip();
                }

                const hoverCircle = bubbleContainer.current?.hover
                    .selectAll('circle')
                    .filter((hd: AssessmentRecord) => hd.id === d.id);

                hoverCircle
                    .transition()
                    .duration(200)
                    .style('opacity', 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.9)
                    .style('stroke-opacity', 0.33);
            });
    };

    React.useEffect(() => {
        if (!mapContainer.current || !accessToken) return;

        if (map.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }

        try {
            mapboxgl.accessToken = accessToken;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapboxStyle,
                center: center as [number, number],
                zoom,
                attributionControl: false,
                scrollZoom: false,
                renderWorldCopies: false,
            });

            // Add zoom controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Hide country labels
            map.current.on('style.load', () => {
                const layers = map.current?.getStyle().layers;
                const labelLayers = layers?.filter((layer) => layer.type === 'symbol'
                    && (layer.layout as mapboxgl.SymbolLayout)['text-field']);

                if (!showLabels) {
                    labelLayers?.forEach((layer) => {
                        map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
                    });
                }
            });

            map.current.on('load', () => {
                initializeD3Overlay();
                updatePositions();
                if (onMapLoad) {
                    onMapLoad();
                }
            });

            map.current.on('move', updatePositions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize map');
        }

        // eslint-disable-next-line consistent-return
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken, mapboxStyle, showLabels]);

    React.useEffect(() => {
        updatePositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, valueField]);

    return (
        <div
            ref={mapContainer}
            className={styles['map-container']}
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
            aria-label={strings.mapContainer}
        >
            {error && (
                <div className={styles.error}>
                    <div className={styles.errorContent}>
                        {error}
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={() => setError(null)}
                        >
                            <CloseLineIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PERMap;
