import { _cs } from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';

import MultiSelectInput from '#components/MultiSelectInput';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse, useRequest } from '#utils/restRequest';
import {
    numericKeySelector,
    stringLabelSelector,
    stringValueSelector,
} from '#utils/selectors';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DeploymentsProjectStatus = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['deployments_project_status']>[number];

type DeploymentsProjectOperationType = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['deployments_project_operation_type']>[number];
type DeploymentsProjectProgrammeType = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['deployments_project_programme_type']>[number];

function projectStatusSelector(option: DeploymentsProjectStatus) {
    return option.key;
}
function projectOperationTypeSelector(option: DeploymentsProjectOperationType) {
    return option.key;
}
function projectProgrammeTypeSelector(option: DeploymentsProjectProgrammeType) {
    return option.key;
}
export interface FilterValue {
    operation_type: DeploymentsProjectOperationType['key'][];
    programme_type: DeploymentsProjectProgrammeType['key'][];
    primary_sector: number[];
    secondary_sectors: number[];
    status: DeploymentsProjectStatus['key'][];
}

interface Props {
    className?: string;
    value: FilterValue;
    onChange: (...value: EntriesAsList<FilterValue>) => void;
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
        deployments_project_status: projectStatusOptions,
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

    return (
        <div className={_cs(styles.filters, className)}>
            <MultiSelectInput
                name="operation_type"
                placeholder={strings.threeWFilterOperationTypes}
                options={projectOperationTypeOptions}
                value={value.operation_type}
                keySelector={projectOperationTypeSelector}
                labelSelector={stringValueSelector}
                onChange={onChange}
                disabled={disabled}
            />
            <MultiSelectInput
                name="programme_type"
                placeholder={strings.threeWFilterProgrammeTypes}
                options={programmeTypeOptions}
                value={value.programme_type}
                keySelector={projectProgrammeTypeSelector}
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
            <MultiSelectInput
                name="status"
                placeholder={strings.threeWFilterStatus}
                options={projectStatusOptions}
                value={value.status}
                keySelector={projectStatusSelector}
                labelSelector={stringValueSelector}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    );
}

export default Filters;
