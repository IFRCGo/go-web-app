import { useCallback } from 'react';

import { EntriesAsList } from '@togglecorp/toggle-form';

import MultiSelectInput from '#components/MultiSelectInput';
import Checkbox from '#components/Checkbox';
import SelectInput from '#components/SelectInput';
import useTranslation from '#hooks/useTranslation';
import useCountry from '#hooks/domain/useCountry';
import { getMonthList } from '#utils/common';
import {
    hazardTypeKeySelector,
    hazardTypeLabelSelector,
    riskMetricKeySelector,
    type HazardType,
    type HazardTypeOption,
    type RiskMetricOption,
    type RiskMetric,
} from '#utils/domain/risk';
import {
    numericKeySelector,
    stringLabelSelector,
    stringNameSelector,
} from '#utils/selectors';

import i18n from './i18n.json';
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

    const strings = useTranslation(i18n);

    const countryList = useCountry({ region: regionId });

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
            <MultiSelectInput
                placeholder={strings.riskAllCountries}
                name="countries"
                options={countryList}
                keySelector={countryKeySelector}
                labelSelector={stringNameSelector}
                value={value.countries}
                onChange={handleChange}
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
                placeholder={strings.riskSelectHazardTypes}
                keySelector={hazardTypeKeySelector}
                labelSelector={hazardTypeLabelSelector}
                value={value.hazardTypes}
                onChange={handleChange}
                withSelectAll
            />
            <MultiSelectInput
                name="months"
                options={monthList}
                placeholder={strings.riskSelectMonths}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                value={value.months}
                onChange={handleChange}
                withSelectAll
            />
            <div className={styles.riskScoreAdditionalOptions}>
                <Checkbox
                    name="normalizeByPopulation"
                    label={strings.riskNormalize}
                    value={value.normalizeByPopulation}
                    onChange={handleChange}
                />
                <Checkbox
                    name="includeCopingCapacity"
                    label={strings.riskCopingCapacity}
                    value={value.includeCopingCapacity}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}

export default Filters;
