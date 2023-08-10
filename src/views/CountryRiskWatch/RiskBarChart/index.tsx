import {
    useCallback,
    useMemo,
} from 'react';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import SelectInput from '#components/SelectInput';
import BlockLoading from '#components/BlockLoading';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import { stringLabelSelector } from '#utils/selectors';
import {
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    getWfRiskDataItem,
    hasSomeDefinedValue,
    hazardTypeToColorMap,
    riskMetricKeySelector,
    hazardTypeKeySelector,
    hazardTypeLabelSelector,
    applicableHazardsByRiskMetric,
} from '#utils/risk';
import type {
    HazardType,
    RiskMetric,
    RiskMetricOption,
} from '#utils/risk';
import type { paths } from '#generated/riskTypes';

import i18n from './i18n.json';
import styles from './styles.module.css';
import FoodInsecurityChart from './FoodInsecurityChart';
import WildfireChart from './WildfireChart';
import CombinedChart from './CombinedChart';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

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
        [strings],
    );

    const fiRiskDataItem = useMemo(
        () => getFiRiskDataItem(seasonalRiskData?.ipc_displacement_data),
        [seasonalRiskData],
    );
    const wfRiskDataItem = useMemo(
        () => getWfRiskDataItem(seasonalRiskData?.gwis),
        [seasonalRiskData],
    );

    const selectedRiskMetricDetail = useMemo(
        () => riskMetricOptions.find(
            (option) => option.key === selectedRiskMetric,
        ) ?? riskMetricOptions[0],
        [selectedRiskMetric, riskMetricOptions],
    );

    const hazardTypeList = useMemo(
        () => {
            if (!seasonalRiskData) {
                return [];
            }

            const {
                idmc,
                raster_displacement_data,
                inform_seasonal,
            } = seasonalRiskData;

            const displacementData = idmc?.map(
                (dataItem) => {
                    if (!hasSomeDefinedValue(dataItem)) {
                        return undefined;
                    }

                    return getDataWithTruthyHazardType(dataItem);
                },
            ).filter(isDefined) ?? [];
            const exposureData = [
                ...raster_displacement_data?.map(
                    (dataItem) => {
                        if (!hasSomeDefinedValue(dataItem)) {
                            return undefined;
                        }

                        return getDataWithTruthyHazardType(dataItem);
                    },
                ) ?? [],
                fiRiskDataItem,
            ].filter(isDefined);

            const riskScoreData = [
                ...inform_seasonal?.map(
                    (dataItem) => {
                        if (!hasSomeDefinedValue(dataItem)) {
                            return undefined;
                        }

                        return getDataWithTruthyHazardType(dataItem);
                    },
                ) ?? [],
                wfRiskDataItem,
            ].filter(isDefined);

            const availableHazards: { [key in HazardType]?: string } = {
                ...listToMap(
                    exposureData,
                    (item) => item.hazard_type,
                    (item) => item.hazard_type_display,
                ),
                ...listToMap(
                    displacementData,
                    (item) => item.hazard_type,
                    (item) => item.hazard_type_display,
                ),
                ...listToMap(
                    riskScoreData,
                    (item) => item.hazard_type,
                    (item) => item.hazard_type_display,
                ),
            };

            return selectedRiskMetricDetail.applicableHazards.map(
                (hazardType) => {
                    const hazard_type_display = availableHazards[hazardType];
                    if (isFalsyString(hazard_type_display)) {
                        return undefined;
                    }

                    return {
                        hazard_type: hazardType,
                        hazard_type_display,
                    };
                },
            ).filter(isDefined);
        },
        [seasonalRiskData, fiRiskDataItem, wfRiskDataItem, selectedRiskMetricDetail],
    );

    const hazardListForDisplay = useMemo(
        () => {
            if (isNotDefined(selectedHazardType)) {
                return hazardTypeList;
            }

            return hazardTypeList.filter(
                (hazardType) => hazardType.hazard_type === selectedHazardType,
            );
        },
        [selectedHazardType, hazardTypeList],
    );

    return (
        <Container
            heading={strings.riskBarChartTitle}
            className={styles.riskBarChart}
            withHeaderBorder
            filtersContainerClassName={styles.filters}
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
                        options={hazardTypeList}
                        placeholder={strings.riskBarChartFilterHazardPlaceholder}
                        keySelector={hazardTypeKeySelector}
                        labelSelector={hazardTypeLabelSelector}
                        value={selectedHazardType}
                        onChange={setSelectedHazardType}
                    />
                    <div />
                </>
            )}
        >
            {pending && <BlockLoading />}
            {!pending && selectedHazardType === 'FI' && (
                <FoodInsecurityChart
                    ipcData={seasonalRiskData?.ipc_displacement_data}
                />
            )}
            {!pending && selectedHazardType === 'WF' && (
                <WildfireChart
                    gwisData={seasonalRiskData?.gwis}
                />
            )}
            {!pending && selectedHazardType !== 'FI' && selectedHazardType !== 'WF' && (
                <CombinedChart
                    riskData={seasonalRiskData}
                    selectedRiskMetricDetail={selectedRiskMetricDetail}
                    selectedHazardType={selectedHazardType}
                    hazardListForDisplay={hazardListForDisplay}
                />
            )}
            {!pending && (
                <div className={styles.legend}>
                    {hazardListForDisplay.map(
                        (hazard) => (
                            <div
                                key={hazard.hazard_type}
                                className={styles.legendItem}
                            >
                                <div
                                    className={styles.color}
                                    style={{
                                        backgroundColor: hazardTypeToColorMap[hazard.hazard_type],
                                    }}
                                />
                                <div className={styles.label}>
                                    {hazard.hazard_type_display}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </Container>
    );
}

export default RiskBarChart;
