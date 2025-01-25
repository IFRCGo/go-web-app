import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

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

interface ElementWithTippy extends Element {
    _tippy?: {
        destroy: () => void;
    };
}

function createTooltipContent(node: d3.HierarchyNode<TreemapNode>) {
    if (!node || !node.data || (node.data.name && node.data.name.includes('Root'))) {
        return null;
    }

    const tooltipContent = document.createElement('div');
    tooltipContent.className = styles.tooltipContent;

    const title = document.createElement('div');
    title.className = styles.tooltipTitle;
    title.textContent = node.data.name || '';
    tooltipContent.appendChild(title);

    const tag = document.createElement('div');
    tag.className = styles.tooltipTag;
    tag.textContent = node.parent?.data?.name || '';
    tag.style.backgroundColor = node.parent?.data?.color || 'var(--go-ui-color-background)';
    tooltipContent.appendChild(tag);

    if (node.depth === 2 && node.data) {
        const value = document.createElement('div');
        value.className = styles.tooltipValue;
        value.textContent = node.data.value.toString();
        tooltipContent.appendChild(value);
    }

    return tooltipContent;
}

function PERTreemapChart({
    d,
    onClick,
    activeIndex,
    className,
    height = 440,
}: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
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

    const attachTooltipBehavior = useCallback(
        (selection: d3.Selection<d3.BaseType, unknown, null, undefined>) => {
            selection
                .style('fill', 'transparent')
                .style('cursor', 'pointer')
                .style('pointer-events', 'all')
                .each(function(this: ElementWithTippy, node: d3.HierarchyNode<TreemapNode>) {
                    // Destroy existing tippy instance if it exists
                    if (this._tippy) {
                        this._tippy.destroy();
                    }
                    
                    if (!node.data?.name || !node.data.name.includes('Root')) {
                        tippy(this, {
                            content: createTooltipContent(node),
                            theme: 'light-border',
                            arrow: true,
                            offset: [0, 10],
                            placement: 'right',
                            animation: 'fade',
                            duration: 300,
                            appendTo: () => document.body,
                            onShow: (instance) => {
                                const currentNode = d3.select(this).datum() as d3.HierarchyNode<TreemapNode>;
                                instance.setContent(createTooltipContent(currentNode));
                            }
                        });
                    }
                })
                .on('click', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) => {
                    if (onClick && event) {
                        const area = node.depth === 2 ? node.parent?.data?.name : node.data?.name;
                        const component = node.depth === 2 ? node.data?.name : null;
                        
                        // If clicking on already selected component, deselect it
                        if (activeIndex && node.depth === 2 && node.data?.name === activeIndex) {
                            onClick({ area: '', component: null });
                            return;
                        }
                        
                        if (area) {
                            onClick({ area, component });
                        }
                    }
                });
        },
        [activeIndex, onClick],
    );

    useEffect(() => {
        setData(d);
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
            .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1) + 0.5)
            .call(attachTooltipBehavior);

        const nodesUpdate = nodes.merge(nodesEnter);

        nodesUpdate.select('.overlay-rect').style('pointer-events', 'all');

        const updateBaseRectStyles = (selection: d3.Selection<any, any, any, any>) => {
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

        const addHoverBehavior = (selection: d3.Selection<any, any, any, any>) => {
            selection
                .on('mouseover', function(event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) {
                    if (node.data?.name && node.data.name.includes('Root')) {
                        return;
                    }

                    // Skip hover effect for selected nodes
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return;
                    }

                    const baseRect = d3.select(this.parentNode).select('.base-rect');
                    baseRect.style('stroke', 'white').style('stroke-width', 2);
                })
                .on('mouseout', function(event: MouseEvent, node: d3.HierarchyNode<TreemapNode>) {
                    if (node.data?.name && node.data.name.includes('Root')) {
                        return;
                    }

                    const baseRect = d3.select(this.parentNode).select('.base-rect');
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
            .on('end', function(this: ElementWithTippy) {
                const selection = d3.select(this);
                selection.call(addHoverBehavior);
            });

        nodesUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`)
            .style('opacity', 1)
            .on('end', () => {
                nodesUpdate.select('.overlay-rect').style('pointer-events', 'all');
                nodesUpdate.select('.overlay-rect').each(() => {
                    d3.select(this).call(attachTooltipBehavior);
                });
            });

        const addLabelContent = (
            selection: d3.Selection<d3.BaseType, d3.HierarchyNode<TreemapNode>, null, undefined>,
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

            resizedNodesUpdate.select('.overlay-rect').style('pointer-events', 'all');

            resizedNodesUpdate
                .transition()
                .duration(TRANSITION_DURATION)
                .attr('transform', (node: d3.HierarchyNode<TreemapNode>) => `translate(${node.x0},${node.y0})`)
                .style('opacity', 1)
                .on('end', () => {
                    resizedNodesUpdate.select('.overlay-rect').style('pointer-events', 'all');
                    resizedNodesUpdate.select('.overlay-rect').each(() => {
                        d3.select(this).call(attachTooltipBehavior);
                    });
                });

            resizedNodesUpdate
                .select('.base-rect')
                .transition()
                .duration(TRANSITION_DURATION)
                .attr('x', 0.5)
                .attr('y', 0.5)
                .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0) + 1)
                .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0) + 1)
                .call(updateBaseRectStyles);

            resizedNodesUpdate
                .select('.overlay-rect')
                .transition()
                .duration(TRANSITION_DURATION)
                .attr('x', 0.5)
                .attr('y', 0.5)
                .attr('width', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.x1 - node.x0 - 1))
                .attr('height', (node: d3.HierarchyNode<TreemapNode>) => Math.max(0, node.y1 - node.y0 - 1))
                .on('end', function(this: ElementWithTippy) {
                    const selection = d3.select(this);
                    // Destroy existing tippy instance if it exists
                    if (this._tippy) {
                        this._tippy.destroy();
                    }
                    selection.call(addHoverBehavior);
                    
                    // Re-create tippy instance
                    const node = d3.select(this).datum() as d3.HierarchyNode<TreemapNode>;
                    if (!node.data?.name || !node.data.name.includes('Root')) {
                        tippy(this, {
                            content: createTooltipContent(node),
                            theme: 'light-border',
                            arrow: false,
                            offset: [0, 10],
                            placement: 'right',
                            animation: 'fade',
                            duration: 200,
                            appendTo: () => document.body,
                            onShow: (instance) => {
                                const currentNode = d3.select(this).datum() as d3.HierarchyNode<TreemapNode>;
                                instance.setContent(createTooltipContent(currentNode));
                            }
                        });
                    }
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
        };

        window.addEventListener('resize', handleResize);

        // eslint-disable-next-line consistent-return
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [data, activeIndex, attachTooltipBehavior, endAll, height]);

    return (
        <div className={_cs(styles.container, className)}>
            <svg
                ref={svgRef}
                height={height}
            />
        </div>
    );
}

export default PERTreemapChart;
