import { useCallback } from 'react';
import {
    Container,
    InfoPopup,
    Legend,
    LegendItem,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { COLOR_PRIMARY_RED } from '#utils/constants';

import { BUBBLE_MAX_RADIUS } from '../constants';
import { type HdxMetricFormat } from '../hdxMetrics';
import useThematicLayers, { type SourceMetric } from '../useThematicLayers';
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

interface Props {
    sourceMetric: SourceMetric | undefined;
}

function ThematicLegend(props: Props) {
    const { sourceMetric } = props;

    const strings = useTranslation(i18n);
    const {
        shade,
        bubble,
        showLocalUnits,
    } = useThematicLayers(sourceMetric);

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

    // Upper bounds only, so the classes fit on one line
    const binLabelSelector = useCallback(
        (bin: ValueBin) => resolveToString(
            strings.thematicLegendUpTo,
            { value: formatValue(bin.max, shade.format, 0) },
        ),
        [strings.thematicLegendUpTo, formatValue, shade.format],
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

    if (!shadeVisible && !bubbleVisible && !showLocalUnits) {
        return null;
    }

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
                {showLocalUnits && (
                    <LegendItem
                        className={styles.legendItem}
                        color={COLOR_PRIMARY_RED}
                        label={strings.thematicLegendLocalUnits}
                    />
                )}
            </ListView>
        </Container>
    );
}

export default ThematicLegend;
