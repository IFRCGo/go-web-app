import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { formatNumber } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import Papa from 'papaparse';
import { useQuery } from 'urql';

import { graphql } from '#generated/gql';

import {
    buildHdxOptionGroups,
    buildHdxOptions,
    type HdxOption,
    type HdxOptionGroup,
} from './hdxLayers';

export const HDX_DATASETS_QUERY = graphql(`
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

// One resolved layer, ready to render: a pcode → color map for the choropleth
// `match` expression, the raw pcode → value map + value range for the graduated
// bubble representation, plus the legend bins. `rampColor` is the strong end of
// the metric's colour ramp, used as the bubble fill.
export interface ActiveHdxLayer {
    key: string;
    label: string;
    pcodeToColor: Map<string, string>;
    pcodeToValue: Map<string, number>;
    valueRange: { min: number; max: number };
    rampColor: string;
    bins: ChoroplethBin[];
}

interface UseHdxLayersResult {
    options: HdxOption[];
    optionGroups: HdxOptionGroup[];
    optionsPending: boolean;
    activeLayers: ActiveHdxLayer[];
    dataPending: boolean;
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
    // Compact notation (e.g. 12K, 1.2M) keeps the legend swatches narrow.
    return formatNumber(value, { compact: true, maximumFractionDigits: 1 }) ?? '';
}

// Resolve a single metric option against its parsed CSV into a pcode → color
// map and legend bins. Returns undefined when the CSV yields no usable values.
function computeChoropleth(
    option: HdxOption,
    csvRows: CsvRow[],
): Omit<ActiveHdxLayer, 'key' | 'label'> | undefined {
    const { recipe, metric } = option;
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
        return undefined;
    }

    const values = pcodeValuePairs.map(({ value }) => value);
    const colors = recipe.colorRamp;
    const lastColor = colors[colors.length - 1] ?? '#cccccc';

    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0] ?? 0;
    const max = sortedValues[sortedValues.length - 1] ?? 0;

    // Raw value per pcode + the metric's value range — used by the graduated
    // bubble representation to scale circle radius. rampColor is the strong end
    // of the ramp, used as the bubble fill.
    const pcodeToValue = new Map<string, number>();
    pcodeValuePairs.forEach(({ pcode, value }) => {
        pcodeToValue.set(pcode, value);
    });
    const valueRange = { min, max };

    // Degenerate case: a uniform metric (most commonly an all-zero count column,
    // e.g. hospitals_count where no district has a hospital) has no spread to
    // bin. Quantile breakpoints would all equal that single value and the strict
    // `value < bp` test below would fall through to lastColor, painting every
    // area the darkest ramp color and a `0,0,0,0,0` legend — reading as "max
    // everywhere". Collapse to one uniform swatch + single legend bin instead.
    if (max === min) {
        const uniformColor = colors[0] ?? lastColor;
        const pcodeToColor = new Map<string, string>();
        pcodeValuePairs.forEach(({ pcode }) => {
            pcodeToColor.set(pcode, uniformColor);
        });
        return {
            pcodeToColor,
            pcodeToValue,
            valueRange,
            rampColor: uniformColor,
            bins: [{
                upperBound: max,
                color: uniformColor,
                label: formatBinLabel(max, metric.format),
            }],
        };
    }

    const breakpoints = computeQuantileBreakpoints(values, N_BINS);

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

    const pcodeToColor = new Map<string, string>();
    pcodeValuePairs.forEach(({ pcode, value }) => {
        pcodeToColor.set(pcode, colorFor(value));
    });

    // Each swatch is labelled with its upper bound. The last bin's upper
    // bound is the dataset max.
    const bins: ChoroplethBin[] = colors.map((color, i) => {
        const upper = i === breakpoints.length ? max : (breakpoints[i] ?? max);
        return {
            upperBound: upper,
            color,
            label: formatBinLabel(upper, metric.format),
        };
    });

    return {
        pcodeToColor,
        pcodeToValue,
        valueRange,
        rampColor: lastColor,
        bins,
    };
}

export default function useHdxLayers(
    activeOptionKeys: string[],
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

    const optionGroups = useMemo<HdxOptionGroup[]>(() => {
        if (!results) {
            return [];
        }
        const availableNames = new Set(results.map((r) => r.datasetName));
        return buildHdxOptionGroups(availableNames);
    }, [results]);

    // Active options, in selection order (drives stacking + legend order).
    const activeOptions = useMemo<HdxOption[]>(
        () => activeOptionKeys
            .map((key) => options.find((opt) => opt.key === key))
            .filter(isDefined),
        [activeOptionKeys, options],
    );

    // Dataset name → HDX CSV url, for the datasets backing the active options.
    const datasetUrlByName = useMemo(() => {
        const map = new Map<string, string>();
        results?.forEach((r) => {
            if (isDefined(r.hdxUrl)) {
                map.set(r.datasetName, r.hdxUrl);
            }
        });
        return map;
    }, [results]);

    // Distinct CSV urls we need (several metrics may share one dataset CSV).
    const activeUrls = useMemo<string[]>(() => {
        const urls = new Set<string>();
        activeOptions.forEach((opt) => {
            const url = datasetUrlByName.get(opt.recipe.datasetName);
            if (url) {
                urls.add(url);
            }
        });
        return Array.from(urls);
    }, [activeOptions, datasetUrlByName]);
    const activeUrlsKey = activeUrls.join('|');

    // Parsed CSVs, cached by url so toggling a layer back on is instant and we
    // never re-download a CSV shared by two active metrics. Never evicted —
    // the dataset count is small and bounded by the recipe table.
    const [csvByUrl, setCsvByUrl] = useState<Record<string, CsvRow[]>>({});
    const inFlightRef = useRef<Set<string>>(new Set());
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        activeUrls.forEach((url) => {
            if (csvByUrl[url] || inFlightRef.current.has(url)) {
                return;
            }
            inFlightRef.current.add(url);
            setPendingCount((count) => count + 1);

            Papa.parse<CsvRow>(url, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (parseResults) => {
                    inFlightRef.current.delete(url);
                    setPendingCount((count) => count - 1);
                    setCsvByUrl((prev) => ({ ...prev, [url]: parseResults.data }));
                },
                error: () => {
                    inFlightRef.current.delete(url);
                    setPendingCount((count) => count - 1);
                },
            });
        });
        // activeUrlsKey is a stable join of activeUrls; csvByUrl guards re-fetch.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeUrlsKey, csvByUrl, enabled]);

    const activeLayers = useMemo<ActiveHdxLayer[]>(
        () => activeOptions
            .map<ActiveHdxLayer | undefined>((option) => {
                const url = datasetUrlByName.get(option.recipe.datasetName);
                const csvRows = url ? csvByUrl[url] : undefined;
                if (!csvRows) {
                    return undefined;
                }
                const choropleth = computeChoropleth(option, csvRows);
                if (!choropleth) {
                    return undefined;
                }
                return {
                    key: option.key,
                    label: option.label,
                    ...choropleth,
                };
            })
            .filter(isDefined),
        [activeOptions, datasetUrlByName, csvByUrl],
    );

    return {
        options,
        optionGroups,
        optionsPending,
        activeLayers,
        dataPending: pendingCount > 0,
    };
}
