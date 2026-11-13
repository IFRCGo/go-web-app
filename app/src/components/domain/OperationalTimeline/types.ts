import { type ReactNode } from 'react';

/**
 * The timeline's time axis is a fixed, ordered set of NAMED ordinal phases
 * (not real calendar dates). Bars reference a start/end phase by key and the
 * component lays them out across equal-width columns.
 *
 * NOTE: These are indicative, context-specific timeframes meant to function as
 * a guide only (see the legacy copy in SurgeOperationalToolbox).
 */
export const PHASES = [
    'pre_disaster',
    'w1',
    'w2',
    'w3',
    'w4',
    'month_2',
    'month_3',
    'month_4',
    'month_5_12',
    'closure',
] as const;

export type PhaseKey = typeof PHASES[number];

export interface TimelineDocument {
    label: ReactNode;
    url: string;
}

export interface TimelineBar {
    id: string;
    /** Shown on the pill and as the hover-card heading. */
    label: ReactNode;
    startPhase: PhaseKey;
    endPhase: PhaseKey;
    /**
     * Optional manual lane (vertical stack position within the group's bar area).
     * When omitted, lanes are assigned automatically by greedy packing.
     */
    lane?: number;
    /** Display string shown as "Last update: ..." in the card. */
    lastUpdate?: string;
    /**
     * The linked resource exists but its folder is still empty (no content
     * yet). Such bars are rendered muted/greyed but remain clickable.
     */
    isEmpty?: boolean;
    description?: ReactNode;
    document?: TimelineDocument;
}

export interface TimelineGroup {
    id: string;
    /** Sector name shown on the collapsible group header. */
    label: ReactNode;
    /** Sector summary shown alongside the bars when the group is expanded. */
    description?: ReactNode;
    /** SharePoint root folder for the sector, opened from the header link. */
    url?: string;
    bars: TimelineBar[];
}
