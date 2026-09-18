import {
    useContext,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    FORECAST_METRIC_KEY,
    HDX_ADM2_JOIN_COLUMN,
    LAYER_COLOR_RAMPS,
} from './constants';
import MalawiLayersContext, { type LayerSelection } from './context';
import { HDX_METRIC_BY_KEY } from './hdxMetrics';
import useCsvRows from './useCsvRows';
import useHdxDatasets from './useHdxDatasets';
import {
    getBinColor,
    getValueBins,
    parseNumber,
} from './utils';

// Metric the active source (JBA or ARC) exposes to the map layers
export interface SourceMetric {
    label: string;
    valueByPcode: Record<string, number>;
    // Across every forecast day so classes stay stable when the day changes
    allValues: number[];
}

const EMPTY_VALUES: Record<string, number> = {};
const EMPTY_LIST: number[] = [];

function useLayerMetric(
    selection: LayerSelection | undefined,
    sourceMetric: SourceMetric | undefined,
) {
    const {
        datasetByName,
        pending: datasetsPending,
        errored: datasetsErrored,
    } = useHdxDatasets();

    const isForecast = selection?.key === FORECAST_METRIC_KEY;
    const hdxMetric = isDefined(selection) && !isForecast
        ? HDX_METRIC_BY_KEY[selection.key]
        : undefined;
    const dataset = hdxMetric ? datasetByName[hdxMetric.datasetName] : undefined;
    const {
        rows,
        pending: rowsPending,
        errored: rowsErrored,
    } = useCsvRows(dataset?.hdxUrl ?? undefined);

    const hdxValueByPcode = useMemo(
        () => {
            if (isNotDefined(hdxMetric) || isNotDefined(rows)) {
                return undefined;
            }
            const values: Record<string, number> = {};
            rows.forEach((row) => {
                const pcode = row[HDX_ADM2_JOIN_COLUMN];
                const value = parseNumber(row[hdxMetric.column]);
                if (isDefined(pcode) && isDefined(value)) {
                    values[pcode] = value;
                }
            });
            return values;
        },
        [rows, hdxMetric],
    );

    const valueByPcode = (isForecast ? sourceMetric?.valueByPcode : hdxValueByPcode)
        ?? EMPTY_VALUES;
    // Zero impact means nothing to show, while zero in an HDX column is a real value
    const binValues = useMemo(
        () => {
            if (isForecast) {
                return (sourceMetric?.allValues ?? EMPTY_LIST).filter((value) => value > 0);
            }
            return Object.values(hdxValueByPcode ?? EMPTY_VALUES);
        },
        [isForecast, sourceMetric, hdxValueByPcode],
    );

    const datasetMissing = isDefined(hdxMetric)
        && !datasetsPending
        && isNotDefined(dataset?.hdxUrl);

    return {
        selection,
        label: isForecast ? sourceMetric?.label : selection?.label,
        format: selection?.format ?? 'number',
        valueByPcode,
        binValues,
        loadedAt: dataset?.loadedAt,
        pending: isDefined(hdxMetric) && (datasetsPending || rowsPending),
        errored: datasetsErrored || rowsErrored || datasetMissing,
    };
}

function useThematicLayers(sourceMetric: SourceMetric | undefined) {
    const {
        shadeEnabled,
        shadeLayer,
        shadeColor,
        bubbleEnabled,
        bubbleLayer,
        bubbleColor,
        showLocalUnits,
    } = useContext(MalawiLayersContext);

    const shadeMetric = useLayerMetric(shadeEnabled ? shadeLayer : undefined, sourceMetric);
    const bubbleMetric = useLayerMetric(bubbleEnabled ? bubbleLayer : undefined, sourceMetric);

    const shadeBins = useMemo(
        () => getValueBins(shadeMetric.binValues, LAYER_COLOR_RAMPS[shadeColor]),
        [shadeMetric.binValues, shadeColor],
    );
    const shadeColorByPcode = useMemo(
        () => {
            const colors: Record<string, string> = {};
            Object.entries(shadeMetric.valueByPcode).forEach(([pcode, value]) => {
                const color = getBinColor(value, shadeBins);
                if (isDefined(color)) {
                    colors[pcode] = color;
                }
            });
            return colors;
        },
        [shadeMetric.valueByPcode, shadeBins],
    );

    const bubbleMaxValue = useMemo(
        () => bubbleMetric.binValues.reduce((max, value) => Math.max(max, value), 0),
        [bubbleMetric.binValues],
    );

    return {
        shade: {
            selection: shadeMetric.selection,
            label: shadeMetric.label,
            format: shadeMetric.format,
            loadedAt: shadeMetric.loadedAt,
            pending: shadeMetric.pending,
            errored: shadeMetric.errored,
            bins: shadeBins,
            colorByPcode: shadeColorByPcode,
        },
        bubble: {
            selection: bubbleMetric.selection,
            label: bubbleMetric.label,
            format: bubbleMetric.format,
            loadedAt: bubbleMetric.loadedAt,
            pending: bubbleMetric.pending,
            errored: bubbleMetric.errored,
            color: LAYER_COLOR_RAMPS[bubbleColor][3],
            valueByPcode: bubbleMetric.valueByPcode,
            maxValue: bubbleMaxValue,
        },
        showLocalUnits,
    };
}

export default useThematicLayers;
