import { useCallback, useEffect } from 'react';
import { isDefined, mapToList } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';
import { EntriesAsList } from '@togglecorp/toggle-form';
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
    applicableHazardsByRiskMetric,
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

    useEffect(
        () => {
            // TODO: figure out better way to set default value
            // NOTE: setting default value
            onChange((prevValue) => ({
                ...prevValue,
                countries: countryList.map((country) => country.iso3),
                months: Array.from(Array(11).keys()),
                hazardTypes: mapToList(
                    applicableHazardsByRiskMetric[prevValue.riskMetric],
                    (isApplicable, hazardType) => (isApplicable
                        ? hazardType as HazardType : undefined),
                ).filter(isDefined),
            }));
        },
        [countryList, onChange],
    );

    const handleChange = useCallback(
        (...args: EntriesAsList<FilterValue>) => {
            const [val, key] = args;
            onChange((prevValue): FilterValue => {
                if (key !== 'riskMetric') {
                    return {
                        ...prevValue,
                        [key]: val,
                    };
                }

                const applicableHazards = applicableHazardsByRiskMetric[val as RiskMetric];
                const hazardTypes = mapToList(
                    applicableHazards,
                    (isApplicable, hazardType) => (isApplicable
                        ? hazardType as HazardType : undefined),
                ).filter(isDefined);

                return {
                    ...prevValue,
                    riskMetric: val as RiskMetric,
                    hazardTypes,
                };
            });
        },
        [onChange],
    );

    return (
        <div className={styles.filters}>
            <MultiSelectInput
                // FIXME: use translation
                placeholder="All countries"
                name="countries"
                options={countryList}
                keySelector={countryKeySelector}
                labelSelector={stringNameSelector}
                value={value.countries}
                onChange={handleChange}
                showSelectAllButton
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
                showSelectAllButton
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
                showSelectAllButton
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
