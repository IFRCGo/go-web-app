import {
    useCallback,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
    unique,
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
} from '#utils/risk';
import type { paths, components } from '#generated/riskTypes';

import i18n from './i18n.json';
import styles from './styles.module.css';
import FoodInsecurityChart from './FoodInsecurityChart';
import WildfireChart from './WildfireChart';
import CombinedChart from './CombinedChart';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];
type HazardType = components['schemas']['HazardTypeEnum'];
interface HazardTypeOption {
    hazard_type: HazardType;
    hazard_type_display: string;
}

type RiskMetric = 'exposure' | 'displacement' | 'riskScore';
type RiskMetricOption = {
    key: RiskMetric,
    label: string;
    applicableHazards: Record<HazardType, boolean>;
}

function riskMetricKeySelector(option: RiskMetricOption) {
    return option.key;
}

function hazardTypeKeySelector(option: HazardTypeOption) {
    return option.hazard_type;
}
function hazardTypeLabelSelector(option: HazardTypeOption) {
    return option.hazard_type_display;
}

const defaultApplicableHazards: Record<HazardType, boolean> = {
    EQ: false,
    FL: false,
    TC: false,
    EP: false,
    FI: false,
    SS: false,
    DR: false,
    TS: false,
    CD: false,
    WF: false,
};

interface Props {
    pending: boolean;
    riskData: RiskData | undefined;
}

function RiskBarChart(props: Props) {
    const {
        riskData,
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
                applicableHazards: {
                    ...defaultApplicableHazards,
                    TC: true,
                    FL: true,
                    FI: true,
                },
            },
            {
                key: 'displacement',
                label: strings.riskBarChartDisplacementLabel,
                applicableHazards: { ...defaultApplicableHazards, TC: true, FL: true },
            },
            {
                key: 'riskScore',
                label: strings.riskBarChartRiskScoreLabel,
                applicableHazards: {
                    ...defaultApplicableHazards,
                    DR: true,
                    TC: true,
                    FL: true,
                    WF: true,
                },
            },
        ]),
        [strings],
    );

    const fiRiskDataItem = useMemo(
        () => getFiRiskDataItem(riskData?.ipc_displacement_data),
        [riskData],
    );
    const wfRiskDataItem = useMemo(
        () => getWfRiskDataItem(riskData?.gwis),
        [riskData],
    );

    const selectedRiskMetricDetail = useMemo(
        () => riskMetricOptions.find(
            (option) => option.key === selectedRiskMetric,
        ) ?? riskMetricOptions[0],
        [selectedRiskMetric, riskMetricOptions],
    );

    const hazardTypeList = useMemo(
        () => (
            unique(
                [
                    ...riskData?.idmc?.filter(hasSomeDefinedValue) ?? [],
                    ...riskData?.raster_displacement_data?.filter(hasSomeDefinedValue) ?? [],
                    ...riskData?.inform_seasonal?.filter(hasSomeDefinedValue) ?? [],
                    fiRiskDataItem,
                    wfRiskDataItem,
                ].filter(isDefined).map(getDataWithTruthyHazardType).filter(isDefined),
                (data) => data.hazard_type,
            ).map((combinedData) => ({
                hazard_type: combinedData.hazard_type,
                hazard_type_display: combinedData.hazard_type_display,
            })).filter(
                ({ hazard_type: hazard }) => selectedRiskMetricDetail?.applicableHazards[hazard],
            )
        ),
        [riskData, fiRiskDataItem, wfRiskDataItem, selectedRiskMetricDetail],
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
                    ipcData={riskData?.ipc_displacement_data}
                />
            )}
            {!pending && selectedHazardType === 'WF' && (
                <WildfireChart
                    gwisData={riskData?.gwis}
                />
            )}
            {!pending && selectedHazardType !== 'FI' && selectedHazardType !== 'WF' && (
                <CombinedChart
                    riskData={riskData}
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
