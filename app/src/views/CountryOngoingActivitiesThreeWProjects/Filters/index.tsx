import { useCallback } from 'react';
import { MultiSelectInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    numericKeySelector,
    stringLabelSelector,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety, { NationalSociety } from '#hooks/domain/useNationalSociety';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DistrictListItem = NonNullable<GoApiResponse<'/api/v2/district/'>['results']>[number];

export interface FilterValue {
    reporting_ns: number[];
    project_districts: number[];
    operation_type: number[];
    programme_type: number[];
    primary_sector: number[];
    secondary_sectors: number[];
}

function countrySocietyNameSelector(country: NationalSociety) {
    return country.society_name;
}

interface Props {
    className?: string;
    value: FilterValue;
    onChange: React.Dispatch<React.SetStateAction<FilterValue>>;
    disabled?: boolean;
    districtList: DistrictListItem[];
}

function Filters(props: Props) {
    const {
        className,
        value,
        onChange,
        disabled,
        districtList,
    } = props;

    const {
        deployments_project_operation_type: projectOperationTypeOptions,
        deployments_project_programme_type: programmeTypeOptions,
    } = useGlobalEnums();

    const strings = useTranslation(i18n);

    const { response: primarySectorResponse } = useRequest({
        url: '/api/v2/primarysector',
    });

    const { response: secondarySectorResponse } = useRequest({
        url: '/api/v2/secondarysector',
    });

    const nsList = useNationalSociety();

    const handleInputChange = useCallback((...args: EntriesAsList<FilterValue>) => {
        const [val, key] = args;
        if (onChange) {
            onChange((oldFilterValue) => {
                const newFilterValue = {
                    ...oldFilterValue,
                    [key]: val,
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
                options={districtList}
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
