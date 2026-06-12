// TODO: confirm with MRCS / JBA & ARC documentation owners.
// Placeholder values — used to filter which admin areas render a flood marker.
// Until the canonical thresholds are supplied, these are intentionally loose
// so that demo runs surface something on the map.

// Ensemble-mean population exposed (people) — the band_5 stats are people
// counts, not flood depth.
export const JBA_IMPACT_THRESHOLD = 100;
export const ARC_IMPACT_THRESHOLD = 0.5;

// JBA delivers 10 TIFFs per day (one per lead time). Lead time options for the
// user-facing RadioInput; client-side filter applied against leadTimeDays.
export const JBA_LEAD_TIME_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const JBA_DEFAULT_LEAD_TIME_DAYS = 3;

// How many recent daily ARC observations to show in the detail rainfall chart.
export const ARC_OBSERVATION_HISTORY_DAYS = 30;

// Disaster type ID matching DType "Flood" in the GO REST API.
// JBA and ARC are both flood-only sources by design.
export const DISASTER_FLOOD_ID = 12;
