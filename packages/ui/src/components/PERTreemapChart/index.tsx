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
import tippy, {
    Instance as TippyInstance,
    Props as TippyProps,
} from 'tippy.js';

import useSizeTracking from '#hooks/useSizeTracking';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface TreemapNode {
    id: string;
    value?: number;
    name: string;
    parent?: string;
    children?: TreemapNode[];
    data?: {
        name: string;
        value: number; // Update: Made value field required when data is present
        color: string;
    };
    color: string;
    area?: string;
    component?: string | null;
}

interface ExtendedHierarchyNode extends d3.HierarchyNode<TreemapNode> {
    x0?: number;
    x1?: number;
    y0?: number;
    y1?: number;
}

export interface Props {
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
    SVGGElement,
    d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
    d3.BaseType,
    undefined
>;

function isSelectableNode(node: d3.HierarchyNode<TreemapNode>) {
    return (node.depth === 1 || node.depth === 2)
        && !!node.data?.name
        && !node.data.name.includes('Root');
}

function createTooltipContent(
    node: d3.HierarchyNode<TreemapNode>,
): HTMLElement | null {
    if (!node?.data?.name || node.data.name.includes('Root')) {
        return null;
    }

    const tooltipContent = document.createElement('div');
    tooltipContent.className = styles.tooltipContent;

    const title = document.createElement('div');
    title.className = styles.tooltipTitle;
    title.textContent = node.data.name;
    tooltipContent.appendChild(title);

    if (node.parent?.data?.name) {
        const tag = document.createElement('div');
        tag.className = styles.tooltipTag;
        tag.textContent = node.parent.data.name;
        tag.style.backgroundColor = node.parent.data?.color || 'var(--go-ui-color-background)';
        tooltipContent.appendChild(tag);
    }

    if (node.depth === 2 && typeof node.data.value === 'number') {
        const value = document.createElement('div');
        value.className = styles.tooltipValue;
        value.textContent = `${node.data.value} NS`;
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
    const strings = useTranslation(i18n);
    const svgRef = useRef<SVGSVGElement>(null);
    const isAnimatingRef = useRef(false);
    const tooltipTimeoutRef = useRef<number | undefined>(undefined);
    const [data, setData] = useState<TreemapNode>();
    const { width: svgWidth } = useSizeTracking(svgRef);

    // NOTE: The parent passes new handlers on every render. Reading them from refs keeps
    // the D3 drawing (and its transitions and tooltips) from being rebuilt each time.
    const onClickRef = useRef(onClick);
    const onHoverRef = useRef(onHover);
    useEffect(() => {
        onClickRef.current = onClick;
        onHoverRef.current = onHover;
    }, [onClick, onHover]);

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
        <T extends d3.BaseType, U>(
            transition: d3.Transition<T, U, HTMLElement, unknown>,
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
            const selectNode = (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                if (!onClickRef.current || !node.data) {
                    return;
                }

                const area = node.depth === 2 ? node.parent?.data?.name : node.data.name;
                const component = node.depth === 2 ? node.data.name : null;

                // If clicking on already selected component, deselect it
                if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                    onClickRef.current({ area: '', component: null });
                    return;
                }

                if (area) {
                    onClickRef.current({ area, component });
                }
            };

            selection
                .style('fill', 'transparent')
                .style('cursor', 'pointer')
                .style('pointer-events', 'all')
                .each(function tooltipHandler(
                    node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                ) {
                    const element = d3.select(this).node() as unknown as HTMLElementWithTippy;
                    if (element._tippy) {
                        element._tippy.destroy();
                    }
                    if (!node.data?.name || node.data.name.includes('Root')) {
                        return;
                    }
                    const elementToUse = d3.select(this).node() as HTMLElement | null;
                    if (elementToUse) {
                        tippy(elementToUse, {
                            content: createTooltipContent(node),
                            theme: 'light-border',
                            arrow: true,
                            offset: [0, 10],
                            placement: 'right',
                            animation: 'fade',
                            duration: 300,
                            appendTo: () => document.body,
                            onShow: (instance: TippyInstance) => {
                                if (isAnimatingRef.current) {
                                    instance.hide();
                                    return false;
                                }
                                const currentNode = d3.select(this).datum() as
                                    d3.HierarchyNode<TreemapNode> &
                                    ExtendedHierarchyNode;
                                if (currentNode?.data?.name
                                    && currentNode?.data?.value !== undefined
                                    && currentNode?.data?.color) {
                                    const tooltipContent = createTooltipContent(
                                        currentNode,
                                    );
                                    if (tooltipContent) {
                                        instance.setContent(tooltipContent);
                                    }
                                    if (currentNode.data?.name
                                        && currentNode.data?.value !== undefined
                                        && currentNode.data?.color) {
                                        onHoverRef.current?.({
                                            name: currentNode.data.name,
                                            value: currentNode.data.value,
                                            color: currentNode.data.color,
                                        } as TreemapNode['data']);
                                    }
                                }
                                return true;
                            },
                            onHide: () => {
                                onHoverRef.current?.(undefined);
                            },
                        } as unknown as TippyProps);
                    }
                })
                .attr('tabindex', (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => (
                    isSelectableNode(node) ? 0 : null
                ))
                .attr('role', (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => (
                    isSelectableNode(node) ? 'button' : null
                ))
                .attr('aria-pressed', (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (node.depth !== 2) {
                        return null;
                    }
                    return String(!!activeIndex && node.data.name === activeIndex);
                })
                .on('click', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (event) {
                        selectNode(node);
                    }
                })
                .on('keydown', (event: KeyboardEvent, node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectNode(node);
                    }
                })
                .attr('aria-label', (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (node.depth === 1) {
                        return node.data.name;
                    }
                    if (node.depth === 2 && node.data?.name && node.data?.value !== undefined) {
                        const label = resolveToString(
                            strings.treemapComponentLabel,
                            { name: node.data.name, value: `${node.data.value} NS` },
                        );

                        if (activeIndex && node.data.name === activeIndex) {
                            return resolveToString(
                                strings.treemapSelectedLabel,
                                { name: node.data.name },
                            );
                        }
                        return label;
                    }
                    return '';
                })
                .on('mouseover', (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (node.data) {
                        onHoverRef.current?.({
                            name: node.data.name,
                            value: node.data.value,
                            color: node.data.color,
                        } as TreemapNode['data']);
                    }
                })
                .on('mouseout', () => {
                    onHoverRef.current?.(undefined);
                });
        },
        [activeIndex, strings],
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
        if (!data || !svgRef.current || svgWidth === 0) return;

        const svgElement = d3.select(svgRef.current);
        const width = svgWidth - PADDING * 2;
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

        d3.treemap<TreemapNode>()
            .size([width, svgHeight])
            .paddingInner(1)
            .paddingOuter(0)
            .round(true)(root);

        const nodes = layer1
            .selectAll<SVGGElement, d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode>('g')
            .data(
                root.descendants() as (d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode)[],
                (node) => node.data.name,
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
            .attr('transform', (node: ExtendedHierarchyNode) => `translate(${node.x0},${node.y0})`);

        nodesEnter
            .append('rect')
            .attr('class', 'base-rect')
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: ExtendedHierarchyNode) => {
                if (node.x0 === undefined || node.x1 === undefined) return 0;
                return Math.max(0, node.x1 - node.x0) + 1;
            })
            .attr('height', (node: ExtendedHierarchyNode) => {
                if (node.y0 === undefined || node.y1 === undefined) return 0;
                return Math.max(0, node.y1 - node.y0) + 1;
            });

