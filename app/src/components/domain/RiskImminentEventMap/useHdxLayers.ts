import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { isDefined } from '@togglecorp/fujs';
import Papa from 'papaparse';
import { useQuery } from 'urql';

import { graphql } from '#generated/gql';

import {
    buildHdxOptions,
    type HdxOption,
} from './hdxLayers';

const HDX_DATASETS_QUERY = graphql(`
    query HdxDatasets {
      hdxDatasets(pagination: { limit: 9999 }) {
        results {
          id
          datasetName
          hdxUrl
          fileType
        }
      }
    }
`);

interface ChoroplethBin {
    upperBound: number;
    color: string;
    label: string;
}

interface UseHdxLayersResult {
    options: HdxOption[];
    optionsPending: boolean;
    activeOption: HdxOption | undefined;
    dataPending: boolean;
    pcodeToColor: Map<string, string> | undefined;
    bins: ChoroplethBin[] | undefined;
}

interface CsvRow {
    [column: string]: string | undefined;
}

const N_BINS = 5;

function toNumber(value: string | undefined): number | undefined {
    if (value === undefined || value === '') {
        return undefined;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function computeQuantileBreakpoints(values: number[], bins: number): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const breaks: number[] = [];
    if (sorted.length === 0) {
        return breaks;
    }
    for (let i = 1; i < bins; i += 1) {
        const idx = Math.min(
            Math.floor((i / bins) * sorted.length),
            sorted.length - 1,
        );
        const v = sorted[idx];
        if (v !== undefined) {
            breaks.push(v);
        }
    }
    return breaks;
}

function formatBinLabel(value: number, format: 'number' | 'percent' | undefined): string {
    if (format === 'percent') {
        // Source values are already on a 0-100 scale (per HDX convention).
        return `${value.toFixed(0)}%`;
    }
    if (Math.abs(value) >= 1000) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function useHdxLayers(
    activeOptionKey: string | undefined,
    enabled: boolean,
): UseHdxLayersResult {
    const [{ data, fetching: optionsPending }] = useQuery({
        query: HDX_DATASETS_QUERY,
        pause: !enabled,
    });

    const results = data?.hdxDatasets?.results;

    const options = useMemo<HdxOption[]>(() => {
        if (!results) {
            return [];
        }
        const availableNames = new Set(results.map((r) => r.datasetName));
        return buildHdxOptions(availableNames);
    }, [results]);

    const activeOption = useMemo(
        () => options.find((opt) => opt.key === activeOptionKey),
        [options, activeOptionKey],
    );

    const hdxUrl = useMemo<string | undefined>(() => {
        if (!activeOption) {
            return undefined;
        }
        return results?.find(
            (r) => r.datasetName === activeOption.recipe.datasetName,
        )?.hdxUrl ?? undefined;
    }, [results, activeOption]);

    const [csvRows, setCsvRows] = useState<CsvRow[] | undefined>(undefined);
    const [dataPending, setDataPending] = useState(false);

    useEffect(() => {
        if (!hdxUrl) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCsvRows(undefined);
            setDataPending(false);
            return;
        }

        let cancelled = false;
        setDataPending(true);

        Papa.parse<CsvRow>(hdxUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (parseResults) => {
                if (cancelled) return;
                setCsvRows(parseResults.data);
                setDataPending(false);
            },
            error: () => {
                if (cancelled) return;
                setCsvRows(undefined);
                setDataPending(false);
            },
        });

        // eslint-disable-next-line consistent-return
        return () => { cancelled = true; };
    }, [hdxUrl]);

    const { pcodeToColor, bins } = useMemo<{
        pcodeToColor: Map<string, string> | undefined;
        bins: ChoroplethBin[] | undefined;
    }>(() => {
        if (!activeOption || !csvRows) {
            return { pcodeToColor: undefined, bins: undefined };
        }

        const { recipe, metric } = activeOption;
        const { joinColumn } = recipe;
        const valueColumn = metric.column;

        const pcodeValuePairs = csvRows
            .map<{ pcode: string; value: number } | undefined>((row) => {
                const pcode = row[joinColumn];
                const value = toNumber(row[valueColumn]);
                if (!pcode || value === undefined) {
                    return undefined;
                }
                return { pcode, value };
            })
            .filter(isDefined);

        if (pcodeValuePairs.length === 0) {
            return { pcodeToColor: undefined, bins: undefined };
        }

        const values = pcodeValuePairs.map(({ value }) => value);
        const breakpoints = computeQuantileBreakpoints(values, N_BINS);
        const colors = recipe.colorRamp;
        const lastColor = colors[colors.length - 1] ?? '#cccccc';

        function colorFor(value: number): string {
            for (let i = 0; i < breakpoints.length; i += 1) {
                const bp = breakpoints[i];
                const c = colors[i];
                if (bp !== undefined && c !== undefined && value < bp) {
                    return c;
                }
            }
            return lastColor;
        }

        const map = new Map<string, string>();
        pcodeValuePairs.forEach(({ pcode, value }) => {
            map.set(pcode, colorFor(value));
        });

        // Each swatch is labelled with its upper bound. The last bin's upper
        // bound is the dataset max.
        const sortedValues = [...values].sort((a, b) => a - b);
        const max = sortedValues[sortedValues.length - 1] ?? 0;

        const legendBins: ChoroplethBin[] = colors.map((color, i) => {
            const upper = i === breakpoints.length ? max : (breakpoints[i] ?? max);
            return {
                upperBound: upper,
                color,
                label: formatBinLabel(upper, metric.format),
            };
        });

        return { pcodeToColor: map, bins: legendBins };
    }, [csvRows, activeOption]);

    return {
        options,
        optionsPending,
        activeOption,
        dataPending,
        pcodeToColor,
        bins,
    };
}
