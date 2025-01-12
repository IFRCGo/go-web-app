import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import * as d3 from 'd3';

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
}

interface Props {
  d: TreemapNode;
  onClick?: (item: { area: string; component: string | null }) => void;
  activeIndex?: string | number | null;
  className?: string;
  height?: number;
}

function PERTreemapChart({
    d,
    onClick,
    activeIndex,
    className,
    height = 440,
}: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
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
                .on('end', function onTransitionEnd() {
                    count -= 1;
                    if (!count) {
                        callback.call(this);
                    }
                });
        },
        [],
    );

    const showTooltip = useCallback((event: MouseEvent, node: TreemapNode) => {
        if (!tooltipRef.current || !svgRef.current) return;

        const { clientX, clientY } = event;
        const tooltipWidth = tooltipRef.current.offsetWidth || 0;
        const tooltipHeight = tooltipRef.current.offsetHeight || 0;

        // Position tooltip to avoid going off screen
        let leftPos = clientX + 10;
        let topPos = clientY + 10;

        // Check if tooltip would go off right edge
        if (leftPos + tooltipWidth > window.innerWidth) {
            leftPos = clientX - tooltipWidth - 10;
        }

        // Check if tooltip would go off bottom edge
        if (topPos + tooltipHeight > window.innerHeight) {
            topPos = clientY - tooltipHeight - 10;
        }

        const tooltipContent = `
            <div class="${styles.tooltipTitle}">${node.data?.name || ''}</div>
            <div class="${styles.tooltipTag}" style="background-color: ${node.parent?.data?.color || '#ccc'}">${node.parent?.data?.name || ''}</div>
            ${node.depth === 2 && node.data ? `<div class="${styles.tooltipValue}">${node.data.value}</div>` : ''}
        `;

        d3.select(tooltipRef.current)
            .style('visibility', 'visible')
            .style('opacity', '1')
            .style('position', 'fixed')
            .html(tooltipContent)
            .style('left', `${leftPos}px`)
            .style('top', `${topPos}px`);
    }, []);

    const moveTooltip = useCallback((event: MouseEvent) => {
        if (!tooltipRef.current) return;

        const { clientX, clientY } = event;
        const tooltipWidth = tooltipRef.current.offsetWidth || 0;
        const tooltipHeight = tooltipRef.current.offsetHeight || 0;

        // Position tooltip to avoid going off screen
        let leftPos = clientX + 10;
        let topPos = clientY + 10;

        // Check if tooltip would go off right edge
        if (leftPos + tooltipWidth > window.innerWidth) {
            leftPos = clientX - tooltipWidth - 10;
        }

        // Check if tooltip would go off bottom edge
        if (topPos + tooltipHeight > window.innerHeight) {
            topPos = clientY - tooltipHeight - 10;
        }

        d3.select(tooltipRef.current)
            .style('left', `${leftPos}px`)
            .style('top', `${topPos}px`);
    }, []);

    const hideTooltip = useCallback(() => {
        if (!tooltipRef.current) return;

        d3.select(tooltipRef.current)
            .style('visibility', 'hidden')
            .style('opacity', '0');
    }, []);

    const attachTooltipBehavior = useCallback(
        (selection: d3.Selection<d3.BaseType, unknown, null, undefined>) => {
            selection
                .style('fill', 'transparent')
                .style('cursor', 'pointer')
                .style('pointer-events', 'all')
                .on(
                    'mouseover',
                    (event: MouseEvent, node: TreemapNode) => {
                        if (node.data?.name && node.data.name.includes('Root')) {
                            return;
                        }

                        const element = event.currentTarget as Element;
                        const baseRect = d3
                            .select(element.parentNode as Element)
                            .select('.base-rect');
                        if (activeIndex && node.depth === 2 && node.data?.name === activeIndex) {
                            baseRect.style('stroke', '#00C2FF').style('stroke-width', 3);
                        } else {
                            baseRect.style('stroke', 'white').style('stroke-width', 2);
                        }
                        showTooltip(event, node);
                    },
                )
                .on('mousemove', moveTooltip)
                .on('mouseout', (event: MouseEvent) => {
                    const element = event.currentTarget as Element;
                    const baseRect = d3
                        .select(element.parentNode as Element)
                        .select('.base-rect');
                    const node = d3.select(element).datum() as TreemapNode;
                    if (
                        activeIndex
                        && node.depth === 2
                        && node.data?.name === activeIndex
                    ) {
                        baseRect.style('stroke', '#00C2FF').style('stroke-width', 3);
                    } else {
                        baseRect.style('stroke', '#fff').style('stroke-width', 1);
                    }
                    hideTooltip();
                })
                .on('click', (event: MouseEvent, node: TreemapNode) => {
                    hideTooltip();
                    if (onClick && event) {
                        const area = node.depth === 2 ? node.parent?.data?.name : node.data?.name;
                        const component = node.depth === 2 ? node.data?.name : null;
                        if (area) {
                            onClick({ area, component });
                        }
                    }
                });
        },
        [activeIndex, onClick, showTooltip, moveTooltip, hideTooltip],
    );

    useEffect(() => {
        setData(d);
    }, [d]);

    useEffect(() => {
        if (!data || !svgRef.current || !tooltipRef.current) return;

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
            .sort((a: d3.HierarchyNode<TreemapNode>, b: d3.HierarchyNode<TreemapNode>) => (b.value ?? 0) - (a.value ?? 0));

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
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
            .style(
                'fill',
                (node: d3.HierarchyNode<TreemapNode>) => (
                    node.data.color || (node.parent ? node.parent.data.color : '#ccc')
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
                return 1;
            });

        nodesEnter
            .append('rect')
            .attr('class', 'overlay-rect')
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
            .call(attachTooltipBehavior);

        const nodesUpdate = nodes.merge(nodesEnter);

        nodesUpdate.select('.overlay-rect').style('pointer-events', 'none');

        nodesUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`)
            .style('opacity', 1)
            .on('end', function onUpdateTransitionEnd() {
                nodesUpdate.select('.overlay-rect').style('pointer-events', 'all');
                nodesUpdate.select('.overlay-rect').each(function updateOverlayRect() {
                    d3.select(this).call(attachTooltipBehavior);
                });
            });

        nodesUpdate
            .select('.base-rect')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
            .style(
                'fill',
                (node: d3.HierarchyNode<TreemapNode>) => (
                    node.data.color || (node.parent ? node.parent.data.color : '#ccc')
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
                return 1;
            });

        nodesUpdate
            .select('.overlay-rect')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
            .on('end', function onOverlayTransitionEnd() {
                d3.select(this).style('pointer-events', 'all');
                d3.select(this).call(attachTooltipBehavior);
            });

        const addLabelContent = (selection: d3.Selection<d3.BaseType, d3.HierarchyNode<TreemapNode>, null, undefined>): void => {
            selection.selectAll('foreignObject').remove();

            // Add parent labels
            selection
                .filter((node: d3.HierarchyNode<TreemapNode>) => node.depth === 1)
                .each(function addParentLabel(this: SVGRectElement | null, node: d3.HierarchyNode<TreemapNode>) {
                    const width = node.x1 - node.x0 - 1;
                    const height = node.y1 - node.y0 - 1;

                    if (width >= MIN_WIDTH_FOR_LABEL && height >= MIN_HEIGHT_FOR_LABEL) {
                        if (this) {
                            d3.select<SVGRectElement, any>(this)
                                .append('foreignObject')
                                .attr('x', 3)
                                .attr('y', 1)
                                .attr('width', width - 5)
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
                .each(function addChildLabel(this: SVGRectElement, node: d3.HierarchyNode<TreemapNode>) {
                    const width = node.x1 - node.x0 - 1;
                    const height = node.y1 - node.y0 - 1;

                    if (width >= MIN_WIDTH_FOR_LABEL && height >= MIN_HEIGHT_FOR_LABEL) {
                        d3.select(this)
                            .append('foreignObject')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('width', width)
                            .attr('height', height)
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
            .call((t: any) => {
                endAll(t, () => {
                    labelsUpdate.selectAll('foreignObject').remove();
                    addLabelContent(labelsUpdate);
                    labelsUpdate
                        .transition()
                        .duration(TRANSITION_DURATION / 2)
                        .style('opacity', 1);
                });
            });

        const handleResize = (): void => {
            if (!svgRef.current) {
                return;
            }

            const newWidth = (svgRef.current.clientWidth || 0) - PADDING * 2;
            const newHeight = (svgRef.current.clientHeight || 500) - PADDING * 2;

            svgElement
                .attr('width', newWidth + PADDING * 2)
                .attr('height', newHeight + PADDING * 2);

            const resizedRoot = d3.hierarchy(data)
                .sum((node: TreemapNode) => node.value || 0)
                .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

            d3.treemap()
                .size([newWidth, newHeight])
                .paddingInner(1)
                .paddingOuter(0)
                .round(true)(resizedRoot);

            const resizedNodes = layer1
                .selectAll<SVGGElement, d3.HierarchyNode<TreemapNode>>('g')
                .data(
                    resizedRoot.descendants(),
                    (node: d3.HierarchyNode<TreemapNode>) => node.data.name,
                );

            resizedNodes
                .exit()
                .transition()
                .duration(TRANSITION_DURATION)
                .style('opacity', 0)
                .remove();

            const resizedNodesEnter = resizedNodes
                .enter()
                .append('g')
                .attr('opacity', 0)
                .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => (
                    `translate(${node.x0},${node.y0})`
                ));

            const resizedNodesUpdate = resizedNodes.merge(resizedNodesEnter);

            resizedNodesUpdate.select('.overlay-rect').style('pointer-events', 'none');

            resizedNodesUpdate
                .transition()
                .duration(TRANSITION_DURATION)
                .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`)
                .style('opacity', 1)
                .on('end', () => {
                    resizedNodesUpdate.select('.overlay-rect').style('pointer-events', 'all');
                    resizedNodesUpdate.select('.overlay-rect').each(function () {
                        d3.select(this).call(attachTooltipBehavior);
                    });
                });

            resizedNodesUpdate
                .select('.base-rect')
                .transition()
                .duration(TRANSITION_DURATION)
                .attr('x', 0.5)
                .attr('y', 0.5)
                .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
                .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
                .style(
                    'fill',
                    (node: d3.HierarchyNode<TreemapNode>) => (
                        node.data.color || (node.parent ? node.parent.data.color : '#ccc')
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
                    return 1;
                });

            resizedNodesUpdate
                .select('.overlay-rect')
                .transition()
                .duration(TRANSITION_DURATION)
                .attr('x', 0.5)
                .attr('y', 0.5)
                .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
                .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
                .on('end', function onOverlayTransitionEnd() {
                    d3.select(this).style('pointer-events', 'all');
                    d3.select(this).call(attachTooltipBehavior);
                });

            const resizedLabels = layer2
                .selectAll<SVGGElement, d3.HierarchyNode<TreemapNode>>('g')
                .data(
                    resizedRoot.descendants(),
                    (node: d3.HierarchyNode<TreemapNode>) => node.data.name,
                );

            resizedLabels
                .exit()
                .transition()
                .duration(TRANSITION_DURATION)
                .style('opacity', 0)
                .remove();

            const resizedLabelsEnter = resizedLabels
                .enter()
                .append('g')
                .attr('opacity', 1)
                .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => (
                    `translate(${node.x0},${node.y0})`
                ));

            const resizedLabelsUpdate = resizedLabels.merge(resizedLabelsEnter);

            resizedLabelsUpdate
                .transition()
                .duration(TRANSITION_DURATION / 2)
                .style('opacity', 0)
                .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => (
                    `translate(${node.x0},${node.y0})`
                ))
                .call((transition: d3.Transition<d3.BaseType, unknown, null, undefined>) => {
                    endAll(transition, () => {
                        resizedLabelsUpdate.selectAll('foreignObject').remove();
                        addLabelContent(resizedLabelsUpdate);
                        resizedLabelsUpdate
                            .transition()
                            .duration(TRANSITION_DURATION / 2)
                            .style('opacity', 1);
                    });
                });

            svg.selectAll('.overlay-rect').call(attachTooltipBehavior);
            return undefined;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [data, activeIndex, attachTooltipBehavior, endAll, height]);

    return (
        <div
            className={_cs(styles.container, className)}
            style={{ height, width: '100%' }}
        >
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: 'block' }}
            />
            <div ref={tooltipRef} className={styles.tooltip} />
        </div>
    );
}

export default PERTreemapChart;