        nodesEnter
            .append('rect')
            .attr('class', 'overlay-rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', (node: ExtendedHierarchyNode) => Math.max(0, node.x1! - node.x0! - 1) + 0.5)
            .attr('height', (node: ExtendedHierarchyNode) => Math.max(0, node.y1! - node.y0! - 1) + 0.5);

        const nodesUpdate = nodes.merge(nodesEnter);

        nodesUpdate.select('.overlay-rect')
            .style('pointer-events', 'all')
            .call((selection) => attachTooltipBehavior(
                selection as unknown as D3TreemapSelection,
            ));

        const updateBaseRectStyles = (
            selection: d3.Selection<
                SVGRectElement,
                d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                null,
                undefined
            > | d3.Transition<
                SVGRectElement,
                d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                SVGElement,
                unknown
            >,
        ) => {
            selection
                .style(
                    'fill',
                    (node) => (
                        node.data.color || (node.parent ? node.parent.data.color : 'var(--go-ui-color-background)')
                    ),
                )
                .style('stroke', (node) => {
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return '#00C2FF';
                    }
                    return '#fff';
                })
                .style('stroke-width', (node) => {
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return 3;
                    }
                    return 0.5;
                });
        };

        const addHoverBehavior = (
            selection: d3.Selection<
                SVGGElement,
                d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                SVGGElement | null,
                undefined
            >,
        ) => {
            selection
                .on('mouseover', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (node.data?.name && node.data.name.includes('Root')) {
                        return;
                    }

                    // Skip hover effect for selected nodes
                    if (activeIndex && node.depth === 2 && node.data.name === activeIndex) {
                        return;
                    }

                    const element = event.currentTarget as SVGElement;
                    const baseRect = d3
                        .select(element.parentNode as Element)
                        .select<SVGRectElement>('.base-rect')
                        .datum(node); // Explicitly set the datum to maintain type information
                    baseRect.style('stroke', 'white').style('stroke-width', 2);
                })
                .on('mouseout', (event: MouseEvent, node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => {
                    if (node.data?.name && node.data.name.includes('Root')) {
                        return;
                    }

                    const element = event.currentTarget as SVGElement;
                    const baseRect = d3
                        .select(element.parentNode as Element)
                        .select<SVGRectElement>('.base-rect')
                        .datum(node);// Explicitly set the datum to maintain type information
                    updateBaseRectStyles(baseRect);
                });
        };

        nodesUpdate
            .select('.base-rect')
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: ExtendedHierarchyNode) => {
                if (node.x0 === undefined || node.x1 === undefined) return 0;
                return Math.max(0, node.x1 - node.x0) + 1;
            })
            .attr('height', (node: ExtendedHierarchyNode) => {
                if (node.y0 === undefined || node.y1 === undefined) return 0;
                return Math.max(0, node.y1 - node.y0) + 1;
            })
            .call((selection) => updateBaseRectStyles(
                (selection as unknown) as d3.Selection<
                    SVGRectElement,
                    d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                    null,
                    undefined
                >,
            ))
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: ExtendedHierarchyNode) => {
                if (node.x0 === undefined || node.x1 === undefined) return 0;
                return Math.max(0, node.x1 - node.x0) + 1;
            })
            .attr('height', (node: ExtendedHierarchyNode) => {
                if (node.y0 === undefined || node.y1 === undefined) return 0;
                return Math.max(0, node.y1 - node.y0) + 1;
            });

        nodesUpdate
            .select('.overlay-rect')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('x', 0.5)
            .attr('y', 0.5)
            .attr('width', (node: ExtendedHierarchyNode) => Math.max(0, node.x1! - node.x0! - 1))
            .attr('height', (node: ExtendedHierarchyNode) => Math.max(0, node.y1! - node.y0! - 1))
            .on('start', () => {
                isAnimatingRef.current = true;
                hideAllTooltips();
                nodesUpdate.select('.overlay-rect').style('pointer-events', 'none');
            })
            .on('end', function endUpdate() {
                const selection = d3.select(this);
                (selection as unknown as d3.Selection<
                    SVGGElement,
                    d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                    SVGGElement | null,
                    undefined
                >).call(addHoverBehavior);
                isAnimatingRef.current = false;
            });

        nodesUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr(
                'transform',
                (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => `translate(${node.x0},${node.y0})`,
            )
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
                .filter(
                    // eslint-disable-next-line max-len
                    (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => node.depth === 1,
                )
                .each(
                    (
                        node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                        i: number,
                        groups: SVGGElement[] | ArrayLike<SVGGElement>,
                    ) => {
                        const rect = groups[i] as SVGRectElement | null;
                        if (
                            typeof node.x0 === 'number'
                            && typeof node.x1 === 'number'
                            && typeof node.y0 === 'number'
                            && typeof node.y1 === 'number'
                        ) {
                            const rectWidth = node.x1 - node.x0 - 1;
                            const rectHeight = node.y1 - node.y0 - 1;

                            if (
                                rectWidth >= MIN_WIDTH_FOR_LABEL
                                && rectHeight >= MIN_HEIGHT_FOR_LABEL
                            ) {
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
                                        .attr('class', styles.parentLabel)
                                        // NOTE: names are admin-managed, so they are set as text
                                        .text(truncateText(
                                            node.data.name,
                                            PARENT_LABEL_MAX_LENGTH,
                                        ));
                                }
                            }
                        }
                    },
                );

            // Add child labels
            selection
                // eslint-disable-next-line max-len
                .filter((node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => node.depth === 2)
                .each(
                    (
                        node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                        i: number,
                        groups: SVGGElement[] | ArrayLike<SVGGElement>,
                    ) => {
                        const rect = groups[i] as SVGRectElement;
                        if (
                            typeof node.x0 === 'number'
                            && typeof node.x1 === 'number'
                            && typeof node.y0 === 'number'
                            && typeof node.y1 === 'number'
                        ) {
                            const rectWidth = node.x1 - node.x0 - 1;
                            const rectHeight = node.y1 - node.y0 - 1;

                            if (
                                rectWidth >= MIN_WIDTH_FOR_LABEL
                                && rectHeight >= MIN_HEIGHT_FOR_LABEL
                            ) {
                                const label = d3.select(rect)
                                    .append('foreignObject')
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('width', rectWidth)
                                    .attr('height', rectHeight)
                                    .style('pointer-events', 'none')
                                    .append('xhtml:div')
                                    .attr('class', styles.childLabel);
                                // NOTE: names are admin-managed, so they are set as text
                                label.append('xhtml:div')
                                    .attr('class', styles.childLabelName)
                                    .text(truncateText(node.data.name, CHILD_LABEL_MAX_LENGTH));
                                label.append('xhtml:div')
                                    .attr('class', styles.childLabelValue)
                                    .text(`${node.data.value} `)
                                    .append('xhtml:span')
                                    .attr('class', styles.childLabelUnit)
                                    .text('NS');
                            }
                        }
                    },
                );
        };

        // Update labels with transition
        const labels = layer2
            .selectAll<SVGGElement, d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode>('g')
            // eslint-disable-next-line max-len
            .data(root.descendants() as (d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode)[], (node) => node.data.name);

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
            .attr(
                'transform',
                (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => `translate(${node.x0},${node.y0})`,
            );

        // Merge and transition both new and existing labels
        const labelsUpdate = labels.merge(labelsEnter);

        // Fade out labels and move to new positions
        labelsUpdate
            .transition()
            .duration(TRANSITION_DURATION / 2)
            .style('opacity', 0)
            .attr(
                'transform',
                (node: d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode) => `translate(${node.x0},${node.y0})`,
            )
            .call((transition: d3.Transition<
                SVGGElement,
                d3.HierarchyNode<TreemapNode> & ExtendedHierarchyNode,
                d3.BaseType,
                unknown
            >) => {
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
        svgWidth,
        enableTooltips,
        hideAllTooltips,
    ]);

    return (
        <div
            className={_cs(styles.container, className)}
            aria-label={strings.treemapContainerLabel}
        >
            <svg
                ref={svgRef}
                className={styles.chart}
                aria-label={strings.treemapChartLabel}
                height={height}
            />
        </div>
    );
}

export default PERTreemapChart;
