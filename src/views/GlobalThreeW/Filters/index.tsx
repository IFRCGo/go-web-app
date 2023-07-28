import { useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { isValidNationalSociety } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryListItem = NonNullable<GoApiResponse<'/api/v2/country/'>['results']>[number];

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

function countryKeySelector(country: CountryListItem) {
    return country.id;
}

function countrySocietyNameSelector(country: CountryListItem) {
    return country.society_name ?? '';
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

    const { response: countriesResponse } = useRequest({
        url: '/api/v2/country/',
        query: { limit: 500 },
    });

    const { response: primarySectorResponse } = useRequest({
        url: '/api/v2/primarysector',
    });

    const { response: secondarySectorResponse } = useRequest({
        url: '/api/v2/secondarysector',
    });

    const { response: programmeTypeResponse } = useRequest({
        url: '/api/v2/programmetype',
    });

    const nsList = useMemo(
        () => countriesResponse?.results?.filter(isValidNationalSociety),
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
                options={nsList}
                value={value.reporting_ns}
                keySelector={countryKeySelector}
                labelSelector={countrySocietyNameSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.threeWFilterProgrammeTypes}
                // FIXME: typings should be fixed in the server
                options={programmeTypeResponse as { key: number, label: string }[]}
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
