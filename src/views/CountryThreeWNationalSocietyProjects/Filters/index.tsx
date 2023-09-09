import { _cs } from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import MultiSelectInput from '#components/MultiSelectInput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import useCountryRaw, { Country } from '#hooks/domain/useCountryRaw';
import {
    numericIdSelector,
    numericKeySelector,
    stringLabelSelector,
    stringValueSelector,
} from '#utils/selectors';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
    className?: string;
    value: FilterValue;
    onChange: (...args: EntriesAsList<FilterValue>) => void;
    disabled?: boolean;
}

function Filters(props: Props) {
    const {
        className,
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
        <div className={_cs(styles.filters, className)}>
            <MultiSelectInput
                name="project_country"
                placeholder={strings.threeWFilterReportingNs}
                options={countries}
                value={value.project_country}
                keySelector={numericIdSelector}
                labelSelector={countryNameSelector}
                onChange={onChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="operation_type"
                placeholder={strings.threeWFilterOperationTypes}
                options={projectOperationTypeOptions}
                value={value.operation_type}
                keySelector={numericKeySelector}
                labelSelector={stringValueSelector}
                onChange={onChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.threeWFilterProgrammeTypes}
                options={programmeTypeOptions}
                value={value.programme_type}
                keySelector={numericKeySelector}
                labelSelector={stringValueSelector}
                onChange={onChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="primary_sector"
                placeholder={strings.threeWFilterSectors}
                options={primarySectorResponse}
                value={value.primary_sector}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={onChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="secondary_sectors"
                placeholder={strings.threeWFilterTags}
                options={secondarySectorResponse}
                value={value.secondary_sectors}
                keySelector={numericKeySelector}
                labelSelector={stringLabelSelector}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    );
}

export default Filters;
