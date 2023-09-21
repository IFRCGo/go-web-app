import { useCallback } from 'react';

import MultiSelectInput from '#components/MultiSelectInput';
import { EntriesAsList } from '@togglecorp/toggle-form';
import {
    numericKeySelector,
    stringLabelSelector,
} from '#utils/selectors';
import {
    hazardTypeKeySelector,
    hazardTypeLabelSelector,
    riskMetricKeySelector,
    type HazardType,
    type HazardTypeOption,
    type RiskMetricOption,
    type RiskMetric,
} from '#utils/domain/risk';
import CountryIsoMultiSelectInput from '#components/domain/CountryIsoMultiSelectInput';
import Checkbox from '#components/Checkbox';
import SelectInput from '#components/SelectInput';
import { getMonthList } from '#utils/common';

import styles from './styles.module.css';

const monthList = getMonthList();

export interface FilterValue {
    countries: string[];
    months: number[];
    hazardTypes: HazardType[];
    riskMetric: RiskMetric;
    normalizeByPopulation: boolean;
    includeCopingCapacity: boolean;
}

interface Props {
    regionId?: number;
    value: FilterValue;
    onChange: React.Dispatch<React.SetStateAction<FilterValue>>;
    riskMetricOptions: RiskMetricOption[];
    hazardTypeOptions: HazardTypeOption[];
}

function Filters(props: Props) {
    const {
        regionId,
        value,
        onChange,
        riskMetricOptions,
        hazardTypeOptions,
    } = props;

    const handleChange = useCallback(
        (...args: EntriesAsList<FilterValue>) => {
            const [val, key] = args;
            onChange((prevValue): FilterValue => ({
                ...prevValue,
                [key]: val,
            }));
        },
        [onChange],
    );

    return (
        <div className={styles.filters}>
            <CountryIsoMultiSelectInput
                // FIXME: use translation
                placeholder="All countries"
                name="countries"
                value={value.countries}
                onChange={handleChange}
                regionFilter={regionId}
                withSelectAll
            />
            <SelectInput
                name="riskMetric"
                options={riskMetricOptions}
                keySelector={riskMetricKeySelector}
                labelSelector={stringLabelSelector}
                value={value.riskMetric}
                onChange={handleChange}
                nonClearable
            />
            <MultiSelectInput
                name="hazardTypes"
                options={hazardTypeOptions}
                // FIXME: use translation
                placeholder="Select hazard types"
                keySelector={hazardTypeKeySelector}
                labelSelector={hazardTypeLabelSelector}
                value={value.hazardTypes}
                onChange={handleChange}
                withSelectAll
            />
            <MultiSelectInput
                name="months"
                options={monthList}
                // FIXME: use translation
                placeholder="Select months"
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                value={value.months}
                onChange={handleChange}
                withSelectAll
            />
            {value.riskMetric === 'riskScore' && (
                <div className={styles.riskScoreAdditionalOptions}>
                    <Checkbox
                        name="normalizeByPopulation"
                        // FIXME: use translation
                        label="Normalize by population"
                        value={value.normalizeByPopulation}
                        onChange={handleChange}
                    />
                    <Checkbox
                        name="includeCopingCapacity"
                        // FIXME: use translation
                        label="Include coping capacity"
                        value={value.includeCopingCapacity}
                        onChange={handleChange}
                    />
                </div>
            )}
        </div>
    );
}

export default Filters;
