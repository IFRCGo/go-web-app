import {
    useCallback,
    useMemo,
} from 'react';
import {
    Checkbox,
    Container,
    LegendItem,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    stringLabelSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import useInputState from '#hooks/useInputState';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import type {
    HazardType,
    RiskMetric,
    RiskMetricOption,
} from '#utils/domain/risk';
import {
    applicableHazardsByRiskMetric,
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    hasSomeDefinedValue,
    hazardTypeKeySelector,
    hazardTypeLabelSelector,
    hazardTypeToColorMap,
    riskMetricKeySelector,
} from '#utils/domain/risk';
import { type RiskApiResponse } from '#utils/restRequest';

import CombinedChart from './CombinedChart';
import FoodInsecurityChart from './FoodInsecurityChart';
import WildfireChart from './WildfireChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryRiskResponse = RiskApiResponse<'/api/v1/country-seasonal/'>;
type RiskData = CountryRiskResponse[number];

const currentYear = new Date().getFullYear();

interface Props {
    pending: boolean;
    seasonalRiskData: RiskData | undefined;
}

function RiskBarChart(props: Props) {
    const {
        seasonalRiskData,
        pending,
    } = props;
    const strings = useTranslation(i18n);

    const [selectedRiskMetric, setSelectedRiskMetric] = useInputState<RiskMetric>('exposure');
    const [
        selectedHazardType,
        setSelectedHazardType,
    ] = useInputState<HazardType | undefined>(undefined);
    const [showFiHistoricalData, setShowFiHistoricalData] = useInputState<boolean>(false);
    const [showFiProjection, setShowFiProjection] = useInputState<boolean>(false);

    const handleRiskMetricChange = useCallback(
        (riskMetric: RiskMetric) => {
            setSelectedRiskMetric(riskMetric);
            setSelectedHazardType(undefined);
        },
        [setSelectedHazardType, setSelectedRiskMetric],
    );

    const riskMetricOptions: RiskMetricOption[] = useMemo(
        () => ([
            {
                key: 'exposure',
                label: strings.riskBarChartExposureLabel,
                applicableHazards: applicableHazardsByRiskMetric.exposure,
            },
            {
                key: 'displacement',
                label: strings.riskBarChartDisplacementLabel,
                applicableHazards: applicableHazardsByRiskMetric.displacement,
            },
            {
                key: 'riskScore',
                label: strings.riskBarChartRiskScoreLabel,
                applicableHazards: applicableHazardsByRiskMetric.riskScore,
            },
        ]),
        [
            strings.riskBarChartExposureLabel,
            strings.riskBarChartDisplacementLabel,
            strings.riskBarChartRiskScoreLabel,
        ],
    );

    const selectedRiskMetricDetail = useMemo(
        () => riskMetricOptions.find(
            (option) => option.key === selectedRiskMetric,
        ) ?? riskMetricOptions[0],
        [selectedRiskMetric, riskMetricOptions],
    );

    const data = useMemo(
        () => {
            if (isNotDefined(seasonalRiskData)) {
                return undefined;
            }

            const {
                idmc,
                ipc_displacement_data,
                raster_displacement_data,
                gwis_seasonal,
                inform_seasonal,
            } = seasonalRiskData;

            const displacement = idmc?.map(
                (dataItem) => {
                    if (!hasSomeDefinedValue(dataItem)) {
                        return undefined;
                    }

                    return getDataWithTruthyHazardType(dataItem);
                },
            ).filter(isDefined) ?? [];

            const groupedIpc = Object.values(
                listToGroupList(
                    ipc_displacement_data ?? [],
                    (ipcDataItem) => ipcDataItem.country,
                ),
            );

            const exposure = [
                ...raster_displacement_data?.map(
                    (dataItem) => {
                        if (!hasSomeDefinedValue(dataItem)) {
                            return undefined;
                        }

                        return getDataWithTruthyHazardType(dataItem);
                    },
                ) ?? [],
                ...groupedIpc.map(getFiRiskDataItem),
            ].filter(isDefined);

            const riskScore = unique(
                [
                    ...inform_seasonal?.map(
                        (dataItem) => {
                            if (!hasSomeDefinedValue(dataItem)) {
                                return undefined;
                            }

                            return getDataWithTruthyHazardType(dataItem);
                        },
                    ) ?? [],
                    ...gwis_seasonal?.map(
                        (dataItem) => {
                            if (!hasSomeDefinedValue(dataItem)) {
                                return undefined;
                            }

                            return getDataWithTruthyHazardType(dataItem);
                        },
                    ) ?? [],
                ].filter(isDefined),
                (item) => `${item.country_details.iso3}-${item.hazard_type}`,
            );

            return {
                displacement,
                exposure,
                riskScore,
            };
        },
        [seasonalRiskData],
    );

    const availableHazards: { [key in HazardType]?: string } | undefined = useMemo(
        () => {
            if (isNotDefined(data)) {
                return undefined;
            }

            if (selectedRiskMetric === 'exposure') {
                return {
                    ...listToMap(
                        data.exposure,
                        (item) => item.hazard_type,
                        (item) => item.hazard_type_display,
                    ),
                };
            }

            if (selectedRiskMetric === 'displacement') {
                return {
                    ...listToMap(
                        data.displacement,
                        (item) => item.hazard_type,
                        (item) => item.hazard_type_display,
                    ),
                };
            }

            if (selectedRiskMetric === 'riskScore') {
                return {
                    ...listToMap(
                        data.riskScore,
                        (item) => item.hazard_type,
                        (item) => item.hazard_type_display,
                    ),
                };
            }

            return undefined;
        },
        [data, selectedRiskMetric],
    );

    const hazardTypeOptions = useMemo(
        () => (
            selectedRiskMetricDetail.applicableHazards.map(
                (hazardType) => {
                    const hazard_type_display = availableHazards?.[hazardType];
                    if (isFalsyString(hazard_type_display)) {
                        return undefined;
                    }

                    return {
                        hazard_type: hazardType,
                        hazard_type_display,
                    };
                },
            ).filter(isDefined)
        ),
        [availableHazards, selectedRiskMetricDetail],
    );

    const hazardListForDisplay = useMemo(
        () => {
            if (isNotDefined(selectedHazardType)) {
                return hazardTypeOptions;
            }

            return hazardTypeOptions.filter(
                (hazardType) => hazardType.hazard_type === selectedHazardType,
            );
        },
        [selectedHazardType, hazardTypeOptions],
    );

    return (
        <Container
            heading={strings.riskBarChartTitle}
            className={styles.riskBarChart}
            withHeaderBorder
            // footerActions={<CountryRiskSourcesOutput />}
            filters={(
                <>
                    <SelectInput
                        name={undefined}
                        options={riskMetricOptions}
                        keySelector={riskMetricKeySelector}
                        labelSelector={stringLabelSelector}
                        value={selectedRiskMetric}
                        onChange={handleRiskMetricChange}
                        nonClearable
                    />
                    <SelectInput
                        name={undefined}
                        options={hazardTypeOptions}
                        placeholder={strings.riskBarChartFilterHazardPlaceholder}
                        keySelector={hazardTypeKeySelector}
                        labelSelector={hazardTypeLabelSelector}
                        value={selectedHazardType}
                        onChange={setSelectedHazardType}
                    />
                    {selectedHazardType === 'FI' && (
                        <div className={styles.fiFilters}>
                            <Checkbox
                                name={undefined}
                                value={showFiHistoricalData}
                                onChange={setShowFiHistoricalData}
                                label="Show historical data"
                            />
                            <Checkbox
                                name={undefined}
                                value={showFiProjection}
                                onChange={setShowFiProjection}
                                label="Show projections"
                            />
                        </div>
                    )}
                </>
            )}
            pending={pending}
            headingLevel={2}
        >
            {selectedHazardType === 'FI' && (
                <FoodInsecurityChart
                    showHistoricalData={showFiHistoricalData}
                    showProjection={showFiProjection}
                    ipcData={seasonalRiskData?.ipc_displacement_data}
                />
            )}
            {selectedHazardType === 'WF' && (
                <WildfireChart
                    gwisData={seasonalRiskData?.gwis}
                />
            )}
            {selectedHazardType !== 'FI' && selectedHazardType !== 'WF' && (
                <CombinedChart
                    riskData={seasonalRiskData}
                    selectedRiskMetricDetail={selectedRiskMetricDetail}
                    selectedHazardType={selectedHazardType}
                    hazardListForDisplay={hazardListForDisplay}
                />
            )}
            <div className={styles.legend}>
                {hazardListForDisplay.map(
                    (hazard) => (
                        <LegendItem
                            key={hazard.hazard_type}
                            label={hazard.hazard_type_display}
                            color={hazardTypeToColorMap[hazard.hazard_type]}
                        />
                    ),
                )}
                {selectedHazardType === 'WF' && (
                    <>
                        <LegendItem
                            className={styles.legendItem}
                            colorClassName={styles.color}
                            label={resolveToString(
                                strings.currentYearTooltipLabel,
                                { currentYear },
                            )}
                            color={COLOR_PRIMARY_RED}
                        />
                        <LegendItem
                            className={styles.legendItem}
                            colorClassName={styles.color}
                            label={resolveToString(
                                strings.averageTooltipLabel,
                                { currentYear },
                            )}
                            color={COLOR_PRIMARY_BLUE}
                        />
                        <LegendItem
                            className={styles.legendItem}
                            colorClassName={styles.color}
                            label={resolveToString(
                                strings.minMaxLabel,
                                { currentYear },
                            )}
                            color={COLOR_LIGHT_GREY}
                        />
                    </>
                )}
            </div>
        </Container>
    );
}

export default RiskBarChart;
