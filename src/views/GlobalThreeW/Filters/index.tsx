import { useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';
import { useRequest, ListResponse } from '#utils/restRequest';
import { isValidCountry } from '#utils/common';
import useTranslation from '#hooks/useTranslation';
import type { Country } from '#types/country';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface SectorItem {
    key: number;
    label: string;
    color: string | null;
    is_deprecated: boolean;
}

interface ProgrammeType {
    key: number;
    label: string;
}

export interface FilterValue {
    reporting_ns: number[];
    programme_type: number[];
    primary_sector: number[];
    secondary_sectors: number[];
}

function numericKeySelector<D extends { key: number }>(d: D) {
    return d.key;
}

function stringLabelSelector<D extends { label: string }>(d: D) {
    return d.label;
}

function countryKeySelector(country: Country) {
    return country.id;
}

function countrySocietyNameSelector(country: Country) {
    return country.society_name;
}

interface Props {
    className?: string;
    value: FilterValue;
    onChange: React.Dispatch<React.SetStateAction<FilterValue>>;
    disabled?: boolean;
}

function Filters(props: Props) {
    const {
        className,
        value,
        onChange,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const { response: countriesResponse } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const { response: primarySectorResponse } = useRequest<SectorItem[]>({
        url: 'api/v2/primarysector/',
    });

    const { response: secondarySectorResponse } = useRequest<SectorItem[]>({
        url: 'api/v2/secondarysector/',
    });

    const { response: programmeTypeResponse } = useRequest<ProgrammeType[]>({
        url: 'api/v2/programmetype/',
    });

    const countryList = useMemo(
        () => countriesResponse?.results.filter(
            (country) => isValidCountry(country) && !!country.society_name,
        ),
        [countriesResponse],
    );

    const handleInputChange = useCallback((newValue: number[], name: string) => {
        if (onChange) {
            onChange((oldFilterValue) => {
                const newFilterValue = {
                    ...oldFilterValue,
                    [name]: newValue,
                };

                return newFilterValue;
            });
        }
    }, [onChange]);

    return (
        <div className={_cs(styles.filters, className)}>
            <MultiSelectInput
                name="reporting_ns"
                placeholder={strings.threeWFilterReportingNs}
                options={countryList}
                value={value.reporting_ns}
                keySelector={countryKeySelector}
                labelSelector={countrySocietyNameSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.threeWFilterProgrammeTypes}
                options={programmeTypeResponse}
                value={value.programme_type}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="primary_sector"
                placeholder={strings.threeWFilterSectors}
                options={primarySectorResponse}
                value={value.primary_sector}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="secondary_sectors"
                placeholder={strings.threeWFilterTags}
                options={secondarySectorResponse}
                value={value.secondary_sectors}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
        </div>
    );
}

export default Filters;
