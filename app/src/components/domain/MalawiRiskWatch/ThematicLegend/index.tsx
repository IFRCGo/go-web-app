import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    InfoPopup,
    Legend,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { COLOR_PRIMARY_RED } from '#utils/constants';

import { BUBBLE_MAX_RADIUS } from '../constants';
import { type HdxMetricFormat } from '../hdxMetrics';
import useCogInfo from '../useCogInfo';
import useLocalUnits, { type LocalUnitType } from '../useLocalUnits';
import useThematicLayers, {
    type SourceMetric,
    type SourceRaster,
} from '../useThematicLayers';
import { type ValueBin } from '../utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

const BUBBLE_LEGEND_RATIOS = [0.25, 0.5, 1];

function binKeySelector(bin: ValueBin) {
    return bin.max;
}
function binColorSelector(bin: ValueBin) {
    return bin.color;
}
function ratioKeySelector(ratio: number) {
    return ratio;
}
function formatRasterValue(value: number) {
    return formatNumber(value, { compact: true, maximumFractionDigits: 1 });
}
function typeKeySelector(type: LocalUnitType) {
    return type.code;
}
function typeLabelSelector(type: LocalUnitType) {
    return type.name;
}
function typeColorSelector(type: LocalUnitType) {
    return type.color ?? COLOR_PRIMARY_RED;
}
function typeIconSelector(type: LocalUnitType) {
    return type.iconUrl;
}

interface Props {
    sourceMetric: SourceMetric | undefined;
    rasters?: SourceRaster[];
}

function ThematicLegend(props: Props) {
    const {
        sourceMetric,
        rasters,
    } = props;

    const strings = useTranslation(i18n);
    const {
        shade,
        bubble,
        raster,
        showLocalUnits,
    } = useThematicLayers(sourceMetric, rasters);
    const {
        cog,
        errored: cogErrored,
    } = useCogInfo(raster.option?.url);
    const { types: localUnitTypes } = useLocalUnits(!showLocalUnits);

    const formatValue = useCallback(
        (value: number, format: HdxMetricFormat, maximumFractionDigits: number) => {
            if (format === 'percent') {
                return resolveToString(
                    strings.thematicLegendPercent,
                    { value: formatNumber(value, { maximumFractionDigits }) },
                );
            }
            return formatNumber(Math.round(value), { compact: true, maximumFractionDigits });
        },
        [strings.thematicLegendPercent],
    );

    // Upper bounds only, so the classes fit on one line; more digits when rounding merges them
    const binLabels = useMemo(
        () => {
            const toLabels = (digits: number) => shade.bins.map((bin) => resolveToString(
                strings.thematicLegendUpTo,
                { value: formatValue(bin.max, shade.format, digits) },
            ));
            const labels = toLabels(0);
            return new Set(labels).size === labels.length ? labels : toLabels(1);
        },
        [shade.bins, shade.format, strings.thematicLegendUpTo, formatValue],
    );
    const binLabelSelector = useCallback(
        (bin: ValueBin) => binLabels[shade.bins.indexOf(bin)],
        [binLabels, shade.bins],
    );

    const renderHeader = (
        layer: { label: string | undefined, loadedAt: string | undefined },
    ) => (
        <div className={styles.header}>
            <div
                className={styles.title}
                title={layer.label}
            >
                {layer.label}
            </div>
            {isDefined(layer.loadedAt) && (
                <div className={styles.info}>
                    <InfoPopup
                        description={resolveToString(
                            strings.thematicLegendSource,
                            { date: formatDate(layer.loadedAt) ?? '' },
                        )}
                    />
                </div>
            )}
        </div>
    );

    const renderStatus = (layer: { errored: boolean }) => (
        layer.errored ? strings.thematicLegendFailed : null
    );

    // Nothing to legend while a layer is empty or still loading
    const shadeVisible = shade.errored || shade.bins.length > 0;
    const bubbleVisible = bubble.errored || bubble.maxValue > 0;
    const rasterVisible = isDefined(raster.option);

    if (!shadeVisible && !bubbleVisible && !rasterVisible && !showLocalUnits) {
        return null;
    }

    const renderRasterStatus = () => {
        if (isNotDefined(raster.option?.url)) {
            return strings.thematicLegendRasterUnavailable;
        }
        if (cogErrored) {
            return strings.thematicLegendFailed;
        }
        return null;
    };

    return (
        <Container
            className={styles.legend}
            spacing="xs"
            withBackground
            withPadding
        >
            <ListView
                layout="block"
                spacing="2xs"
            >
                {shadeVisible && (
                    <>
                        {renderHeader(shade)}
                        {renderStatus(shade)}
                        {shade.bins.length > 0 && (
                            <Legend
                                items={shade.bins}
                                itemListContainerClassName={styles.legendItems}
                                itemClassName={styles.legendItem}
                                keySelector={binKeySelector}
                                colorSelector={binColorSelector}
                                labelSelector={binLabelSelector}
                            />
                        )}
                    </>
                )}
                {bubbleVisible && (
                    <>
                        {renderHeader(bubble)}
                        {renderStatus(bubble)}
                        {bubble.maxValue > 0 && (
                            <ListView spacing="xs">
                                {BUBBLE_LEGEND_RATIOS.map((ratio) => (
                                    <div
                                        key={ratioKeySelector(ratio)}
                                        className={styles.bubble}
                                    >
                                        <span
                                            className={styles.circle}
                                            style={{
                                                width: 2 * BUBBLE_MAX_RADIUS * ratio,
                                                height: 2 * BUBBLE_MAX_RADIUS * ratio,
                                                backgroundColor: bubble.color,
                                            }}
                                        />
                                        {formatValue(
                                            bubble.maxValue * ratio * ratio,
                                            bubble.format,
                                            1,
                                        )}
                                    </div>
                                ))}
                            </ListView>
                        )}
                    </>
                )}
                {rasterVisible && (
                    <>
                        {renderHeader({ label: raster.option?.label, loadedAt: undefined })}
                        {renderRasterStatus()}
                        {isDefined(cog) && (
                            <div className={styles.gradient}>
                                {formatRasterValue(cog.domain[0])}
                                <span
                                    className={styles.bar}
                                    style={{
                                        background: `linear-gradient(to right, ${raster.colors.join(', ')})`,
                                        opacity: raster.opacity,
                                    }}
                                />
                                {formatRasterValue(cog.domain[1])}
                            </div>
                        )}
                    </>
                )}
                {showLocalUnits && localUnitTypes.length > 0 && (
                    <>
                        {renderHeader({
                            label: strings.thematicLegendLocalUnits,
                            loadedAt: undefined,
                        })}
                        <Legend
                            items={localUnitTypes}
                            itemListContainerClassName={styles.legendItems}
                            itemClassName={styles.legendItem}
                            iconElementClassName={styles.legendIcon}
                            keySelector={typeKeySelector}
                            colorSelector={typeColorSelector}
                            labelSelector={typeLabelSelector}
                            iconSrcSelector={typeIconSelector}
                        />
                    </>
                )}
            </ListView>
        </Container>
    );
}

export default ThematicLegend;
