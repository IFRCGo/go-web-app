import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type DocumentType } from '#generated/gql';

import { type AdminArea } from '../utils';
import { type JBA_FORECAST_IMPACTS_QUERY } from './queries';

type ImpactsResult = DocumentType<typeof JBA_FORECAST_IMPACTS_QUERY>;
type ImpactRow = ImpactsResult['floodForecastImpacts']['results'][number];

export interface JbaForecastRow {
    id: string;
    forecastIssueDate: string;
    forecastTargetDate: string;
    leadTimeDays: number;
    mean: number | undefined;
    median: number | undefined;
    p75: number | undefined;
    p90: number | undefined;
    max: number | undefined;
    ensemblesNonzeroCount: number | undefined;
}

export interface JbaDistrictEvent {
    // The pcode is the only key shared with GO admin areas and HDX data
    id: string;
    name: string;
    adminArea: AdminArea | undefined;
    rows: JbaForecastRow[];
    activeRow: JbaForecastRow;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toNumber(value: string | null | undefined) {
    if (isNotDefined(value)) {
        return undefined;
    }
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? undefined : numericValue;
}

function toForecastRow(row: ImpactRow): JbaForecastRow {
    const issueDate = new Date(row.forecastIssueDate);
    const targetDate = new Date(row.forecastTargetDate);

    return {
        id: row.id,
        forecastIssueDate: row.forecastIssueDate,
        forecastTargetDate: row.forecastTargetDate,
        leadTimeDays: Math.round((targetDate.getTime() - issueDate.getTime()) / DAY_IN_MS),
        mean: toNumber(row.band5Mean),
        median: toNumber(row.band5Median),
        p75: toNumber(row.band5P75),
        p90: toNumber(row.band5P90),
        max: toNumber(row.band5Max),
        ensemblesNonzeroCount: row.ensemblesNonzeroCount ?? undefined,
    };
}

// The statistic shown to users; MRCS still has to pick between the ensemble percentiles
export function impactSelector(row: JbaForecastRow) {
    return row.median;
}

export function groupRowsByDistrict(rows: ImpactRow[] | undefined) {
    const districts = new Map<string, Omit<JbaDistrictEvent, 'activeRow' | 'adminArea'>>();

    rows?.forEach((row) => {
        const { pcode } = row.adminArea;
        const district = districts.get(pcode) ?? {
            id: pcode,
            name: row.adminArea.name,
            rows: [],
        };
        district.rows.push(toForecastRow(row));
        districts.set(pcode, district);
    });

    districts.forEach((district) => {
        district.rows.sort((a, b) => a.leadTimeDays - b.leadTimeDays);
    });

    return districts;
}

export interface JbaForecastDay {
    leadTimeDays: number;
    targetDate: string;
    populationImpacted: number;
}

export function getForecastDays(districts: ReturnType<typeof groupRowsByDistrict>) {
    const days = new Map<number, JbaForecastDay>();

    districts.forEach((district) => {
        district.rows.forEach((row) => {
            const day = days.get(row.leadTimeDays) ?? {
                leadTimeDays: row.leadTimeDays,
                targetDate: row.forecastTargetDate,
                populationImpacted: 0,
            };
            day.populationImpacted += impactSelector(row) ?? 0;
            days.set(row.leadTimeDays, day);
        });
    });

    return [...days.values()].sort((a, b) => a.leadTimeDays - b.leadTimeDays);
}

export function getDistrictEvents(
    districts: ReturnType<typeof groupRowsByDistrict>,
    adminAreaByCode: Record<string, AdminArea | undefined>,
    leadTimeDays: number,
    threshold: number,
): JbaDistrictEvent[] {
    return [...districts.values()]
        .map((district) => {
            const activeRow = district.rows.find((row) => row.leadTimeDays === leadTimeDays);
            const impact = activeRow ? impactSelector(activeRow) : undefined;
            if (isNotDefined(activeRow) || isNotDefined(impact) || impact < threshold) {
                return undefined;
            }
            return {
                ...district,
                activeRow,
                adminArea: adminAreaByCode[district.id],
            };
        })
        .filter(isDefined)
        .sort((a, b) => (
            (impactSelector(b.activeRow) ?? 0) - (impactSelector(a.activeRow) ?? 0)
        ));
}

export interface JbaImpactBin {
    min: number;
    max: number;
    color: string;
}

// Classes span the whole run so colours stay comparable across forecast days
export function getImpactBins(
    districts: ReturnType<typeof groupRowsByDistrict>,
    colors: string[],
): JbaImpactBin[] {
    const values = [...districts.values()]
        .flatMap((district) => district.rows.map(impactSelector))
        .filter((value): value is number => isDefined(value) && value > 0)
        .sort((a, b) => a - b);

    if (values.length === 0) {
        return [];
    }

    const quantile = (fraction: number) => (
        values[Math.min(Math.floor(values.length * fraction), values.length - 1)]
    );
    const breaks = [...new Set(
        colors.map((_, index) => quantile((index + 1) / colors.length)).filter(isDefined),
    )];
    const lastColorIndex = colors.length - 1;
    const lastBreakIndex = Math.max(breaks.length - 1, 1);

    return breaks.map((max, index) => ({
        min: index === 0 ? values[0]! : breaks[index - 1]!,
        max,
        color: colors[Math.round((index * lastColorIndex) / lastBreakIndex)]!,
    }));
}

export function getImpactColorByPcode(
    districts: ReturnType<typeof groupRowsByDistrict>,
    leadTimeDays: number,
    bins: JbaImpactBin[],
) {
    const colorByPcode: Record<string, string> = {};
    districts.forEach((district) => {
        const row = district.rows.find((item) => item.leadTimeDays === leadTimeDays);
        const impact = row ? impactSelector(row) : undefined;
        if (isNotDefined(impact) || impact <= 0) {
            return;
        }
        const bin = bins.find((item) => impact <= item.max) ?? bins[bins.length - 1];
        if (bin) {
            colorByPcode[district.id] = bin.color;
        }
    });
    return colorByPcode;
}
