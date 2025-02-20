import { useCallback } from 'react';
import {
    Checkbox,
    MultiSelectInput,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getMonthList,
    numericKeySelector,
    stringLabelSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import useCountry from '#hooks/domain/useCountry';
import {
    type HazardType,
    hazardTypeKeySelector,
    hazardTypeLabelSelector,
    type HazardTypeOption,
    type RiskMetric,
    riskMetricKeySelector,
    type RiskMetricOption,
} from '#utils/domain/risk';

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
        <>
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
            <div className={styles.additionalOptions}>
                <Checkbox
                    name="normalizeByPopulation"
                    label={strings.riskNormalize}
                    value={value.normalizeByPopulation}
                    onChange={handleChange}
                />
                {value.riskMetric === 'riskScore' && (
                    <Checkbox
                        name="includeCopingCapacity"
                        label={strings.riskCopingCapacity}
                        value={value.includeCopingCapacity}
                        onChange={handleChange}
                    />
                )}
            </div>
        </>
    );
}

export default Filters;
