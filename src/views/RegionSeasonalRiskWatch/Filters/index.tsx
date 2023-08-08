import { useCallback, useMemo } from 'react';

import MultiSelectInput from '#components/MultiSelectInput';
// import type { Country } from '#hooks/useCountry';
import useCountry from '#hooks/useCountry';
import { numericKeySelector, stringLabelSelector, stringNameSelector } from '#utils/selectors';
import {
    hazardTypeKeySelector,
    hazardTypeLabelSelector,
    riskMetricKeySelector,
    type HazardType,
    type HazardTypeOption,
    type RiskMetricOption,
    type RiskMetric,
} from '#utils/risk';
import Checkbox from '#components/Checkbox';
import SelectInput from '#components/SelectInput';
import { getMonthList } from '#utils/common';

import styles from './styles.module.css';

function countryKeySelector(country: { iso3: string }) {
    return country.iso3;
}

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

    const countryList = useCountry({ region: regionId });
    const handleChange = useCallback(
        (
            newValue: string | string[] | HazardType[] | number[] | boolean,
            name: 'countries' | 'riskMetric' | 'hazardTypes' | 'months' | 'normalize' | 'includeCopingCapacity',
        ) => {
            onChange((prevValue) => ({
                ...prevValue,
                [name]: newValue,
            }));
        },
        [onChange],
    );

    return (
        <div className={styles.filters}>
            <MultiSelectInput
                placeholder="All countries"
                name="countries"
                options={countryList}
                keySelector={countryKeySelector}
                labelSelector={stringNameSelector}
                value={value.countries}
                onChange={handleChange}
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
                placeholder="Select hazard types"
                keySelector={hazardTypeKeySelector}
                labelSelector={hazardTypeLabelSelector}
                value={value.hazardTypes}
                onChange={handleChange}
            />
            <MultiSelectInput
                name="months"
                options={monthList}
                placeholder="Select months"
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                value={value.months}
                onChange={handleChange}
            />
            <Checkbox
                name="normalizeByPopulation"
                label="Normalize by population"
                value={value.normalizeByPopulation}
                onChange={handleChange}
            />
            <Checkbox
                name="includeCopingCapacity"
                label="Include coping capacity"
                value={value.includeCopingCapacity}
                onChange={handleChange}
            />
        </div>
    );
}

export default Filters;
