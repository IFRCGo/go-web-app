/* eslint-disable no-underscore-dangle */
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import * as d3 from 'd3';
import tippy, { Instance as TippyInstance } from 'tippy.js';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface TreemapNode {
    id: string;
    value: number;
    name: string;
    parent?: string;
    children?: TreemapNode[];
    data?: {
        name: string;
        value: number;
        color: string;
    };
    area?: string;
    component?: string | null;
}

interface Props {
    d: TreemapNode;
    onClick?: (item: { area: string; component: string | null }) => void;
    onHover?: (item: TreemapNode['data'] | undefined) => void;
    activeIndex?: string | number | null;
    className?: string;
    height?: number;
}

interface HTMLElementWithTippy extends HTMLElement {
    _tippy: TippyInstance | undefined;
}

type D3TreemapSelection = d3.Selection<
    d3.BaseType,
    d3.HierarchyNode<TreemapNode>,
    HTMLElement,
    unknown
>;

function createTooltipContent(
    node: d3.HierarchyNode<TreemapNode>,
    strings: Record<string, Record<string, string>>,
): HTMLElement | null {
    if (!node?.data?.name || node.data.name.includes('Root')) {
        return null;
    }

    const tooltipContent = document.createElement('div');
    tooltipContent.className = styles.tooltipContent;

    const title = document.createElement('div');
    title.className = styles.tooltipTitle;
    title.textContent = strings?.tooltips?.title?.replace('{name}', node.data.name) ?? node.data.name;
    tooltipContent.appendChild(title);

    if (node.parent?.data?.name) {
        const tag = document.createElement('div');
        tag.className = styles.tooltipTag;
        tag.textContent = strings?.tooltips?.tag?.replace('{name}', node.parent.data.name) ?? node.parent.data.name;
        tag.style.backgroundColor = node.parent.data.color || 'var(--go-ui-color-background)';
        tooltipContent.appendChild(tag);
    }

    if (node.depth === 2 && typeof node.data.value === 'number') {
        const value = document.createElement('div');
        value.className = styles.tooltipValue;
        value.textContent = strings?.tooltips?.value?.replace('{value}', node.data.value.toString()) ?? node.data.value.toString();
        tooltipContent.appendChild(value);
    }

    return tooltipContent;
}

