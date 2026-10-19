import 'mapbox-gl/dist/mapbox-gl.css';

import React, { useCallback } from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import * as d3 from 'd3';
import mapboxgl from 'mapbox-gl';

import IconButton from '#components/IconButton';
import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface AssessmentRecord {
    processId: number;
    assessmentNumber: number;
    typeOfAssessmentName: string | null;
    countryId: number | null;
    countryName: string | null;
    countryIso3: string | null;
    dateOfAssessment: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    longitude: number | null;
    latitude: number | null;
    phaseDisplay: string | null;
    color: string;
}

type PositionedAssessmentRecord = AssessmentRecord & {
    longitude: number;
    latitude: number;
};

export interface Props {
    accessToken?: string;
    data?: AssessmentRecord[];
    valueField?: keyof AssessmentRecord;
    mapboxStyle?: string;
    center?: [number, number];
    zoom?: number;
    minRadius?: number;
    maxRadius?: number;
    enableClickToFilter?: boolean;
    onClick?: (item: AssessmentRecord) => void;
    onMapLoad?: () => void;
    showLabels?: boolean;
}

function PERMap({
    accessToken = '',
    data = [],
    valueField = 'assessmentNumber',
    mapboxStyle = 'mapbox://styles/mapbox/light-v11',
    center = [0, 18],
    zoom = 1,
    minRadius = 5,
    maxRadius = 25,
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
    const updatePositionsRef = React.useRef<() => void>(() => undefined);
    // NOTE: the bubbles are a single Tab stop and arrow keys move between them, so
    // keyboard users do not have to tab through every National Society to leave the map
    const focusableProcessIdRef = React.useRef<number | undefined>(undefined);

    const hideTooltip = () => {
        if (tooltipRef.current) {
            tooltipRef.current.remove();
            tooltipRef.current = null;
        }
    };

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

    const showTooltip = (
        d: AssessmentRecord,
        opener?: SVGCircleElement,
        moveFocusIntoTooltip = false,
    ) => {
        if (!map.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }

        if (d.longitude === null || d.latitude === null) {
            return;
        }

        hideTooltip();

        const tooltip = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15,
            className: styles.customTooltip,
        });

        const root = document.createElement('div');
        root.className = styles.tooltip;
        const closeTooltip = () => {
            const focusWasInTooltip = root.contains(document.activeElement);
            hideTooltip();
            if (focusWasInTooltip) {
                opener?.focus();
            }
        };
        root.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                closeTooltip();
            }
        });
        const title = document.createElement('div');
        title.className = styles.tooltipTitle;
        title.textContent = d.countryName ?? strings.perMapUnknownCountryLabel;
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = styles.closeButton;
        closeButton.setAttribute('aria-label', strings.perMapTooltipCloseLabel);
        closeButton.textContent = '×';
        closeButton.addEventListener('click', closeTooltip);
        title.append(closeButton);
        root.append(title);

        const grid = document.createElement('div');
        grid.className = styles.tooltipGrid;
        const addValue = (
            label: string,
            value: string,
            className = styles.tooltipValue,
            backgroundColor?: string,
        ) => {
            const labelNode = document.createElement('div');
            labelNode.className = styles.tooltipLabel;
            labelNode.textContent = label;
            const valueNode = document.createElement('div');
            valueNode.className = className;
            valueNode.textContent = value;
            if (backgroundColor) {
                valueNode.style.backgroundColor = backgroundColor;
            }
            grid.append(labelNode, valueNode);
        };
        addValue(
            strings.perMapCurrentPhaseLabel,
            d.phaseDisplay ?? 'N/A',
            styles.tooltipPhase,
            d.color,
        );
        const date = d.dateOfAssessment ? new Date(d.dateOfAssessment) : null;
        const year = date && !Number.isNaN(date.getTime()) ? String(date.getUTCFullYear()) : 'N/A';
        addValue(strings.perMapCycleYearLabel, year);
        addValue(strings.perMapCycleIterationLabel, String(d[valueField] ?? 0));
        root.append(grid);

        let filterButton: HTMLButtonElement | undefined;
        if (enableClickToFilter) {
            const footer = document.createElement('div');
            footer.className = styles.tooltipFooter;
            filterButton = document.createElement('button');
            filterButton.type = 'button';
            filterButton.className = styles.filterButton;
            filterButton.setAttribute('aria-label', strings.perMapFilterButtonLabel);
            filterButton.textContent = strings.perMapFilterLabel;
            filterButton.addEventListener('click', () => onClick?.(d));
            footer.append(filterButton);
            root.append(footer);
        }

        tooltip.setLngLat([d.longitude, d.latitude])
            .setDOMContent(root)
            .addTo(map.current);

        tooltipRef.current = tooltip;

        if (moveFocusIntoTooltip) {
            (filterButton ?? closeButton).focus();
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

    const updatePositions = useCallback(() => {
        if (!map.current || !bubbleContainer.current) {
            // eslint-disable-next-line no-console
            console.warn(strings.perMapInitializationErrorLabel);
            return;
        }

        const records = data.filter(
            (record): record is PositionedAssessmentRecord => (
                record.longitude !== null && record.latitude !== null
            ),
        );
        if (records.length === 0) {
            bubbleContainer.current.main.selectAll('circle').remove();
            bubbleContainer.current.hover.selectAll('circle').remove();
            return;
        }
        const values = records.map((d: PositionedAssessmentRecord) => {
            if (typeof d[valueField] === 'number') {
                return d[valueField];
            }
            return Number(d[valueField]) || 0;
        });
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Explicitly type the selection
        const circles = bubbleContainer.current.main
            .selectAll<SVGCircleElement, PositionedAssessmentRecord>('circle')
            .data(records, (d) => d.processId);

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
            .style('stroke-width', (d: PositionedAssessmentRecord) => calculateStrokeWidth(Number(d[valueField]) || 0, minValue, maxValue));

        // Update all circles with proper typing
        circles
            .merge(circlesEnter)
            .style('fill', (d: PositionedAssessmentRecord) => d.color || '#007CE0')
            .style('stroke', (d: PositionedAssessmentRecord) => d.color || '#007CE0')
            .attr('cx', (d: PositionedAssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.x;
            })
            .attr('cy', (d: PositionedAssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.y;
            })
            .transition()
            .duration(500)
            .style('opacity', 1)
            .attr('r', (d: PositionedAssessmentRecord) => calculateRadius(Number(d[valueField]) || 0, minValue, maxValue))
            .style('stroke-width', (d: PositionedAssessmentRecord) => calculateStrokeWidth(Number(d[valueField]) || 0, minValue, maxValue));

        // Add hover circles
        const hoverCircles = bubbleContainer.current.hover
            .selectAll<SVGCircleElement, PositionedAssessmentRecord>('circle')
            .data(records, (d) => String(d.processId));

        hoverCircles.exit().remove();

        const hoverCirclesEnter = hoverCircles.enter()
            .append('circle')
            .style('fill', 'none')
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .attr('r', 0);

        const mergedHoverCircles = hoverCircles.merge(hoverCirclesEnter);

        mergedHoverCircles
            .attr('cx', (d: PositionedAssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.x;
            })
            .attr('cy', (d: PositionedAssessmentRecord) => {
                if (!map.current) return 0;
                const point = map.current.project([d.longitude, d.latitude]);
                return point.y;
            })
            .attr('r', (d: PositionedAssessmentRecord) => calculateRadius(Number(d[valueField]) || 0, minValue, maxValue) + 2);

        const highlightBubble = (element: SVGCircleElement, d: PositionedAssessmentRecord) => {
            const hoverCircle = bubbleContainer.current?.hover
                .selectAll<SVGCircleElement, PositionedAssessmentRecord>('circle')
                .filter((hd) => hd.processId === d.processId);

            hoverCircle?.transition()
                .duration(200)
                .style('opacity', 1);

            d3.select(element)
                .transition()
                .duration(200)
                .style('fill-opacity', 1)
                .style('stroke-opacity', 1);
        };

        // NOTE: The tooltip opens on click only. A hover tooltip would close before its
        // Filter button could be reached, and touch screens have no hover.
        const handleBubbleClick = function handleBubbleClick(
            this: SVGCircleElement,
            event: MouseEvent,
            d: PositionedAssessmentRecord,
        ) {
            if (event) showTooltip(d, this);
            highlightBubble(this, d);
        };

        const keyboardOrder = [...records].sort(
            (left, right) => (left.countryName ?? '').localeCompare(right.countryName ?? ''),
        );
        if (!keyboardOrder.some((d) => d.processId === focusableProcessIdRef.current)) {
            focusableProcessIdRef.current = keyboardOrder[0]?.processId;
        }
        const allBubbles = circles.merge(circlesEnter);
        const setFocusableBubble = (processId: number) => {
            focusableProcessIdRef.current = processId;
            allBubbles.attr('tabindex', (d) => (d.processId === processId ? 0 : -1));
        };

        const handleBubbleKeyDown = function handleBubbleKeyDown(
            this: SVGCircleElement,
            event: KeyboardEvent,
            d: PositionedAssessmentRecord,
        ) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                showTooltip(d, this, true);
                highlightBubble(this, d);
                return;
            }

            const index = keyboardOrder.findIndex((item) => item.processId === d.processId);
            const lastIndex = keyboardOrder.length - 1;
            let nextIndex: number | undefined;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                nextIndex = index === lastIndex ? 0 : index + 1;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                nextIndex = index === 0 ? lastIndex : index - 1;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = lastIndex;
            }
            const next = nextIndex === undefined ? undefined : keyboardOrder[nextIndex];
            if (!next) {
                return;
            }
            // NOTE: stop the key from also panning the map
            event.preventDefault();
            event.stopPropagation();
            setFocusableBubble(next.processId);
            allBubbles.filter((item) => item.processId === next.processId).node()?.focus();
        };

        allBubbles
            .attr('class', styles.bubble)
            .attr('role', 'button')
            .attr('aria-label', (d) => d.countryName ?? strings.perMapUnknownCountryLabel)
            .attr('tabindex', (d) => (d.processId === focusableProcessIdRef.current ? 0 : -1))
            .on('click', handleBubbleClick)
            .on('keydown', handleBubbleKeyDown)
            .on('focus', (_: FocusEvent, d: PositionedAssessmentRecord) => setFocusableBubble(d.processId))
            .on('mouseleave blur', function handleBubbleLeave(this: SVGCircleElement, _: Event, d: PositionedAssessmentRecord) {
                const hoverCircle = bubbleContainer.current?.hover
                    .selectAll<SVGCircleElement, PositionedAssessmentRecord>('circle')
                    .filter((hd) => hd.processId === d.processId);

                hoverCircle?.transition()
                    .duration(200)
                    .style('opacity', 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.9)
                    .style('stroke-opacity', 0.33);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data,
        valueField,
        showTooltip,
        hideTooltip,
        calculateRadius,
        calculateStrokeWidth,
    ]);
    updatePositionsRef.current = updatePositions;

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
                updatePositionsRef.current();
                if (onMapLoad) {
                    onMapLoad();
                }
            });

            map.current.on('move', () => updatePositionsRef.current());
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setError(strings.perMapInitializationErrorLabel);
        }

        // eslint-disable-next-line consistent-return
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
            // NOTE: the bubble layer was part of the removed map
            bubbleContainer.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken, mapboxStyle, showLabels]);

    React.useEffect(() => {
        updatePositions();
    }, [data, valueField, updatePositions]);

    return (
        <div
            ref={mapContainer}
            className={styles.mapContainer}
            aria-label={strings.perMapContainerLabel}
        >
            {error && (
                <Message
                    className={styles.error}
                    variant="error"
                    title={error}
                    actions={(
                        <IconButton
                            name={undefined}
                            onClick={() => setError(null)}
                            title={strings.perMapDismissErrorLabel}
                            ariaLabel={strings.perMapDismissErrorLabel}
                        >
                            <CloseLineIcon />
                        </IconButton>
                    )}
                />
            )}
        </div>
    );
}

export default PERMap;
