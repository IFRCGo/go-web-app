import { useCallback } from 'react';
import { MultiSelectInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericKeySelector,
    stringLabelSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import NationalSocietyMultiSelectInput from '#components/domain/NationalSocietyMultiSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface FilterValue {
    reporting_ns: number[];
    programme_type: number[];
    primary_sector: number[];
    secondary_sectors: number[];
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

    const {
        deployments_project_programme_type: programmeTypeOptions,
    } = useGlobalEnums();
    const strings = useTranslation(i18n);

    const { response: primarySectorResponse } = useRequest({
        url: '/api/v2/primarysector',
    });

    const { response: secondarySectorResponse } = useRequest({
        url: '/api/v2/secondarysector',
    });

    const handleInputChange = useCallback((newValue: number[] | undefined, name: string) => {
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
            <NationalSocietyMultiSelectInput
                name="reporting_ns"
                placeholder={strings.threeWFilterReportingNs}
                value={value.reporting_ns}
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
