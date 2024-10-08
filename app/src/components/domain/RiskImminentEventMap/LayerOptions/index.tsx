import { useMemo } from 'react';
import {
    Container,
    Legend,
    Switch,
} from '@ifrc-go/ui';

import useSetFieldValue from '#hooks/useSetFieldValue';
import {
    COLOR_DARK_GREY,
    COLOR_GREEN,
    COLOR_ORANGE,
    COLOR_RED,
} from '#utils/constants';

import { RiskLayerSeverity } from '../utils';

import styles from './styles.module.css';

export interface LayerOptionsValue {
    showStormPosition: boolean;
    showForecastUncertainty: boolean;
    showTrackLine: boolean;
    showExposedArea: boolean;
}

interface SeverityLegendItem {
    severity: RiskLayerSeverity;
    label: string;
    color: string;
}

function severitySelector(item: SeverityLegendItem) {
    return item.severity;
}
function labelSelector(item: SeverityLegendItem) {
    return item.label;
}
function colorSelector(item: SeverityLegendItem) {
    return item.color;
}

interface Props {
    value: LayerOptionsValue;
    onChange: React.Dispatch<React.SetStateAction<LayerOptionsValue>>;
}

function LayerOptions(props: Props) {
    const {
        value,
        onChange,
    } = props;

    const setFieldValue = useSetFieldValue(onChange);

    // FIXME: use strings
    const severityLegendItems = useMemo<SeverityLegendItem[]>(() => ([
        {
            severity: 'green',
            label: 'Green',
            color: COLOR_GREEN,
        },
        {
            severity: 'orange',
            label: 'Orange',
            color: COLOR_ORANGE,
        },
        {
            severity: 'red',
            label: 'Red',
            color: COLOR_RED,
        },
        {
            severity: 'unknown',
            label: 'Unknown',
            color: COLOR_DARK_GREY,
        },
    ]), []);

    return (
        <Container
            className={styles.layerOptions}
            contentViewType="vertical"
            spacing="compact"
        >
            <Switch
                // FIXME: use strings
                label="Position of storm"
                name="showStormPosition"
                value={value.showStormPosition}
                onChange={setFieldValue}
                withBackground
                withInvertedView
            />
            <div className={styles.exposedAreaInputWrapper}>
                <Switch
                    // FIXME: use strings
                    label="Exposed area"
                    name="showExposedArea"
                    value={value.showExposedArea}
                    onChange={setFieldValue}
                    withInvertedView
                />
                {value.showExposedArea && (
                    <Legend
                        className={styles.exposedAreaLegend}
                        // FIXME: use strings
                        label="Severity:"
                        items={severityLegendItems}
                        keySelector={severitySelector}
                        labelSelector={labelSelector}
                        colorSelector={colorSelector}
                        labelClassName={styles.legendLabel}
                    />
                )}
            </div>
            <Switch
                // FIXME: use strings
                label="Storm track"
                name="showTrackLine"
                value={value.showTrackLine}
                onChange={setFieldValue}
                withBackground
                withInvertedView
            />
            <Switch
                // FIXME: use strings
                label="Forecast uncertainty"
                name="showForecastUncertainty"
                value={value.showForecastUncertainty}
                onChange={setFieldValue}
                withBackground
                withInvertedView
            />
        </Container>
    );
}

export default LayerOptions;
