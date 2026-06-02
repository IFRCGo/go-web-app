import { isDefined } from '@togglecorp/fujs';

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
 * so the caller can size the activity's row band.
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
