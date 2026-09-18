import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ColorPreview,
    Container,
    ListView,
    RadioInput,
    SelectInput,
    Switch,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    DEFAULT_BUBBLE_COLOR,
    DEFAULT_SHADE_COLOR,
    FORECAST_METRIC_KEY,
    LAYER_COLOR_RAMPS,
    type LayerColor,
} from '../constants';
import MalawiLayersContext, { type LayerSelection } from '../context';
import {
    getHdxMetricKey,
    HDX_METRICS,
    type HdxMetricFormat,
} from '../hdxMetrics';
import useHdxDatasets from '../useHdxDatasets';
import ColorRadio from './ColorRadio';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface LayerOption {
    key: string;
    label: string;
    format: HdxMetricFormat;
}

interface ColorOption {
    key: LayerColor;
    title: string;
    label: React.ReactNode;
}

function optionKeySelector(option: LayerOption) {
    return option.key;
}
function optionLabelSelector(option: LayerOption) {
    return option.label;
}
function colorKeySelector(option: ColorOption) {
    return option.key;
}
function colorLabelSelector(option: ColorOption) {
    return option.label;
}
function colorRendererParams(option: ColorOption) {
    return { title: option.title };
}

interface Props {
    sourceMetricLabel: string;
}

function LayersPanel(props: Props) {
    const { sourceMetricLabel } = props;

    const strings = useTranslation(i18n);
    const [panelShown, { toggle: togglePanel }] = useBooleanState(false);
    const {
        shadeEnabled,
        setShadeEnabled,
        shadeLayer,
        setShadeLayer,
        shadeColor,
        setShadeColor,
        bubbleEnabled,
        setBubbleEnabled,
        bubbleLayer,
        setBubbleLayer,
        bubbleColor,
        setBubbleColor,
        showLocalUnits,
        setShowLocalUnits,
    } = useContext(MalawiLayersContext);
    const { datasetByName } = useHdxDatasets();

    const options = useMemo<LayerOption[]>(
        () => {
            const datasetLabels: Record<string, string> = {
                MWI_ADM2_flood_exposure: strings.layersPanelFloodExposure,
                MWI_ADM2_vulnerability: strings.layersPanelVulnerability,
                MWI_ADM2_facilities: strings.layersPanelFacilities,
                MWI_ADM2_access: strings.layersPanelAccess,
                MWI_ADM2_demographics: strings.layersPanelDemographics,
                MWI_ADM2_rural_population: strings.layersPanelRuralPopulation,
            };
            const metricLabels: Record<string, Record<string, string>> = {
                MWI_ADM2_flood_exposure: {
                    RP100_pop_u15_30cm: strings.layersPanelFloodExposureUnder15,
                    RP100_female_pop_30cm: strings.layersPanelFloodExposureFemale,
                    RP100_elderly_30cm: strings.layersPanelFloodExposureElderly,
                    RP100_hospitals_30cm_pct: strings.layersPanelFloodExposureHospitals,
                    RP100_education_30cm_pct: strings.layersPanelFloodExposureEducation,
                },
                MWI_ADM2_vulnerability: {
                    pop_u15: strings.layersPanelVulnerabilityUnder15,
                    female_pop: strings.layersPanelVulnerabilityFemale,
                    elderly: strings.layersPanelVulnerabilityElderly,
                    rural_pop_perc: strings.layersPanelVulnerabilityRural,
                },
                MWI_ADM2_facilities: {
                    hospitals_count: strings.layersPanelFacilitiesHospitals,
                },
                MWI_ADM2_access: {
                    access_pop_hospitals_30min: strings.layersPanelAccessHospitals,
                    access_pop_primary_healthcare_30min: strings.layersPanelAccessPrimaryCare,
                    access_pop_education_5km: strings.layersPanelAccessEducation,
                },
                MWI_ADM2_demographics: {
                    pop_u15: strings.layersPanelDemographicsUnder15,
                    elderly: strings.layersPanelDemographicsElderly,
                    female_pop: strings.layersPanelDemographicsFemale,
                },
                MWI_ADM2_rural_population: {
                    rural_pop_perc: strings.layersPanelRuralPercent,
                    pop_u15_rural: strings.layersPanelRuralUnder15,
                },
            };

            const hdxOptions = HDX_METRICS
                .filter((metric) => isDefined(datasetByName[metric.datasetName]?.hdxUrl))
                .map((metric) => ({
                    key: getHdxMetricKey(metric),
                    format: metric.format,
                    label: resolveToString(
                        strings.layersPanelOptionLabel,
                        {
                            dataset: datasetLabels[metric.datasetName] ?? metric.datasetName,
                            metric: metricLabels[metric.datasetName]?.[metric.column]
                                ?? metric.column,
                        },
                    ),
                }));

            return [
                {
                    key: FORECAST_METRIC_KEY,
                    label: sourceMetricLabel,
                    format: 'number',
                },
                ...hdxOptions,
            ];
        },
        [datasetByName, strings, sourceMetricLabel],
    );

    // Bubble area reads as a magnitude, so percentages stay shade-only
    const bubbleOptions = useMemo(
        () => options.filter((option) => option.format !== 'percent'),
        [options],
    );
    const colorLabels = useMemo<Record<LayerColor, string>>(
        () => ({
            blue: strings.layersPanelColorBlue,
            red: strings.layersPanelColorRed,
            grey: strings.layersPanelColorGrey,
        }),
        [strings],
    );
    const shadeColorOptions = useMemo<ColorOption[]>(
        () => (Object.keys(LAYER_COLOR_RAMPS) as LayerColor[]).map((color) => ({
            key: color,
            title: colorLabels[color],
            label: (
                <span className={styles.colorOption}>
                    {LAYER_COLOR_RAMPS[color].map((step) => (
                        <ColorPreview
                            key={step}
                            value={step}
                            shape="square"
                            size="md"
                        />
                    ))}
                </span>
            ),
        })),
        [colorLabels],
    );
    const bubbleColorOptions = useMemo<ColorOption[]>(
        () => (Object.keys(LAYER_COLOR_RAMPS) as LayerColor[]).map((color) => ({
            key: color,
            title: colorLabels[color],
            label: (
                <ColorPreview
                    value={LAYER_COLOR_RAMPS[color][3]}
                    size="md"
                />
            ),
        })),
        [colorLabels],
    );

    const toSelection = useCallback(
        (key: string | undefined): LayerSelection | undefined => {
            const option = options.find((item) => item.key === key);
            if (isNotDefined(option)) {
                return undefined;
            }
            return {
                key: option.key,
                label: option.label,
                format: option.format,
            };
        },
        [options],
    );
    const handleShadeChange = useCallback(
        (key: string | undefined) => setShadeLayer(toSelection(key)),
        [toSelection, setShadeLayer],
    );
    const handleBubbleChange = useCallback(
        (key: string | undefined) => setBubbleLayer(toSelection(key)),
        [toSelection, setBubbleLayer],
    );
    const handleReset = useCallback(
        () => {
            setShadeEnabled(true);
            setShadeLayer(toSelection(FORECAST_METRIC_KEY));
            setShadeColor(DEFAULT_SHADE_COLOR);
            setBubbleEnabled(true);
            setBubbleLayer(undefined);
            setBubbleColor(DEFAULT_BUBBLE_COLOR);
            setShowLocalUnits(false);
        },
        [
            toSelection,
            setShadeEnabled,
            setShadeLayer,
            setShadeColor,
            setBubbleEnabled,
            setBubbleLayer,
            setBubbleColor,
            setShowLocalUnits,
        ],
    );

    return (
        <ListView
            layout="block"
            spacing="xs"
        >
            <Button
                name={undefined}
                onClick={togglePanel}
                after={panelShown
                    ? <ArrowUpSmallFillIcon />
                    : <ArrowDownSmallFillIcon />}
            >
                {strings.layersPanelLabel}
            </Button>
            {panelShown && (
                <Container
                    className={styles.layersPanel}
                    heading={strings.layersPanelHeading}
                    headingLevel={5}
                    headerActions={(
                        <Button
                            name={undefined}
                            styleVariant="transparent"
                            onClick={handleReset}
                        >
                            {strings.layersPanelReset}
                        </Button>
                    )}
                    spacing="sm"
                    withBackground
                    withPadding
                    withShadow
                    withHeaderBorder
                >
                    <ListView
                        layout="block"
                        spacing="md"
                    >
                        <Container
                            heading={strings.layersPanelShadeSection}
                            headingLevel={6}
                            headerIcons={(
                                <Switch
                                    name="shadeEnabled"
                                    value={shadeEnabled}
                                    onChange={setShadeEnabled}
                                />
                            )}
                            spacing="sm"
                        >
                            <ListView
                                layout="block"
                                spacing="sm"
                            >
                                <SelectInput
                                    name="shade"
                                    label={strings.layersPanelMetricLabel}
                                    placeholder={strings.layersPanelNone}
                                    options={options}
                                    keySelector={optionKeySelector}
                                    labelSelector={optionLabelSelector}
                                    value={shadeLayer?.key}
                                    onChange={handleShadeChange}
                                    disabled={!shadeEnabled}
                                />
                                <RadioInput
                                    name="shadeColor"
                                    label={strings.layersPanelColorScaleLabel}
                                    options={shadeColorOptions}
                                    keySelector={colorKeySelector}
                                    labelSelector={colorLabelSelector}
                                    renderer={ColorRadio}
                                    rendererParams={colorRendererParams}
                                    value={shadeColor}
                                    onChange={setShadeColor}
                                    disabled={!shadeEnabled}
                                />
                            </ListView>
                        </Container>
                        <Container
                            heading={strings.layersPanelBubbleSection}
                            headingLevel={6}
                            headerIcons={(
                                <Switch
                                    name="bubbleEnabled"
                                    value={bubbleEnabled}
                                    onChange={setBubbleEnabled}
                                />
                            )}
                            spacing="sm"
                        >
                            <ListView
                                layout="block"
                                spacing="sm"
                            >
                                <SelectInput
                                    name="bubble"
                                    label={strings.layersPanelSizeByLabel}
                                    placeholder={strings.layersPanelNone}
                                    options={bubbleOptions}
                                    keySelector={optionKeySelector}
                                    labelSelector={optionLabelSelector}
                                    value={bubbleLayer?.key}
                                    onChange={handleBubbleChange}
                                    disabled={!bubbleEnabled}
                                />
                                <RadioInput
                                    name="bubbleColor"
                                    label={strings.layersPanelBubbleColorLabel}
                                    options={bubbleColorOptions}
                                    keySelector={colorKeySelector}
                                    labelSelector={colorLabelSelector}
                                    renderer={ColorRadio}
                                    rendererParams={colorRendererParams}
                                    value={bubbleColor}
                                    onChange={setBubbleColor}
                                    disabled={!bubbleEnabled}
                                />
                            </ListView>
                        </Container>
                        <Switch
                            name="localUnits"
                            label={strings.layersPanelLocalUnits}
                            description={strings.layersPanelLocalUnitsDescription}
                            value={showLocalUnits}
                            onChange={setShowLocalUnits}
                        />
                    </ListView>
                </Container>
            )}
        </ListView>
    );
}

export default LayersPanel;