function PERTreemapChart({
    d,
    onClick,
    onHover,
    activeIndex,
    className,
    height = 440,
}: Props) {
    const strings = useTranslation(i18n)?.strings;
    const svgRef = useRef<SVGSVGElement>(null);
    const isAnimatingRef = useRef(false);
    const tooltipTimeoutRef = useRef<number>();
    const [data, setData] = useState<TreemapNode>();

    // Configuration constants
    const MIN_WIDTH_FOR_LABEL = 70;
    const MIN_HEIGHT_FOR_LABEL = 60;
    const PARENT_LABEL_MAX_LENGTH = 35;
    const CHILD_LABEL_MAX_LENGTH = 40;
    const TRANSITION_DURATION = 750;
    const PADDING = 2;

    const truncateText = (text: string, maxLength: number) => (
        text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
    );

    const endAll = useCallback(
        (
            transition: d3.Transition<d3.BaseType, unknown, null, undefined>,
            callback: () => void,
        ) => {
            let count = 0;
            transition
                .each(() => {
                    count += 1;
                })
                .on('end', function handleTransitionEnd() {
                    count -= 1;
                    if (!count) {
                        callback.call(this);
                    }
                });
        },
        [],
    );

    const attachTooltipBehavior = useCallback(
        (selection: D3TreemapSelection) => {
            selection
                .style('fill', 'transparent')
                .style('cursor', 'pointer')
                .style('pointer-events', 'all')
                .each(function tooltipHandler(
                    this: HTMLElement,
                    node: d3.HierarchyNode<TreemapNode>,
                ) {
                    const element = this as HTMLElementWithTippy;
                    if (element._tippy) {
                        element._tippy.destroy();
                    }
                    if (!node.data?.name || node.data.name.includes('Root')) {
                        return;
                    }
                    tippy(this, {
                        content: createTooltipContent(node, strings),
                        theme: 'light-border',
                        arrow: true,
                        offset: [0, 10],
                        placement: 'right',
                        animation: 'fade',
                        duration: 300,
                        appendTo: () => document.body,
                        onShow: (instance) => {
                            if (isAnimatingRef.current) {
                                instance.hide();
                                return false;
                            }
                            const currentNode = d3
                                .select(this)
                                .datum() as d3.HierarchyNode<TreemapNode>;
                            if (currentNode?.data) {
                                instance.setContent(createTooltipContent(currentNode, strings));
                                onHover?.(currentNode.data);
                            }
                            return true;
                        },
                        onHide: () => {
                            onHover?.(undefined);
                        },
                    });
                })
                .on('click', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) => {
                    if (!onClick || !event || !node.data) {
                        return;
                    }

                    const area = node.depth === 2 ? node.parent?.data?.name : node.data.name;
                    const component = node.depth === 2 ? node.data.name : null;

                    // If clicking on already selected component, deselect it
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        onClick({ area: '', component: null });
                        return;
                    }

                    if (area) {
                        onClick({ area, component });
                    }
                })
                .attr('aria-label', (node: d3.HierarchyNode<TreemapNode>) => {
                    if (node.depth === 1) {
                        return strings?.ariaLabels?.section?.replace('{name}', node.data.name)
                            ?? node.data.name;
                    }
                    if (node.depth === 2) {
                        const label = strings?.ariaLabels?.component
                            ?.replace('{name}', node.data.name)
                            ?.replace('{value}', node.data.value.toString())
                            ?? `${node.data.name} ${node.data.value}`;

                        if (activeIndex && node.data.name === activeIndex) {
                            return strings?.ariaLabels?.selected?.replace('{name}', node.data.name)
                                ?? node.data.name;
                        }
                        return label;
                    }
                    return '';
                })
                .on('mouseover', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) => {
                    if (node.data) {
                        onHover?.(node.data);
                    }
                })
                .on('mouseout', () => {
                    onHover?.(undefined);
                });
        },
        [activeIndex, onClick, onHover, strings],
    );

    const hideAllTooltips = useCallback(() => {
        const tooltips = document.querySelectorAll('[data-tippy-root]');
        tooltips.forEach((tooltip) => {
            const tippyInstance = (tooltip as HTMLElementWithTippy)._tippy;
            if (tippyInstance) {
                tippyInstance.hide();
            }
        });
    }, []);

    const enableTooltips = useCallback((selection: D3TreemapSelection) => {
        if (tooltipTimeoutRef.current) {
            window.clearTimeout(tooltipTimeoutRef.current);
        }
        tooltipTimeoutRef.current = window.setTimeout(() => {
            isAnimatingRef.current = false;
            selection.style('pointer-events', 'all');
        }, 300); // 300ms delay after animation
    }, []);

    useEffect(() => {
        setData(d);
        // Cleanup tooltips when component unmounts
        return () => {
            const tooltipElements = document.querySelectorAll('[data-tippy-root]');
            tooltipElements.forEach((element) => {
                const node = element as HTMLElementWithTippy;
                if (node._tippy) {
                    node._tippy.destroy();
                }
            });
        };
    }, [d]);

    useEffect(() => {
        if (!data || !svgRef.current) return;

        const svgElement = d3.select(svgRef.current);
        const width = (svgRef.current.clientWidth || 0) - PADDING * 2;
        const svgHeight = height - PADDING * 2;

        let svg = svgElement.select<SVGGElement>('g');
        if (svg.empty()) {
            svgElement
                .attr('width', width + PADDING * 2)
                .attr('height', svgHeight + PADDING * 2)
                .style('background-color', 'rgba(255,255,255,0.9)');

            svg = svgElement
                .append('g')
                .attr('transform', `translate(${PADDING},${PADDING})`);

            svg.append('g').attr('class', 'layer1');
            svg.append('g').attr('class', 'layer2');
        }

        const layer1 = svg.select('.layer1');
        const layer2 = svg.select('.layer2');

        const root = d3.hierarchy(data)
            .sum((node: TreemapNode) => node.value || 0)
            .sort(
                (a: d3.HierarchyNode<TreemapNode>, b: d3.HierarchyNode<TreemapNode>) => (
                    (b.value ?? 0) - (a.value ?? 0)
                ),
            );

        d3.treemap()
            .size([width, svgHeight])
            .paddingInner(1)
            .paddingOuter(0)
            .round(true)(root);

        const nodes = layer1
            .selectAll<SVGGElement, d3.HierarchyNode<TreemapNode>>('g')
            .data(
                root.descendants(),
                (node: d3.HierarchyNode<TreemapNode>) => node.data.name,
            );

        nodes
            .exit()
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 0)
            .remove();

        const nodesEnter = nodes
            .enter()
            .append('g')
            .attr('opacity', 0)
            .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`);

        nodesEnter
            .append('rect')
            .attr('class', 'base-rect')
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0) + 1)
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0) + 1);

        nodesEnter
            .append('rect')
            .attr('class', 'overlay-rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1) + 0.5)
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1) + 0.5);

        const nodesUpdate = nodes.merge(nodesEnter);

        nodesUpdate.select('.overlay-rect').style('pointer-events', 'all').call(attachTooltipBehavior);

        const updateBaseRectStyles = (selection: D3TreemapSelection) => {
            selection
                .style(
                    'fill',
                    (node: d3.HierarchyNode<TreemapNode>) => (
                        node.data.color || (node.parent ? node.parent.data.color : 'var(--go-ui-color-background)')
                    ),
                )
                .style('stroke', (node: d3.HierarchyNode<TreemapNode>) => {
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return '#00C2FF';
                    }
                    return '#fff';
                })
                .style('stroke-width', (node: d3.HierarchyNode<TreemapNode>) => {
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return 3;
                    }
                    return 0.5;
                });
        };

        const addHoverBehavior = (selection: D3TreemapSelection) => {
            selection
                .on('mouseover', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) => {
                    if (node.data?.name && node.data.name.includes('Root')) {
                        return;
                    }

                    // Skip hover effect for selected nodes
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return;
                    }

                    const element = event.currentTarget as SVGElement;
                    const baseRect = d3.select(element.parentNode).select('.base-rect');
                    baseRect.style('stroke', 'white').style('stroke-width', 2);
                })
                .on('mouseout', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) => {
                    if (node.data?.name && node.data.name.includes('Root')) {
                        return;
                    }

                    const element = event.currentTarget as SVGElement;
                    const baseRect = d3.select(element.parentNode).select('.base-rect');
                    updateBaseRectStyles(baseRect);
                });
        };

        nodesUpdate
            .select('.base-rect')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0) + 1)
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0) + 1)
            .call(updateBaseRectStyles);

        nodesUpdate
            .select('.overlay-rect')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
            .on('start', () => {
                isAnimatingRef.current = true;
                hideAllTooltips();
                nodesUpdate.select('.overlay-rect').style('pointer-events', 'none');
            })
            .on('end', function handleTransitionEnd(this: HTMLElement) {
                const selection = d3.select(this);
                selection.call(addHoverBehavior);
                enableTooltips(nodesUpdate.select('.overlay-rect'));
            });

        nodesUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`)
            .style('opacity', 1)
            .on('start', () => {
                isAnimatingRef.current = true;
                hideAllTooltips();
                nodesUpdate.select('.overlay-rect').style('pointer-events', 'none');
            })
            .on('end', () => {
                enableTooltips(nodesUpdate.select('.overlay-rect'));
            });

        const addLabelContent = (
            selection: D3TreemapSelection,
        ): void => {
            selection.selectAll('foreignObject').remove();

            // Add parent labels
            selection
                .filter((node: d3.HierarchyNode<TreemapNode>) => node.depth === 1)
                .each((node: d3.HierarchyNode<TreemapNode>, i: number, groups: Element[]) => {
                    const rect = groups[i] as SVGRectElement | null;
                    const rectWidth = node.x1 - node.x0 - 1;
                    const rectHeight = node.y1 - node.y0 - 1;

                    if (rectWidth >= MIN_WIDTH_FOR_LABEL && rectHeight >= MIN_HEIGHT_FOR_LABEL) {
                        if (rect) {
                            d3.select(rect)
                                .append('foreignObject')
                                .attr('x', 3)
                                .attr('y', 1)
                                .attr('width', rectWidth - 5)
                                .attr('height', 40)
                                .style('overflow', 'hidden')
                                .style('pointer-events', 'none')
                                .append('xhtml:div')
                                .style('width', '95%')
                                .style('height', '100%')
                                .style('display', 'flex')
                                .style('padding', '2px')
                                .style('line-height', '16px')
                                .style('box-sizing', 'border-box')
                                .style('color', '#fff')
                                .style('font-size', '12px')
                                .style('font-weight', '600')
                                .html(truncateText(node.data.name, PARENT_LABEL_MAX_LENGTH));
                        }
                    }
                });

            // Add child labels
            selection
                .filter((node: d3.HierarchyNode<TreemapNode>) => node.depth === 2)
                .each((node: d3.HierarchyNode<TreemapNode>, i: number, groups: Element[]) => {
                    const rect = groups[i] as SVGRectElement;
                    const rectWidth = node.x1 - node.x0 - 1;
                    const rectHeight = node.y1 - node.y0 - 1;

                    if (rectWidth >= MIN_WIDTH_FOR_LABEL && rectHeight >= MIN_HEIGHT_FOR_LABEL) {
                        d3.select(rect)
                            .append('foreignObject')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('width', rectWidth)
                            .attr('height', rectHeight)
                            .style('pointer-events', 'none')
                            .append('xhtml:div')
                            .style('width', '95%')
                            .style('height', '100%')
                            .style('display', 'flex')
                            .style('flex-direction', 'column')
                            .style('justify-content', 'flex-end')
                            .style('padding', '0px')
                            .style('padding-left', '5px')
                            .style('box-sizing', 'border-box')
                            .style('color', '#fff')
                            .style('font-size', '10px')
                            .style('overflow', 'hidden')
                            .style('word-wrap', 'break-word')
                            .html(
                                `<div style="font-weight:300; line-height: 13px;">
                                  ${truncateText(node.data.name, CHILD_LABEL_MAX_LENGTH)}
                                </div>
                                <div style="font-size: 16px">${node.data.value}</div>`,
                            );
                    }
                });
        };

        // Update labels with transition
        const labels = layer2
            .selectAll<SVGGElement, d3.HierarchyNode<TreemapNode>>('g')
            .data(root.descendants(), (node: d3.HierarchyNode<TreemapNode>) => node.data.name);

        // Remove old labels
        labels
            .exit()
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 0)
            .remove();

        // Enter new labels
        const labelsEnter = labels
            .enter()
            .append('g')
            .attr('opacity', 1)
            .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`);

        // Merge and transition both new and existing labels
        const labelsUpdate = labels.merge(labelsEnter);

        // Fade out labels and move to new positions
        labelsUpdate
            .transition()
            .duration(TRANSITION_DURATION / 2)
            .style('opacity', 0)
            .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`)
            .call((transition: d3.Transition<d3.BaseType, unknown, null, undefined>) => {
                endAll(transition, () => {
                    labelsUpdate.selectAll('foreignObject').remove();
                    addLabelContent(labelsUpdate);
                    labelsUpdate
                        .transition()
                        .duration(TRANSITION_DURATION / 2)
                        .style('opacity', 1);
                });
            });
    }, [
        data,
        activeIndex,
        attachTooltipBehavior,
        endAll,
        height,
        onHover,
        enableTooltips,
        hideAllTooltips,
    ]);

    return (
        <div
            className={_cs(styles.container, className)}
            aria-label={strings?.ariaLabels?.container ?? 'Treemap chart'}
        >
            <svg
                ref={svgRef}
                className={styles.chart}
                aria-label={strings?.ariaLabels?.chart ?? 'Interactive treemap chart showing hierarchical data'}
                height={height}
            />
        </div>
    );
}

export default PERTreemapChart;
