import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type DocumentType } from '#generated/gql';

import {
    type AdminArea,
    parseNumber,
} from '../utils';
import { type ARC_OBSERVATIONS_QUERY } from './queries';

type ObservationsResult = DocumentType<typeof ARC_OBSERVATIONS_QUERY>;
type ObservationRow = ObservationsResult['arcRainfallObservations']['results'][number];

export interface ArcObservation {
    id: string;
    observationDate: string;
    pcode: string;
    name: string;
    impact: number | undefined;
    eventRp: number | undefined;
    cellTrigger: boolean;
}

export interface ArcDistrictEvent {
    // The pcode is the only key shared with GO admin areas and HDX data
    id: string;
    name: string;
    adminArea: AdminArea | undefined;
    observation: ArcObservation;
}

export function toObservations(rows: ObservationRow[] | undefined): ArcObservation[] {
    return rows?.map((row) => ({
        id: row.id,
        observationDate: row.observationDate,
        pcode: row.adminArea.pcode,
        name: row.adminArea.name,
        impact: parseNumber(row.impact),
        eventRp: row.eventRp ?? undefined,
        cellTrigger: row.cellTrigger,
    })) ?? [];
}

export function getObservationDates(observations: ArcObservation[]) {
    return [...new Set(observations.map((observation) => observation.observationDate))]
        .sort((a, b) => b.localeCompare(a));
}

// Triggered districts stay listed even when the modelled impact is zero
export function getDistrictEvents(
    observations: ArcObservation[],
    date: string | undefined,
    adminAreaByCode: Record<string, AdminArea | undefined>,
): ArcDistrictEvent[] {
    return observations
        .filter((observation) => (
            observation.observationDate === date
            && (observation.cellTrigger || (observation.impact ?? 0) > 0)
        ))
        .sort((a, b) => (b.impact ?? 0) - (a.impact ?? 0))
        .map((observation) => ({
            id: observation.pcode,
            name: observation.name,
            adminArea: adminAreaByCode[observation.pcode],
            observation,
        }));
}

export function getTriggeredDistrictCount(
    observations: ArcObservation[],
    date: string | undefined,
) {
    return observations
        .filter((observation) => observation.observationDate === date && observation.cellTrigger)
        .length;
}

// The national return period is the highest district return period on the date
export function getNationalReturnPeriod(observations: ArcObservation[], date: string | undefined) {
    const returnPeriods = observations
        .filter((observation) => observation.observationDate === date)
        .map((observation) => observation.eventRp)
        .filter(isDefined);
    if (returnPeriods.length === 0) {
        return undefined;
    }
    return Math.max(...returnPeriods);
}

// The active date per district, plus every date so map classes stay stable
export function getImpactValues(observations: ArcObservation[], date: string | undefined) {
    const valueByPcode: Record<string, number> = {};
    const allValues: number[] = [];

    observations.forEach((observation) => {
        if (isNotDefined(observation.impact)) {
            return;
        }
        allValues.push(observation.impact);
        if (observation.observationDate === date) {
            valueByPcode[observation.pcode] = observation.impact;
        }
    });

    return { valueByPcode, allValues };
}
