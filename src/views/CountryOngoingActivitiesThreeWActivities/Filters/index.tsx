import { useCallback, useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { EntriesAsList, type SetValueArg } from '@togglecorp/toggle-form';

import DistrictMultiCountrySearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictMultiCountrySearchMultiSelectInput';
import MultiSelectInput from '#components/MultiSelectInput';
import NationalSocietyMultiSelectInput from '#components/domain/NationalSocietyMultiSelectInput';
import type { GoApiResponse } from '#utils/restRequest';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useTranslation from '#hooks/useTranslation';
import { numericIdSelector, stringTitleSelector, stringValueSelector } from '#utils/selectors';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

type DeploymentsEmergencyProjectStatus = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['deployments_emergency_project_status']>[number];
export type FilterValue = Partial<{
    reporting_ns: number[];
    deployed_eru: number[];
    sector: number[];
    status: string[];
    districts: number[];
}>

function emergencyProjectStatusSelector(option: DeploymentsEmergencyProjectStatus) {
    return option.key;
}

interface Props {
    value: FilterValue;
    onChange: (value: SetValueArg<FilterValue>) => void;
    disabled?: boolean;
    countryId?: string;
}

function Filters(props: Props) {
    const {
        value,
        countryId,
        onChange,
        disabled,
    } = props;

    const [districtOptions, setDistrictOptions] = useState<DistrictItem[] | null | undefined>();
    const {
        response: emergencyProjectOptions,
        pending: emergencyProjectOptionsPending,
    } = useRequest({
        url: '/api/v2/emergency-project/options/',
        preserveResponse: true,
    });
    const {
        deployments_emergency_project_status: emergencyProjectStatusOptions,
    } = useGlobalEnums();

    const strings = useTranslation(i18n);

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
        <>
            <NationalSocietyMultiSelectInput
                name="reporting_ns"
                placeholder={strings.countryThreeWActivityFilterReportingNs}
                value={value.reporting_ns}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <NationalSocietyMultiSelectInput
                name="deployed_eru"
                placeholder={strings.countryThreeWActivityFilterEru}
                value={value.deployed_eru}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="sector"
                placeholder={strings.countryThreeWActivityFilterSector}
                options={emergencyProjectOptions?.sectors}
                value={value.sector}
                keySelector={numericIdSelector}
                labelSelector={stringTitleSelector}
                onChange={handleInputChange}
                disabled={disabled || emergencyProjectOptionsPending}
            />
            <MultiSelectInput
                name="status"
                placeholder={strings.countryThreeWActivityFilterStatus}
                options={emergencyProjectStatusOptions}
                value={value.status}
                keySelector={emergencyProjectStatusSelector}
                labelSelector={stringValueSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <DistrictMultiCountrySearchMultiSelectInput
                placeholder={strings.countryThreeWActivityFilterDistrict}
                name="districts"
                disabled={isNotDefined(countryId) || disabled}
                countryIds={[Number(countryId)]}
                onChange={handleInputChange}
                options={districtOptions}
                onOptionsChange={setDistrictOptions}
                value={value.districts}
            />
        </>
    );
}

export default Filters;
