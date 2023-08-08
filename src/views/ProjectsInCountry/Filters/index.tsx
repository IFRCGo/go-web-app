import { useMemo, useCallback, useContext } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { isValidNationalSociety } from '#utils/common';
import {
    numericIdSelector,
    numericKeySelector,
    stringLabelSelector,
    stringValueSelector,
    stringNameSelector,
} from '#utils/selectors';
import ServerEnumsContext from '#contexts/server-enums';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryListItem = NonNullable<GoApiResponse<'/api/v2/country/'>['results']>[number];
export interface FilterValue {
    reporting_ns: number[];
    project_districts: number[];
    operation_type: number[];
    programme_type: number[];
    primary_sector: number[];
    secondary_sectors: number[];
}

function countrySocietyNameSelector(country: CountryListItem) {
    return country.society_name ?? '';
}

interface Props {
    className?: string;
    value: FilterValue;
    onChange: React.Dispatch<React.SetStateAction<FilterValue>>;
    disabled?: boolean;
    countryId: number | undefined;
}

function Filters(props: Props) {
    const {
        className,
        value,
        onChange,
        disabled,
        countryId,
    } = props;

    const {
        deployments_project_operation_type: projectOperationTypeOptions,
        deployments_project_programme_type: programmeTypeOptions,
    } = useContext(ServerEnumsContext);
    const strings = useTranslation(i18n);

    const { response: countriesResponse } = useRequest({
        url: '/api/v2/country/',
        query: { limit: 500 },
    });

    const { response: districtsResponse } = useRequest({
        url: '/api/v2/district/',
        skip: isNotDefined(countryId),
        query: {
            country: countryId,
            limit: 100,
        },
    });

    const { response: primarySectorResponse } = useRequest({
        url: '/api/v2/primarysector',
    });

    const { response: secondarySectorResponse } = useRequest({
        url: '/api/v2/secondarysector',
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
                keySelector={numericIdSelector}
                labelSelector={countrySocietyNameSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="project_districts"
                placeholder={strings.threeWFilterProvinces}
                options={districtsResponse?.results}
                value={value.project_districts}
                keySelector={numericIdSelector}
                labelSelector={stringNameSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="operation_type"
                placeholder={strings.threeWFilterOperationTypes}
                options={projectOperationTypeOptions}
                value={value.operation_type}
                keySelector={numericKeySelector}
                labelSelector={stringValueSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.threeWFilterProgrammeTypes}
                options={programmeTypeOptions}
                value={value.programme_type}
                keySelector={numericKeySelector}
                labelSelector={stringValueSelector}
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
