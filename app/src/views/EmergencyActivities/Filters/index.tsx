import {
    useCallback,
    useState,
} from 'react';
import { MultiSelectInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringTitleSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type SetValueArg,
} from '@togglecorp/toggle-form';

import CountryMultiSelectInput from '#components/domain/CountryMultiSelectInput';
import DistrictMultiCountrySearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictMultiCountrySearchMultiSelectInput';
import NationalSocietyMultiSelectInput from '#components/domain/NationalSocietyMultiSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

type DeploymentsEmergencyProjectStatus = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['deployments_emergency_project_status']>[number];
export type FilterValue = Partial<{
    reporting_ns: number[];
    deployed_eru: number[];
    sector: number[];
    status: string[];
    country: number[];
    districts: number[];
}>

function emergencyProjectStatusSelector(option: DeploymentsEmergencyProjectStatus) {
    return option.key;
}

interface Props {
    value: FilterValue;
    onChange: (value: SetValueArg<FilterValue>) => void;
    disabled?: boolean;
}

function Filters(props: Props) {
    const {
        value,
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

    const handleCountryInputChange = useCallback(
        (newValue: number[]) => {
            onChange((oldFilterValue) => {
                const newFilterValue = {
                    ...oldFilterValue,
                    country: newValue,
                    districts: [],
                };

                return newFilterValue;
            });
        },
        [onChange],
    );

    return (
        <>
            <NationalSocietyMultiSelectInput
                name="reporting_ns"
                placeholder={strings.emergencyActivityFilterReportingNs}
                value={value.reporting_ns}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <NationalSocietyMultiSelectInput
                name="deployed_eru"
                placeholder={strings.emergencyActivityFilterEru}
                value={value.deployed_eru}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="sector"
                placeholder={strings.emergencyActivityFilterSector}
                options={emergencyProjectOptions?.sectors}
                value={value.sector}
                keySelector={numericIdSelector}
                labelSelector={stringTitleSelector}
                onChange={handleInputChange}
                disabled={disabled || emergencyProjectOptionsPending}
            />
            <MultiSelectInput
                name="status"
                placeholder={strings.emergencyActivityFilterStatus}
                options={emergencyProjectStatusOptions}
                value={value.status}
                keySelector={emergencyProjectStatusSelector}
                labelSelector={stringValueSelector}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <CountryMultiSelectInput
                name="country"
                placeholder={strings.emergencyActivityFilterCountry}
                value={value.country}
                onChange={handleCountryInputChange}
                disabled={disabled}
            />
            <DistrictMultiCountrySearchMultiSelectInput
                placeholder={strings.emergencyActivityFilterDistrict}
                name="districts"
                disabled={isNotDefined(value.country) || disabled
                    || (isDefined(value.country) && value.country.length < 1)}
                countryIds={value?.country}
                onChange={handleInputChange}
                options={districtOptions}
                onOptionsChange={setDistrictOptions}
                value={value.districts}
            />
        </>
    );
}

export default Filters;
