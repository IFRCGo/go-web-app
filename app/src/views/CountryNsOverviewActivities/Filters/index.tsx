import { MultiSelectInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    numericKeySelector,
    stringLabelSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { EntriesAsList } from '@togglecorp/toggle-form';

import useCountryRaw, { Country } from '#hooks/domain/useCountryRaw';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

function countryNameSelector(country: Country) {
    return country.name ?? country.id.toString();
}

export interface FilterValue {
    project_country?: number[];
    operation_type?: number[];
    programme_type?: number[];
    primary_sector?: number[];
    secondary_sectors?: number[];
}

interface Props {
    value: FilterValue;
    onChange: (...args: EntriesAsList<FilterValue>) => void;
    disabled?: boolean;
}

function Filters(props: Props) {
    const {
        value,
        onChange,
        disabled,
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

    const countries = useCountryRaw();

    return (
        <>
            <MultiSelectInput
                name="project_country"
                placeholder={strings.nSFilterReportingNs}
                options={countries}
                value={value.project_country}
                keySelector={numericIdSelector}
                labelSelector={countryNameSelector}
                onChange={onChange}
                disabled={disabled}
                withSelectAll
            />
            <MultiSelectInput
                name="operation_type"
                placeholder={strings.nSFilterOperationTypes}
                options={projectOperationTypeOptions}
                value={value.operation_type}
                keySelector={numericKeySelector}
                labelSelector={stringValueSelector}
                onChange={onChange}
                disabled={disabled}
                withSelectAll
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.nSFilterProgrammeTypes}
                options={programmeTypeOptions}
                value={value.programme_type}
                keySelector={numericKeySelector}
                labelSelector={stringValueSelector}
                onChange={onChange}
                disabled={disabled}
                withSelectAll
            />
            <MultiSelectInput
                name="primary_sector"
                placeholder={strings.nSFilterSectors}
                options={primarySectorResponse}
                value={value.primary_sector}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={onChange}
                disabled={disabled}
                withSelectAll
            />
            <MultiSelectInput
                name="secondary_sectors"
                placeholder={strings.nSFilterTags}
                options={secondarySectorResponse}
                value={value.secondary_sectors}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={onChange}
                disabled={disabled}
                withSelectAll
            />
        </>
    );
}

export default Filters;
