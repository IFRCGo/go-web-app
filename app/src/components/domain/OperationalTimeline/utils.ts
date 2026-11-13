import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    type PhaseKey,
    PHASES,
    type TimelineBar,
} from './types';

export function getPhaseIndex(phase: PhaseKey): number {
    return PHASES.indexOf(phase);
}

export interface PositionedBar extends TimelineBar {
    startIndex: number;
    endIndex: number;
    lane: number;
}

/**
 * Greedy lane packing: each bar is placed in the first lane where it does not
 * overlap an already-placed bar. Two bars overlap when their inclusive phase
 * ranges intersect; a lane is free for a new bar when the last bar in that lane
 * ends strictly before the new bar starts. Bars with an explicit `lane` keep
 * it (manual override). Returns the positioned bars and the total lane count
 * so the caller can size the group's bar area.
 */
export function packLanes(bars: TimelineBar[]): {
    positioned: PositionedBar[];
    laneCount: number;
} {
    const sorted = bars
        .map((bar) => ({
            ...bar,
            startIndex: getPhaseIndex(bar.startPhase),
            endIndex: getPhaseIndex(bar.endPhase),
        }))
        .sort((a, b) => (a.startIndex - b.startIndex) || (a.endIndex - b.endIndex));

    // laneEnds[l] holds the endIndex of the last bar placed in lane l.
    const laneEnds: number[] = [];

    const positioned = sorted.map((bar): PositionedBar => {
        if (isDefined(bar.lane)) {
            laneEnds[bar.lane] = Math.max(
                laneEnds[bar.lane] ?? Number.NEGATIVE_INFINITY,
                bar.endIndex,
            );
            return { ...bar, lane: bar.lane };
        }

        let lane = laneEnds.findIndex((end) => end < bar.startIndex);
        if (lane === -1) {
            lane = laneEnds.length;
        }
        laneEnds[lane] = bar.endIndex;
        return { ...bar, lane };
    });

    return {
        positioned,
        laneCount: Math.max(1, laneEnds.length),
    };
}

export interface Connector {
    /** Lane (0-based, always >= 1) the connector routes down to. */
    targetLane: number;
    /** Phase index of the target bar's start, i.e. where the branch ends. */
    targetStartIndex: number;
}

/**
 * Derives the pre-crisis connectors drawn in the design: a dotted red spine
 * drops from the sector's pre-disaster preparedness bar (the lane-0 anchor) and
 * branches to the first bar of each lower lane. Only bars that start at Week 2
 * or later get a branch, since a bar already flush against the anchor line
 * (Week 1) has no horizontal segment to draw. Sectors without a pre-disaster
 * bar have no anchor and therefore no connectors.
 */
export function computeConnectors(
    positioned: PositionedBar[],
    laneCount: number,
): Connector[] {
    const anchor = positioned.find((bar) => bar.startPhase === 'pre_disaster');
    if (isNotDefined(anchor) || anchor.lane !== 0) {
        return [];
    }

    const connectors: Connector[] = [];
    for (let lane = 1; lane < laneCount; lane += 1) {
        const laneBars = positioned.filter((bar) => bar.lane === lane);
        const first = laneBars.reduce<PositionedBar | undefined>(
            (acc, bar) => (isNotDefined(acc) || bar.startIndex < acc.startIndex ? bar : acc),
            undefined,
        );
        // getPhaseIndex('w2') === 2 — the first response column past the anchor line.
        if (isDefined(first) && first.startIndex >= 2) {
            connectors.push({ targetLane: lane, targetStartIndex: first.startIndex });
        }
    }

    return connectors;
}
