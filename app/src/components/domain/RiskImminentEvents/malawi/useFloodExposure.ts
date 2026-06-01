import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { isDefined } from '@togglecorp/fujs';
import Papa from 'papaparse';
import { useQuery } from 'urql';

// Reuse the shared HdxDatasets query so urql de-duplicates the dataset-list
// fetch already issued by useHdxLayers (rather than firing a second operation).
import { HDX_DATASETS_QUERY } from '#components/domain/RiskImminentEventMap/useHdxLayers';

// HDX flood-exposure reference dataset (admin-2, keyed by ADM2_PCODE). Provides
// 1-in-100-year (RP100) flood-exposed population counts at 30 cm depth. This is
// static district-wide context — NOT matched to a specific forecast or
// observation.
const FLOOD_EXPOSURE_DATASET = 'MWI_ADM2_flood_exposure';

// RP100 exposed-population sub-groups. They overlap (e.g. a female under-15 is
// counted in several) and are therefore not additive into a total.
export interface FloodExposure {
    popU15: number | null;
    elderly: number | null;
    female: number | null;
    childrenU5: number | null;
}

// One-line RP100 district-baseline summary for field-report description
// prefills. Returns undefined when no subgroup value is available.
// Counts are rounded and joined with semicolons — a comma separator would
// collide with the thousands separator inside the numbers.
export function formatFloodExposureContext(exposure: FloodExposure): string | undefined {
    const parts = [
        isDefined(exposure.popU15) ? `under-15 ${Math.round(exposure.popU15).toLocaleString()}` : undefined,
        isDefined(exposure.elderly) ? `elderly (65+) ${Math.round(exposure.elderly).toLocaleString()}` : undefined,
        isDefined(exposure.female) ? `female ${Math.round(exposure.female).toLocaleString()}` : undefined,
        isDefined(exposure.childrenU5) ? `under-5 ${Math.round(exposure.childrenU5).toLocaleString()}` : undefined,
    ].filter(isDefined);
    if (parts.length === 0) {
        return undefined;
    }
    return `District 1-in-100-year flood-exposed population baseline (30 cm depth): ${parts.join('; ')}. Groups overlap and are not additive.`;
}

interface CsvRow {
    [column: string]: string | undefined;
}

function toNumber(value: string | undefined): number | null {
    if (value === undefined || value === '') {
        return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

// Returns a pcode → RP100 flood-exposure map parsed from the HDX CSV.
// Shared by the JBA and ARC sources (both join by adminAreaPcode).
export default function useFloodExposure(enabled: boolean): Map<string, FloodExposure> {
    const [{ data }] = useQuery({
        query: HDX_DATASETS_QUERY,
        pause: !enabled,
    });

    const hdxUrl = useMemo(
        () => data?.hdxDatasets?.results?.find(
            (r) => r.datasetName === FLOOD_EXPOSURE_DATASET,
        )?.hdxUrl ?? undefined,
        [data],
    );

    const [exposureByPcode, setExposureByPcode] = useState<Map<string, FloodExposure>>(
        () => new Map(),
    );

    useEffect(() => {
        if (!hdxUrl) {
            return undefined;
        }

        let cancelled = false;
        Papa.parse<CsvRow>(hdxUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (parseResults) => {
                if (cancelled) {
                    return;
                }
                const map = new Map<string, FloodExposure>();
                parseResults.data.forEach((row) => {
                    const pcode = row.ADM2_PCODE;
                    if (!pcode) {
                        return;
                    }
                    map.set(pcode, {
                        popU15: toNumber(row.RP100_pop_u15_30cm),
                        elderly: toNumber(row.RP100_elderly_30cm),
                        female: toNumber(row.RP100_female_pop_30cm),
                        childrenU5: toNumber(row.RP100_children_u5_30cm),
                    });
                });
                setExposureByPcode(map);
            },
            error: () => {
                if (!cancelled) {
                    setExposureByPcode(new Map());
                }
            },
        });

        return () => { cancelled = true; };
    }, [hdxUrl]);

    return exposureByPcode;
}
