import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { _cs } from '@togglecorp/fujs';

import type { Props, TreemapNode } from './types';
import styles from './styles.module.css';

interface Props {
  d: TreemapNode;
  onClick?: (item: { area: string; component: string | null }) => void;
  activeIndex?: string | number | null;
  activeField?: string;
  className?: string;
  height?: number;
}

function PERTreemapChart({
  d,
  onClick,
  activeField = 'name',
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

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    setData(d);
  }, [d]);

  const getCumulativeScaleFactor = (
    element: Element | null
  ): { scaleX: number; scaleY: number } => {
    let el = element;
    let scaleX = 1;
    let scaleY = 1;
    while (el && el !== document.body && el !== null) {
      const transform = window.getComputedStyle(el).transform;
      if (transform && transform !== 'none') {
        const match = transform.match(/matrix\(([^)]+)\)/);
        if (match) {
          const values = match[1].split(', ');
          const a = parseFloat(values[0]);
          const d = parseFloat(values[3]);
          scaleX *= a;
          scaleY *= d;
        } else {
          const match3d = transform.match(/matrix3d\(([^)]+)\)/);
          if (match3d) {
            const values = match3d[1].split(', ');
            const a = parseFloat(values[0]);
            const d = parseFloat(values[5]);
            scaleX *= a;
            scaleY *= d;
          }
        }
      }
      el = el.parentElement;
    }
    return { scaleX, scaleY };
  };

  useEffect(() => {
    if (!data || !svgRef.current || !tooltipRef.current) return;

    const svgElement = d3.select(svgRef.current);
    const width = (svgRef.current.clientWidth || 0) - PADDING * 2;
    const svgHeight = height - PADDING * 2;

    const tooltip = d3.select(tooltipRef.current);

    const showTooltip = (event: MouseEvent, d: TreemapNode) => {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { clientX, clientY } = event;
      const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 0;
      
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
        <div class="${styles.tooltipTitle}">${d.data?.name || ''}</div>
        <div class="${styles.tooltipTag}" style="background-color: ${d.parent?.data?.color || '#ccc'}">${d.parent?.data?.name || ''}</div>
        ${d.depth === 2 && d.data ? `<div class="${styles.tooltipValue}">${d.data.value}</div>` : ''}
      `;

      tooltip
        .style('visibility', 'visible')
        .style('opacity', '1')
        .style('position', 'fixed')
        .html(tooltipContent)
        .style('left', `${leftPos}px`)
        .style('top', `${topPos}px`);
    };

    const moveTooltip = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 0;
      
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

      tooltip
        .style('left', `${leftPos}px`)
        .style('top', `${topPos}px`);
    };

    const hideTooltip = () => {
      tooltip
        .style('visibility', 'hidden')
        .style('opacity', '0');
    };

    const attachTooltipBehavior = (selection: any) => {
      selection
        .style('fill', 'transparent')
        .style('cursor', 'pointer')
        .style('pointer-events', 'all')
        .on(
          'mouseover',
          function (this: SVGRectElement, event: MouseEvent, d: any) {
            if (d.data.name && d.data.name.includes('Root')) {
              return;
            }

            const baseRect = d3
              .select(this.parentNode as Element)
              .select('.base-rect');
            if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
              baseRect.style('stroke', '#00C2FF').style('stroke-width', 3);
            } else {
              baseRect.style('stroke', 'white').style('stroke-width', 2);
            }
            showTooltip(event, d);
          }
        )
        .on('mousemove', moveTooltip)
        .on('mouseout', function (this: SVGRectElement) {
          const baseRect = d3
            .select(this.parentNode as Element)
            .select('.base-rect');
          if (
            activeIndex &&
            (this as any).__data__.depth === 2 &&
            (this as any).__data__.data.name === activeIndex
          ) {
            baseRect.style('stroke', '#00C2FF').style('stroke-width', 3);
          } else {
            baseRect.style('stroke', '#fff').style('stroke-width', 1);
          }
          hideTooltip();
        })
        .on('click', function (event: MouseEvent, d: any) {
          hideTooltip();
          if (onClick && event) {
            const area = d.depth === 2 ? d.parent.data.name : d.data.name;
            const component = d.depth === 2 ? d.data.name : null;
            onClick({ area, component });
          }
        });
    };

    function endAll(transition: any, callback: () => void) {
      let n = 0;
      transition
        .each(() => ++n)
        .on('end', () => {
          if (!--n) callback();
        });
    }

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

    const root = d3
      .hierarchy(data)
      .sum((d: TreemapNode) => d.value || 0)
      .sort((a: any, b: any) => b.value - a.value);

    d3.treemap()
      .size([width, svgHeight])
      .paddingInner(1)
      .paddingOuter(0)
      .round(true)(root);

    const nodes = layer1
      .selectAll<SVGGElement, unknown>('g')
      .data(root.descendants(), (d: any) => d.data.name);

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
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    nodesEnter
      .append('rect')
      .attr('class', 'base-rect')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0 - 1))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0 - 1))
      .style(
        'fill',
        (d: any) => d.data.color || (d.parent ? d.parent.data.color : '#ccc')
      )
      .style('stroke', (d: any) => {
        if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
          return '#00C2FF';
        } else {
          return '#fff';
        }
      })
      .style('stroke-width', (d: any) => {
        if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
          return 3;
        } else {
          return 1;
        }
      });

    nodesEnter
      .append('rect')
      .attr('class', 'overlay-rect')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0 - 1))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0 - 1))
      .call(attachTooltipBehavior);

    const nodesUpdate = nodes.merge(nodesEnter);

    nodesUpdate.select('.overlay-rect').style('pointer-events', 'none');

    nodesUpdate
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .style('opacity', 1)
      .on('end', () => {
        nodesUpdate.select('.overlay-rect').style('pointer-events', 'all');
        nodesUpdate.select('.overlay-rect').each(function () {
          d3.select(this).call(attachTooltipBehavior);
        });
      });

    nodesUpdate
      .select('.base-rect')
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0 - 1))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0 - 1))
      .style(
        'fill',
        (d: any) => d.data.color || (d.parent ? d.parent.data.color : '#FAFAFA')
      )
      .style('stroke', (d: any) => {
        if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
          return '#00C2FF';
        } else {
          return '#fff';
        }
      })
      .style('stroke-width', (d: any) => {
        if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
          return 3;
        } else {
          return 1;
        }
      });

    nodesUpdate
      .select('.overlay-rect')
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0 - 1))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0 - 1))
      .on('end', function () {
        d3.select(this).style('pointer-events', 'all');
        d3.select(this).call(attachTooltipBehavior);
      });

    const addLabelContent = (selection: any) => {
      selection.selectAll('foreignObject').remove();

      // Add parent labels
      selection
        .filter((d: any) => d.depth === 1)
        .each(function (this: SVGRectElement | null, d: any) {
          const width = d.x1 - d.x0 - 1;
          const height = d.y1 - d.y0 - 1;

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
                .html(truncateText(d.data.name, PARENT_LABEL_MAX_LENGTH));
            }
          }
        });

      // Add child labels
      selection
        .filter((d: any) => d.depth === 2)
        .each(function (this: SVGRectElement, d: any) {
          const width = d.x1 - d.x0 - 1;
          const height = d.y1 - d.y0 - 1;

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
                  ${truncateText(d.data.name, CHILD_LABEL_MAX_LENGTH)}
                </div>
                <div style="font-size: 16px">${d.data.value}</div>`
              );
          }
        });
    };

    // Update labels with transition
    const labels = layer2
      .selectAll<SVGGElement, unknown>('g')
      .data(root.descendants(), (d: any) => d.data.name);

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
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Merge and transition both new and existing labels
    const labelsUpdate = labels.merge(labelsEnter);

    // Fade out labels and move to new positions
    labelsUpdate
      .transition()
      .duration(TRANSITION_DURATION / 2)
      .style('opacity', 0)
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
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

    // Handle window resize
    const handleResize = () => {
      if (!svgRef.current) return;

      const newWidth = (svgRef.current.clientWidth || 0) - PADDING * 2;
      const newHeight = (svgRef.current.clientHeight || 500) - PADDING * 2;

      svgElement
        .attr('width', newWidth + PADDING * 2)
        .attr('height', newHeight + PADDING * 2);

      const newRoot = d3
        .hierarchy(data)
        .sum((d: any) => d.value || 0)
        .sort((a: any, b: any) => b.value - a.value);

      d3.treemap()
        .size([newWidth, newHeight])
        .paddingInner(1)
        .paddingOuter(0)
        .round(true)(newRoot);

      const nodesUpdate = layer1
        .selectAll<SVGGElement, unknown>('g')
        .data(newRoot.descendants(), (d: any) => d.data.name);

      nodesUpdate.select('.overlay-rect').style('pointer-events', 'none');

      nodesUpdate
        .transition()
        .duration(TRANSITION_DURATION)
        .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
        .on('end', () => {
          nodesUpdate.select('.overlay-rect').style('pointer-events', 'all');
          nodesUpdate.select('.overlay-rect').each(function () {
            d3.select(this).call(attachTooltipBehavior);
          });
        });

      nodesUpdate
        .select('.base-rect')
        .transition()
        .duration(TRANSITION_DURATION)
        .attr('x', 0.5)
        .attr('y', 0.5)
        .attr('width', (d: any) => Math.max(0, d.x1 - d.x0 - 1))
        .attr('height', (d: any) => Math.max(0, d.y1 - d.y0 - 1))
        .style(
          'fill',
          (d: any) => d.data.color || (d.parent ? d.parent.data.color : '#ccc')
        )
        .style('stroke', (d: any) => {
          if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
            return '#00C2FF';
          } else {
            return '#fff';
          }
        })
        .style('stroke-width', (d: any) => {
          if (activeIndex && d.depth === 2 && d.data.name === activeIndex) {
            return 3;
          } else {
            return 1;
          }
        });

      nodesUpdate
        .select('.overlay-rect')
        .transition()
        .duration(TRANSITION_DURATION)
        .attr('x', 0.5)
        .attr('y', 0.5)
        .attr('width', (d: any) => Math.max(0, d.x1 - d.x0 - 1))
        .attr('height', (d: any) => Math.max(0, d.y1 - d.y0 - 1))
        .on('end', function () {
          d3.select(this).style('pointer-events', 'all');
          d3.select(this).call(attachTooltipBehavior);
        });

      const labelsUpdate = layer2
        .selectAll<SVGGElement, unknown>('g')
        .data(newRoot.descendants(), (d: any) => d.data.name);

      labelsUpdate
        .transition()
        .duration(TRANSITION_DURATION / 2)
        .style('opacity', 0)
        .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
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

      svg.selectAll('.overlay-rect').call(attachTooltipBehavior);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, activeIndex, onClick]);

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
